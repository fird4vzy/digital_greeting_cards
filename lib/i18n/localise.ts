import type { MoodId, OccasionId, RecipientId } from '@/lib/card/taxonomy';
import { MOODS, OCCASIONS, RECIPIENTS } from '@/lib/card/taxonomy';
import type { TemplateSummary } from '@/lib/card/template';
import type { Dictionary, TemplateStrings } from './types';

/**
 * Overlays translated strings onto structural data.
 *
 * The taxonomy and the template registry stay the single source of truth for
 * *structure* — which occasions exist, which sections a template supports,
 * what its palette is. Only the human-readable strings come from a dictionary,
 * and they are merged in here at render time.
 *
 * Keeping the English strings on the definitions themselves is deliberate: a
 * template file still reads as a complete description of the template, and a
 * locale that is missing a translation degrades to English rather than to a
 * blank card.
 */

export type LocalisedOccasion = { id: OccasionId; motif: (typeof OCCASIONS)[number]['motif']; label: string; line: string };
export type LocalisedMood = { id: MoodId; label: string; line: string };
export type LocalisedRecipient = { id: RecipientId; label: string; suggests: readonly string[] };
export type LocalisedTemplate = TemplateSummary & TemplateStrings;

export function localisedOccasions(dictionary: Dictionary): LocalisedOccasion[] {
  return OCCASIONS.map((occasion) => ({
    id: occasion.id,
    motif: occasion.motif,
    label: dictionary.content.occasions[occasion.id]?.label ?? occasion.label,
    line: dictionary.content.occasions[occasion.id]?.line ?? occasion.line,
  }));
}

export function localisedMoods(dictionary: Dictionary): LocalisedMood[] {
  return MOODS.map((mood) => ({
    id: mood.id,
    label: dictionary.content.moods[mood.id]?.label ?? mood.label,
    line: dictionary.content.moods[mood.id]?.line ?? mood.line,
  }));
}

export function localisedRecipients(dictionary: Dictionary): LocalisedRecipient[] {
  return RECIPIENTS.map((recipient) => ({
    id: recipient.id,
    label: dictionary.content.recipients[recipient.id] ?? recipient.label,
    suggests: recipient.suggests,
  }));
}

export function occasionLabel(id: string, dictionary: Dictionary): string {
  return dictionary.content.occasions[id as OccasionId]?.label ?? id;
}

export function moodLabel(id: string, dictionary: Dictionary): string {
  return dictionary.content.moods[id as MoodId]?.label ?? id;
}

export function recipientLabel(id: string, dictionary: Dictionary): string {
  return dictionary.content.recipients[id as RecipientId] ?? id;
}

export function localiseTemplate(
  template: TemplateSummary,
  dictionary: Dictionary,
): LocalisedTemplate {
  const strings = dictionary.content.templates[template.id];
  return {
    ...template,
    name: strings?.name ?? template.name,
    tagline: strings?.tagline ?? template.tagline,
    description: strings?.description ?? template.description,
    animationStyle: strings?.animationStyle ?? template.animationStyle,
  };
}

export function localiseTemplates(
  templates: TemplateSummary[],
  dictionary: Dictionary,
): LocalisedTemplate[] {
  return templates.map((template) => localiseTemplate(template, dictionary));
}
