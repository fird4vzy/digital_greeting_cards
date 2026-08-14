import type { SectionKind } from './schema';

/**
 * THE VARIANT VOCABULARY
 * ======================
 * Every look a shared section component knows how to render. This is the list
 * a template picks from, and it is the real unit of expansion in this product:
 * a new variant is available to every template at once, present and future,
 * while a new template is only ever a new arrangement of what already exists.
 *
 * **Why this file exists.** `sectionVariants` used to be
 * `Partial<Record<SectionKind, string>>`, so a template could ask for a look
 * nobody had built. Seventeen of the fifty-nine variants the six templates
 * declared turned out not to exist — `envelope: 'wax'`, `gallery: 'stack'`,
 * `timeline: 'thread'` and others — and because each component ends its
 * `if (variant === …)` chain with a default, every one of them silently fell
 * back to the plain look. The templates read as far more distinct than they
 * rendered, and nothing failed to say so.
 *
 * **Compile-time here, lenient at runtime.** `TemplateDefinition` uses these
 * unions, so a typo is now a build error. `sectionSchema.variant` stays a
 * plain string on purpose: published cards store their composed sections in
 * the database, and a card written months ago must keep rendering after a
 * variant is renamed or retired. Tightening the schema would turn old rows
 * into validation failures — a card that has already been printed onto a tag
 * and tied to a bouquet has to outlive our refactors.
 */
export const SECTION_VARIANTS = {
  cover: ['arch', 'glow', 'gradient', 'paper', 'washi'],
  envelope: ['heart', 'ribbon', 'washi', 'wax'],
  intro: ['centered', 'offset'],
  letter: ['handwritten', 'serif', 'washi'],
  video: ['framed', 'full'],
  gallery: ['filmstrip', 'mosaic', 'polaroid', 'stack'],
  timeline: ['ledger', 'thread'],
  memories: ['chips', 'notes'],
  quote: ['centered', 'rule'],
  wishes: ['list'],
  final: ['bloom', 'fade'],
  closing: ['seal', 'signature'],
} as const satisfies Record<SectionKind, readonly string[]>;

/** The looks one section kind offers. */
export type SectionVariant<K extends SectionKind> = (typeof SECTION_VARIANTS)[K][number];

/** What a template declares: any subset, each value checked against its kind. */
export type SectionVariants = { [K in SectionKind]?: SectionVariant<K> };
