import { z } from 'zod';
import { SECTION_KINDS } from '@/lib/card/schema';
import { SECTION_VARIANTS } from '@/lib/card/variants';
import { MOODS, OCCASIONS } from '@/lib/card/taxonomy';
import { palettes } from '@/lib/design/palettes';

/**
 * THE IMPORT CONTRACT
 * ===================
 * The same trick the card planner uses, pointed at a page instead of a brief:
 * the model reads someone's hand-written HTML and returns **a selection from
 * this vocabulary**, never markup. It cannot invent a palette, a beat or a
 * look, because every field here is an enum built from what the renderer
 * actually implements.
 *
 * That is also why importing removes the security problem the other routes had.
 * Serving a stranger's HTML from this origin puts their script in the same
 * cookie jar as the admin; reading it produces data, and data does not run.
 *
 * **`unmapped` is the most valuable field.** A page has screens the engine has
 * no beat for — a video screen was one, until there was a video beat — and the
 * model is told to list them rather than force them into the nearest fit. That
 * list is the engine's missing vocabulary, named by the thing that needed it.
 */

const enumOf = <T extends readonly [string, ...string[]]>(values: T) => z.enum(values);

const paletteIds = Object.keys(palettes) as [string, ...string[]];
const occasionIds = OCCASIONS.map((o) => o.id) as [string, ...string[]];
const moodIds = MOODS.map((m) => m.id) as [string, ...string[]];

export const templateImportSchema = z.object({
  /** Derived from the repository or folder name; the operator can rename it. */
  id: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z][a-z0-9-]*$/),
  paletteId: enumOf(paletteIds),
  scene: z.enum(['petals', 'sakura', 'bloom', 'heart', 'embers', 'none']),
  motif: z.enum(['petals', 'sparks', 'linen', 'arch', 'sun', 'branch']),
  occasions: z.array(enumOf(occasionIds)).min(1).max(4),
  moods: z.array(enumOf(moodIds)).min(1).max(4),
  supportedSections: z.array(z.enum(SECTION_KINDS)).min(1),
  sectionVariants: z.object({
    cover: z.enum(SECTION_VARIANTS.cover).optional(),
    envelope: z.enum(SECTION_VARIANTS.envelope).optional(),
    intro: z.enum(SECTION_VARIANTS.intro).optional(),
    letter: z.enum(SECTION_VARIANTS.letter).optional(),
    video: z.enum(SECTION_VARIANTS.video).optional(),
    gallery: z.enum(SECTION_VARIANTS.gallery).optional(),
    timeline: z.enum(SECTION_VARIANTS.timeline).optional(),
    memories: z.enum(SECTION_VARIANTS.memories).optional(),
    quote: z.enum(SECTION_VARIANTS.quote).optional(),
    wishes: z.enum(SECTION_VARIANTS.wishes).optional(),
    final: z.enum(SECTION_VARIANTS.final).optional(),
    closing: z.enum(SECTION_VARIANTS.closing).optional(),
  }),
  reorder: z
    .object({ move: z.enum(SECTION_KINDS), before: z.enum(SECTION_KINDS) })
    .nullable(),
  strings: z.object({
    name: z.string().min(1).max(40),
    tagline: z.string().min(1).max(90),
    description: z.string().min(1).max(400),
    animationStyle: z.string().min(1).max(90),
  }),
  /** Screens the page has that no beat covers. Names, not apologies. */
  unmapped: z.array(z.string().max(80)).max(8),
  /** One sentence per decision an operator would otherwise have to guess at. */
  rationale: z.string().max(600),
});

export type TemplateImport = z.infer<typeof templateImportSchema>;

/**
 * The vocabulary, written out for the prompt.
 *
 * Generated from the registry rather than typed by hand, so it cannot drift
 * out of date the way a prose list would — the same reason the card planner's
 * prompt lists templates from `listTemplates()`.
 */
export function vocabularyForPrompt(): string {
  const variants = Object.entries(SECTION_VARIANTS)
    .map(([kind, looks]) => `  ${kind}: ${looks.join(' | ')}`)
    .join('\n');

  return [
    `Palettes: ${Object.values(palettes)
      .map((palette) => `${palette.id} (${palette.name}, ${palette.scheme})`)
      .join(', ')}`,
    `Scenes: petals, sakura, bloom, heart, embers, none`,
    `Motifs: petals, sparks, linen, arch, sun, branch`,
    `Occasions: ${occasionIds.join(', ')}`,
    `Moods: ${moodIds.join(', ')}`,
    `Beats, in the order the standard arc plays them: ${SECTION_KINDS.join(' → ')}`,
    `Looks available per beat:\n${variants}`,
  ].join('\n\n');
}
