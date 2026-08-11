import { z } from 'zod';
import { MOODS, OCCASIONS, RECIPIENTS } from '@/lib/card/taxonomy';
import { listTemplates } from '@/templates';

/**
 * THE AI CONTRACT
 * ===============
 * The single most important rule of the AI layer: **the model never writes
 * markup**. It reads a person's natural-language brief and returns this
 * object — a selection of an existing template plus structured content for
 * the existing section components.
 *
 * Everything downstream is the same code path a hand-built card takes:
 *
 *   brief → CardPlan (this file) → StoryInput → template.compose() → CardConfig
 *
 * That means an AI-authored card cannot render anything a human-authored card
 * could not, cannot inject styles, and cannot break when the template library
 * changes. The blast radius of a bad model output is a poorly worded card.
 */

const occasionIds = OCCASIONS.map((o) => o.id) as [string, ...string[]];
const moodIds = MOODS.map((m) => m.id) as [string, ...string[]];
const recipientIds = RECIPIENTS.map((r) => r.id) as [string, ...string[]];
const templateIds = listTemplates().map((t) => t.id) as [string, ...string[]];

export const cardPlanSchema = z.object({
  /** Who the card is for, as a relationship from our taxonomy. */
  recipient: z.enum(recipientIds),
  /** Their actual name, as the customer wrote it. */
  recipientName: z.string(),
  senderName: z.string(),
  occasion: z.enum(occasionIds),
  mood: z.enum(moodIds),
  /** Free text: flowers, places, colours the customer mentioned. Advisory. */
  visualTheme: z.string(),
  /** Must be one of the registered templates — enum-constrained, not free text. */
  template: z.enum(templateIds),
  /**
   * The letter, written in the customer's voice. This is the only long-form
   * text the model produces, and it renders as plain paragraphs.
   */
  letter: z.string(),
  quote: z.string(),
  finalMessage: z.string(),
  moments: z
    .array(z.object({ date: z.string(), title: z.string(), text: z.string() }))
    .max(8),
  memories: z.array(z.object({ label: z.string(), text: z.string() })).max(6),
  wishes: z.array(z.string()).max(6),
  /** One sentence explaining the template choice, shown to operators in admin. */
  rationale: z.string(),
});

export type CardPlan = z.infer<typeof cardPlanSchema>;

/**
 * Structured outputs require every object to be closed and every property
 * listed as required. zod's JSON Schema emitter leaves objects open and omits
 * defaulted keys, so we tighten the result rather than hand-maintaining a
 * second copy of the schema.
 */
export function strictJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const json = z.toJSONSchema(schema, { io: 'input' }) as Record<string, unknown>;

  const close = (node: unknown): void => {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      node.forEach(close);
      return;
    }

    const record = node as Record<string, unknown>;

    if (record.type === 'object' && record.properties && typeof record.properties === 'object') {
      record.additionalProperties = false;
      record.required = Object.keys(record.properties as Record<string, unknown>);
    }

    Object.values(record).forEach(close);
  };

  close(json);
  delete json.$schema;
  return json;
}

export const CARD_PLAN_JSON_SCHEMA = strictJsonSchema(cardPlanSchema);
