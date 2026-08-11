import { z } from 'zod';

/**
 * THE CONTRACT
 * ============
 * A published card is data, never markup. This file is the only definition of
 * what that data may contain — the creation flow writes it, the database
 * stores it, the renderer reads it, and the future AI layer is constrained to
 * emitting exactly this shape.
 *
 * Adding a new kind of storytelling beat = adding one member to
 * `cardSectionSchema` plus one component in `components/cards/sections`.
 * Nothing else in the application needs to change.
 */

export const photoSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  /** Intrinsic size, when known, so the renderer can reserve space (no CLS). */
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** object-position for art-directed crops, e.g. "50% 30%". */
  focal: z.string().optional(),
});

export type Photo = z.infer<typeof photoSchema>;

/** Fields every section shares. `variant` lets a template restyle a section
 *  without forking the component. */
const sectionBase = {
  id: z.string(),
  variant: z.string().optional(),
};

export const SECTION_KINDS = [
  'cover',
  'envelope',
  'intro',
  'letter',
  'gallery',
  'timeline',
  'memories',
  'quote',
  'wishes',
  'final',
  'closing',
] as const;

export type SectionKind = (typeof SECTION_KINDS)[number];

/** Screen one. The name, and the promise that something is waiting. */
export const coverSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('cover'),
  recipientName: z.string(),
  headline: z.string(),
  subline: z.string().optional(),
  hint: z.string().optional(),
});

/** The gate: nothing is revealed until they open it. */
export const envelopeSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('envelope'),
  prompt: z.string().optional(),
  seal: z.string().optional(),
  note: z.string().optional(),
});

export const introSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('intro'),
  eyebrow: z.string().optional(),
  text: z.string(),
});

export const letterSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('letter'),
  salutation: z.string().optional(),
  /** Blank-line separated paragraphs. Rendered one at a time as you scroll. */
  body: z.string(),
  signature: z.string().optional(),
});

export const gallerySectionSchema = z.object({
  ...sectionBase,
  type: z.literal('gallery'),
  title: z.string().optional(),
  caption: z.string().optional(),
  photos: z.array(photoSchema).default([]),
});

export const timelineEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  text: z.string().optional(),
  photo: photoSchema.optional(),
});

export const timelineSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('timeline'),
  title: z.string().optional(),
  entries: z.array(timelineEntrySchema).default([]),
});

export const memoriesSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('memories'),
  title: z.string().optional(),
  items: z
    .array(z.object({ id: z.string(), label: z.string(), text: z.string() }))
    .default([]),
});

export const quoteSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('quote'),
  text: z.string(),
  attribution: z.string().optional(),
});

export const wishesSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('wishes'),
  title: z.string().optional(),
  items: z.array(z.string()).default([]),
});

export const finalSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('final'),
  headline: z.string(),
  text: z.string().optional(),
});

export const closingSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('closing'),
  signOff: z.string(),
  from: z.string(),
  note: z.string().optional(),
});

export const cardSectionSchema = z.discriminatedUnion('type', [
  coverSectionSchema,
  envelopeSectionSchema,
  introSectionSchema,
  letterSectionSchema,
  gallerySectionSchema,
  timelineSectionSchema,
  memoriesSectionSchema,
  quoteSectionSchema,
  wishesSectionSchema,
  finalSectionSchema,
  closingSectionSchema,
]);

export type CardSection = z.infer<typeof cardSectionSchema>;
export type SectionOfKind<K extends SectionKind> = Extract<CardSection, { type: K }>;

export const CARD_CONFIG_VERSION = 1;

export const cardConfigSchema = z.object({
  version: z.number().int().default(CARD_CONFIG_VERSION),
  templateId: z.string(),
  /** Optional palette override — lets one template ship several colourways. */
  paletteId: z.string().optional(),
  recipient: z.object({
    name: z.string(),
    relationship: z.string().optional(),
  }),
  sender: z.object({
    name: z.string(),
  }),
  occasion: z.string(),
  mood: z.string(),
  /** Free-form language tag; reserved for localisation of built-in copy. */
  locale: z.string().default('en'),
  sections: z.array(cardSectionSchema).min(1),
});

export type CardConfig = z.infer<typeof cardConfigSchema>;

/**
 * Parse untrusted config (database row, API body, AI output) into a safe
 * `CardConfig`. Returns a discriminated result so callers can render a proper
 * error state instead of throwing inside a React tree.
 */
export function parseCardConfig(
  input: unknown,
): { ok: true; config: CardConfig } | { ok: false; error: string } {
  const result = cardConfigSchema.safeParse(input);
  if (result.success) return { ok: true, config: result.data };

  const first = result.error.issues[0];
  const path = first?.path.join('.') || 'config';
  return { ok: false, error: `${path}: ${first?.message ?? 'invalid card configuration'}` };
}

/** Splits a letter body into paragraphs for staggered reveal. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
