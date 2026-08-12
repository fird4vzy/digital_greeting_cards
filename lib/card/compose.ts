import { cardStrings, copyFor, coverHeadline, openPrompt } from './copy';
import type { CardSection, SectionKind } from './schema';
import type { SectionVariant, SectionVariants } from './variants';
import type { StoryInput } from './template';

/**
 * Composition helpers shared by every template.
 *
 * Templates differ in *which* beats they play and *how* those beats look ??
 * not in how the customer's raw input is turned into content. That derivation
 * lives here, once.
 */

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;
export type SectionDraft = DistributiveOmit<CardSection, 'id'>;

/** Stamps stable, human-readable ids: `gallery`, `gallery-2`, … */
export function withIds(drafts: SectionDraft[]): CardSection[] {
  const counts = new Map<string, number>();

  return drafts.map((draft) => {
    const next = (counts.get(draft.type) ?? 0) + 1;
    counts.set(draft.type, next);
    const id = next === 1 ? draft.type : `${draft.type}-${next}`;
    return { ...draft, id } as CardSection;
  });
}

/** Drops beats a template does not support, preserving order. */
export function keepSupported(sections: CardSection[], supported: SectionKind[]): CardSection[] {
  const allowed = new Set<SectionKind>(supported);
  return sections.filter((section) => allowed.has(section.type));
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name.trim();
}

/**
 * The customer's own words always win. The copy bank is only a safety net for
 * an empty story field — a card should never be published looking unfinished.
 */
export function letterBody(input: StoryInput): string {
  const written = input.story?.trim();
  if (written && written.length > 0) return written;
  return copyFor(input.occasion, input.locale).fallbackLetter(firstName(input.recipientName));
}

export function hasPhotos(input: StoryInput): boolean {
  return (input.photos?.length ?? 0) > 0;
}

export function timelineEntries(input: StoryInput) {
  return (input.moments ?? []).map((moment, index) => ({
    id: `moment-${index + 1}`,
    date: moment.date,
    title: moment.title,
    text: moment.text,
  }));
}

export function memoryItems(input: StoryInput) {
  return (input.memories ?? []).map((memory, index) => ({
    id: `memory-${index + 1}`,
    label: memory.label,
    text: memory.text,
  }));
}

/**
 * The canonical arc. Six of six launch templates are variations on this ??
 * they reorder it, drop beats, or swap variants, but the emotional shape
 * (arrive → open → hear → see → remember → be told → be signed off) holds.
 */
export function standardArc(
  input: StoryInput,
  options: {
    envelopeVariant?: SectionVariant<'envelope'>;
    /** Beats to omit even if data exists, e.g. a minimal template. */
    exclude?: SectionKind[];
  } = {},
): CardSection[] {
  const copy = copyFor(input.occasion, input.locale);
  const strings = cardStrings(input.locale);
  const recipient = firstName(input.recipientName);
  const moments = timelineEntries(input);
  const memories = memoryItems(input);
  const exclude = new Set(options.exclude ?? []);

  const drafts: SectionDraft[] = [
    {
      type: 'cover',
      recipientName: recipient,
      headline: coverHeadline(input.locale),
      subline: undefined,
      hint: strings.scrollGently,
    },
    {
      // The prompt is always derived, never passed in. Templates used to hand
      // over a literal ("Open it", "Pull the ribbon"), which shadowed this call
      // and printed English on Russian and Uzbek cards — the strings they
      // passed were word-for-word the English dictionary entries, so the bug
      // was invisible in English and total everywhere else. A template that
      // wants different wording adds a dictionary key.
      type: 'envelope',
      prompt: openPrompt(options.envelopeVariant, input.locale),
      variant: options.envelopeVariant,
      note: undefined,
    },
    { type: 'intro', text: copy.intro },
    {
      type: 'letter',
      salutation: undefined,
      body: letterBody(input),
      signature: undefined,
    },
  ];

  if (hasPhotos(input)) {
    drafts.push({
      type: 'gallery',
      title: copy.galleryTitle,
      photos: input.photos,
    });
  }

  if (moments.length > 0) {
    drafts.push({ type: 'timeline', title: copy.timelineTitle, entries: moments });
  }

  drafts.push({ type: 'quote', text: copy.quote });

  if (memories.length > 0) {
    drafts.push({ type: 'memories', title: copy.memoriesTitle, items: memories });
  }

  if ((input.wishes?.length ?? 0) > 0) {
    drafts.push({ type: 'wishes', title: strings.wishesTitle, items: input.wishes ?? [] });
  }

  drafts.push(
    { type: 'final', headline: copy.finalHeadline, text: copy.finalText },
    { type: 'closing', signOff: copy.signOff, from: input.senderName || 'Me' },
  );

  return withIds(drafts.filter((draft) => !exclude.has(draft.type)));
}

/** Applies a template's per-section look to a composed section list. */
export function applyVariants(
  sections: CardSection[],
  variants: SectionVariants,
): CardSection[] {
  return sections.map((section) => {
    const variant = section.variant ?? variants[section.type];
    return variant ? ({ ...section, variant } as CardSection) : section;
  });
}
