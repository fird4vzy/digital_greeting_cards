import { copyFor } from '@/lib/card/copy';
import type { Photo } from '@/lib/card/schema';
import type { StoryInput } from '@/lib/card/template';
import { MOODS, OCCASIONS, RECIPIENTS, type MoodId, type OccasionId, type RecipientId } from '@/lib/card/taxonomy';
import { recommendTemplate } from '@/templates';
import { plannerSystemPrompt, plannerUserPrompt } from './prompt';
import { CARD_PLAN_JSON_SCHEMA, cardPlanSchema, type CardPlan } from './schema';

/**
 * THE PLANNER
 *
 * Two implementations behind one interface:
 *
 *   HeuristicPlanner — deterministic, offline, zero-cost. Runs today, keeps
 *                      the creation flow working with no API key configured,
 *                      and is the fallback whenever the model is unavailable
 *                      or declines.
 *   ClaudePlanner    — the real thing. Same output type, same constraints.
 *
 * Because both satisfy `CardPlanner`, turning the AI layer on is an
 * environment variable, not a refactor.
 */

export type PlannerInput = {
  brief: string;
  hints?: {
    recipientName?: string;
    senderName?: string;
    relationship?: string;
    occasion?: string;
    mood?: string;
  };
};

export type PlannerResult =
  | { ok: true; plan: CardPlan; source: 'claude' | 'heuristic' }
  | { ok: false; error: string };

export interface CardPlanner {
  readonly id: 'claude' | 'heuristic';
  plan(input: PlannerInput): Promise<PlannerResult>;
}

/* -------------------------------------------------------------------------- */
/* Heuristic                                                                   */
/* -------------------------------------------------------------------------- */

const OCCASION_HINTS: Record<OccasionId, RegExp> = {
  love: /\b(love|girlfriend|boyfriend|wife|husband|partner|in love|valentine)\b/i,
  birthday: /\b(birthday|turns? \d+|bday)\b/i,
  'for-mom': /\b(mom|mum|mother|mama|mamma)\b/i,
  anniversary: /\b(anniversar|years together|\d+ years)\b/i,
  friendship: /\b(friend|best mate|bestie)\b/i,
  celebration: /\b(congrat|graduat|promotion|new job|passed|won|finished)\b/i,
  'just-because': /\b(just because|no reason|thinking of)\b/i,
};

const MOOD_HINTS: Record<MoodId, RegExp> = {
  romantic: /\b(romantic|love|intimate|candle)\b/i,
  warm: /\b(warm|cosy|cozy|gentle|kind)\b/i,
  cute: /\b(cute|playful|silly|sweet)\b/i,
  elegant: /\b(elegant|classy|refined|formal|understated)\b/i,
  funny: /\b(funny|joke|laugh|humou?r)\b/i,
  minimal: /\b(minimal|simple|clean|restrained|quiet)\b/i,
  dreamy: /\b(dream|soft|ethereal|floaty)\b/i,
};

function matchFirst<T extends string>(text: string, table: Record<T, RegExp>, fallback: T): T {
  for (const [id, pattern] of Object.entries(table) as [T, RegExp][]) {
    if (pattern.test(text)) return id;
  }
  return fallback;
}

function guessRecipient(text: string, occasion: OccasionId): RecipientId {
  const direct = RECIPIENTS.find((recipient) =>
    new RegExp(`\\b${recipient.label.toLowerCase()}\\b`, 'i').test(text),
  );
  if (direct) return direct.id;

  if (occasion === 'for-mom') return 'mom';
  if (occasion === 'friendship') return 'friend';
  if (occasion === 'love' || occasion === 'anniversary') return 'girlfriend';
  return 'someone-special';
}

/** Pulls a plausible name out of "for Alina", "my girlfriend Alina", etc. */
function guessName(text: string): string {
  const patterns = [
    /\bfor\s+([A-Z][a-zà-ÿ]+)/,
    /\b(?:girlfriend|boyfriend|wife|husband|friend|mom|mum|mother|dad|father)\s+(?:is\s+)?(?:called\s+|named\s+)?([A-Z][a-zà-ÿ]+)/,
    /\b([A-Z][a-zà-ÿ]+)(?:'s| is)\s+(?:birthday|turning)/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1];
  }
  return '';
}

export const heuristicPlanner: CardPlanner = {
  id: 'heuristic',

  async plan({ brief, hints }: PlannerInput): Promise<PlannerResult> {
    const text = brief ?? '';

    const occasion = (hints?.occasion as OccasionId) ?? matchFirst(text, OCCASION_HINTS, 'just-because');
    const mood = (hints?.mood as MoodId) ?? matchFirst(text, MOOD_HINTS, 'warm');
    const recipient = (hints?.relationship as RecipientId) ?? guessRecipient(text, occasion);
    const recipientName = hints?.recipientName?.trim() || guessName(text) || 'You';
    const senderName = hints?.senderName?.trim() || 'Me';

    const copy = copyFor(occasion);
    const template = recommendTemplate({ occasion, mood, photos: [], moments: [] });

    const plan: CardPlan = {
      recipient,
      recipientName,
      senderName,
      occasion,
      mood,
      visualTheme: '',
      template: template.id,
      letter: text.trim() || copy.fallbackLetter(recipientName),
      quote: copy.quote,
      finalMessage: copy.finalHeadline,
      moments: [],
      memories: [],
      wishes: [],
      rationale: `Matched on occasion "${OCCASIONS.find((o) => o.id === occasion)?.label}" and mood "${MOODS.find((m) => m.id === mood)?.label}".`,
    };

    const parsed = cardPlanSchema.safeParse(plan);
    if (!parsed.success) return { ok: false, error: 'Could not build a plan from that brief.' };

    return { ok: true, plan: parsed.data, source: 'heuristic' };
  },
};

/* -------------------------------------------------------------------------- */
/* Claude                                                                      */
/* -------------------------------------------------------------------------- */

export const claudePlanner: CardPlanner = {
  id: 'claude',

  async plan(input: PlannerInput): Promise<PlannerResult> {
    const { default: Anthropic } = await import('@anthropic-ai/sdk');
    const client = new Anthropic();

    const response = await client.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 8000,
      // Selecting a template and rewriting a short letter is a bounded task;
      // low effort keeps this inside the latency budget of a form submission.
      output_config: {
        effort: 'low',
        format: {
          type: 'json_schema',
          schema: CARD_PLAN_JSON_SCHEMA,
        },
      },
      // Recommended default on Opus 5: a policy decline is re-run server-side
      // rather than surfacing to the customer mid-checkout.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: plannerSystemPrompt(),
      messages: [{ role: 'user', content: plannerUserPrompt(input.brief, input.hints) }],
    });

    if (response.stop_reason === 'refusal') {
      return { ok: false, error: 'The assistant declined to write this card.' };
    }

    const text = response.content.find((block) => block.type === 'text');
    if (!text || text.type !== 'text') {
      return { ok: false, error: 'The assistant returned no content.' };
    }

    let raw: unknown;
    try {
      raw = JSON.parse(text.text);
    } catch {
      return { ok: false, error: 'The assistant returned malformed configuration.' };
    }

    const parsed = cardPlanSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: `Configuration failed validation: ${parsed.error.issues[0]?.message}` };
    }

    return { ok: true, plan: parsed.data, source: 'claude' };
  },
};

/* -------------------------------------------------------------------------- */

export function isAiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getPlanner(): CardPlanner {
  return isAiEnabled() ? claudePlanner : heuristicPlanner;
}

/**
 * Runs the configured planner and falls back to the heuristic on any failure.
 * A customer mid-checkout must always get a card, so the model is treated as
 * an enhancement, never as a dependency.
 */
export async function planCard(input: PlannerInput): Promise<PlannerResult> {
  const planner = getPlanner();

  try {
    const result = await planner.plan(input);
    if (result.ok) return result;
    if (planner.id === 'heuristic') return result;
    console.warn('[ai] planner failed, falling back to heuristic:', result.error);
  } catch (error) {
    console.warn('[ai] planner threw, falling back to heuristic:', error);
  }

  return heuristicPlanner.plan(input);
}

/** Bridges an AI plan into the same input the manual creation flow produces. */
export function planToStoryInput(plan: CardPlan, photos: Photo[] = []): StoryInput {
  return {
    recipientName: plan.recipientName,
    senderName: plan.senderName,
    relationship: plan.recipient,
    occasion: plan.occasion,
    mood: plan.mood,
    story: plan.letter,
    photos,
    moments: plan.moments,
    memories: plan.memories,
    wishes: plan.wishes,
  };
}
