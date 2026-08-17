import type { StoryInput, TemplateDefinition, TemplateSummary } from '@/lib/card/template';
import { toSummary } from '@/lib/card/template';
import { aloudTemplate } from './aloud';
import { anniversaryTemplate } from './anniversary';
import { birthdayTemplate } from './birthday';
import { memoriesTemplate } from './memories';
import { momTemplate } from './mom';
import { romanticTemplate } from './romantic';
import { sakuraTemplate } from './sakura';
import { windowTemplate } from './window';

/**
 * THE TEMPLATE REGISTRY
 * Adding a template to the product is exactly one import and one array entry.
 * Gallery, creation flow, admin and renderer all read from here.
 */
const registry: TemplateDefinition[] = [
  romanticTemplate,
  birthdayTemplate,
  momTemplate,
  anniversaryTemplate,
  memoriesTemplate,
  sakuraTemplate,
  aloudTemplate,
  windowTemplate,
];

const byId = new Map(registry.map((template) => [template.id, template]));

export const DEFAULT_TEMPLATE_ID = romanticTemplate.id;

export function listTemplates(): TemplateDefinition[] {
  return registry;
}

/** Server-safe summaries (no functions) for passing into client components. */
export function listTemplateSummaries(): TemplateSummary[] {
  return registry.map(toSummary);
}

export function getTemplate(id: string): TemplateDefinition | undefined {
  return byId.get(id);
}

/** Never throws — an unknown id falls back to the flagship template. */
export function resolveTemplate(id: string | undefined | null): TemplateDefinition {
  return (id ? byId.get(id) : undefined) ?? romanticTemplate;
}

export function templatesForOccasion(occasion: string): TemplateDefinition[] {
  const matches = registry.filter((template) => template.occasions.includes(occasion as never));
  return matches.length > 0 ? matches : registry;
}

/**
 * Ranks templates against a story. Used by the creation flow to pre-select a
 * sensible template, and by the AI planner as a deterministic fallback when no
 * model is configured.
 */
export function scoreTemplate(template: TemplateDefinition, input: Pick<StoryInput, 'occasion' | 'mood' | 'photos' | 'moments'>): number {
  let score = 0;
  if (template.occasions.includes(input.occasion as never)) score += 5;
  if (template.moods.includes(input.mood as never)) score += 3;

  const photoCount = input.photos?.length ?? 0;
  if (photoCount >= 6 && template.id === 'memories') score += 3;
  if (photoCount === 0 && template.scene !== 'none') score += 1;
  if ((input.moments?.length ?? 0) >= 3 && template.supportedSections.includes('timeline')) score += 2;

  return score;
}

export function recommendTemplate(
  input: Pick<StoryInput, 'occasion' | 'mood' | 'photos' | 'moments'>,
): TemplateDefinition {
  return [...registry].sort((a, b) => scoreTemplate(b, input) - scoreTemplate(a, input))[0] ?? romanticTemplate;
}
