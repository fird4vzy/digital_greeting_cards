import { z } from 'zod';
import { applyVariants, standardArc } from './compose';
import { SECTION_KINDS, type SectionKind } from './schema';
import { SECTION_VARIANTS } from './variants';
import type { SectionVariants } from './variants';
import type { StoryInput, TemplateDefinition } from './template';
import { MOODS, OCCASIONS } from './taxonomy';
import { palettes } from '@/lib/design/palettes';

/**
 * A TEMPLATE, AS DATA
 * ===================
 * Every template in `templates/` reads the same way:
 *
 *   const sections = standardArc(input, { envelopeVariant: 'wax' });
 *   return applyVariants(sections, this.sectionVariants);
 *
 * Two of the seven then move one beat, and that is the entire range. None
 * writes its own composition. So the difference between any two templates is a
 * palette, a scene, a list of beats, one word per beat, and — at most — a
 * single reordering, all of which fit in a row of a database and a form.
 *
 * This file is that row. `recipeToDefinition` turns one back into a real
 * `TemplateDefinition`, `compose` included, so a stored template is
 * indistinguishable from a hand-written one everywhere downstream: the
 * renderer, the gallery, the admin and the creation flow never learn which is
 * which.
 *
 * **The reorder field is here because the port taught it.** Moving the video
 * ahead of the letter is what separates *Aloud* from *Nocturne*; without it a
 * builder could only produce templates that differ in colour. It was not
 * obvious before doing one port by hand, which is why the port came first.
 */

const sectionKind = z.enum(SECTION_KINDS);

/**
 * `{ letter: 'serif' | 'handwritten' | 'washi', … }`, checked per kind.
 *
 * Written out rather than generated from `SECTION_VARIANTS` by a loop: the
 * loop needed two casts through `unknown` to satisfy zod's enum signature, and
 * a cast through `unknown` in the one file whose job is validation is a hole
 * in exactly the wrong place. Adding a section kind breaks this object, which
 * is the correct outcome.
 */
const sectionVariantsSchema = z.object({
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
});

/** Localised copy. English is required; the others fall back to it. */
const stringsSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  animationStyle: z.string().min(1),
});

export const templateRecipeSchema = z.object({
  /** Lower-case, url-safe: it becomes `/templates/<id>` and an order's `templateId`. */
  id: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z][a-z0-9-]*$/, 'lower-case letters, digits and hyphens'),
  paletteId: z.enum(Object.keys(palettes) as [string, ...string[]]),
  scene: z.enum(['petals', 'sakura', 'bloom', 'heart', 'embers', 'none']),
  motif: z.enum(['petals', 'sparks', 'linen', 'arch', 'sun', 'branch']),
  occasions: z.array(z.enum(OCCASIONS.map((o) => o.id) as [string, ...string[]])).min(1),
  moods: z.array(z.enum(MOODS.map((m) => m.id) as [string, ...string[]])).min(1),
  supportedSections: z.array(sectionKind).min(1),
  sectionVariants: sectionVariantsSchema,
  /**
   * One beat moved ahead of another, applied after the standard arc.
   *
   * Deliberately a single move rather than a free ordering: every template
   * written so far needed exactly one, and a free list would let an operator
   * build an arc where the envelope opens after the signature.
   */
  reorder: z
    .object({ move: sectionKind, before: sectionKind })
    .nullable()
    .default(null),
  /** Overlaid onto the dictionaries at render time; English is the fallback. */
  strings: z.object({
    en: stringsSchema,
    ru: stringsSchema.partial().optional(),
    uz: stringsSchema.partial().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TemplateRecipe = z.infer<typeof templateRecipeSchema>;

/** What the builder form posts, before ids and timestamps are stamped on. */
export const templateRecipeDraftSchema = templateRecipeSchema.omit({
  createdAt: true,
  updatedAt: true,
});

export type TemplateRecipeDraft = z.infer<typeof templateRecipeDraftSchema>;

/**
 * Rebuilds a working template from stored data.
 *
 * The composition it derives is the same one every hand-written template
 * performs, which is the point: nothing downstream can tell a stored template
 * from a compiled one, so no page needs a branch for them.
 */
export function recipeToDefinition(recipe: TemplateRecipe): TemplateDefinition {
  const variants = recipe.sectionVariants as SectionVariants;
  const envelopeVariant = variants.envelope;
  const reorder = recipe.reorder;

  return {
    id: recipe.id,
    name: recipe.strings.en.name,
    tagline: recipe.strings.en.tagline,
    description: recipe.strings.en.description,
    animationStyle: recipe.strings.en.animationStyle,
    occasions: recipe.occasions as TemplateDefinition['occasions'],
    moods: recipe.moods as TemplateDefinition['moods'],
    paletteId: recipe.paletteId as TemplateDefinition['paletteId'],
    scene: recipe.scene,
    motif: recipe.motif,
    supportedSections: recipe.supportedSections,
    sectionVariants: variants,
    compose(input: StoryInput) {
      const sections = standardArc(input, { envelopeVariant });
      if (!reorder) return applyVariants(sections, variants);

      const moving = sections.find((section) => section.type === reorder.move);
      if (!moving) return applyVariants(sections, variants);

      const rest = sections.filter((section) => section !== moving);
      const index = rest.findIndex((section) => section.type === reorder.before);
      const at = index === -1 ? rest.length : index;

      return applyVariants([...rest.slice(0, at), moving, ...rest.slice(at)], variants);
    },
  };
}

/**
 * Reads an existing template back into a recipe, so the builder can open one
 * for editing and "save this as a new template" has somewhere to start.
 *
 * `compose` cannot be inspected, so the reorder is not recovered — a compiled
 * template opened in the builder comes back with the standard order. That is a
 * real limitation and it only bites the six that predate this file.
 */
export function definitionToRecipe(
  template: TemplateDefinition,
  now = new Date().toISOString(),
): TemplateRecipe {
  return {
    id: template.id,
    paletteId: template.paletteId,
    scene: template.scene,
    motif: template.motif,
    occasions: [...template.occasions],
    moods: [...template.moods],
    supportedSections: [...template.supportedSections],
    sectionVariants: { ...template.sectionVariants },
    reorder: null,
    strings: {
      en: {
        name: template.name,
        tagline: template.tagline,
        description: template.description,
        animationStyle: template.animationStyle,
      },
    },
    createdAt: now,
    updatedAt: now,
  };
}
