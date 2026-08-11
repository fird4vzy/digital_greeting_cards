import type { PaletteId } from '@/lib/design/palettes';
import type { CardSection, Photo, SectionKind } from './schema';
import type { MoodId, OccasionId } from './taxonomy';

/**
 * TEMPLATE ENGINE
 * ===============
 * A template is a *recipe*, not a page. It declares:
 *   - which storytelling beats it uses, and in what order  (`compose`)
 *   - how the shared section components should look         (`sectionVariants`)
 *   - its colourway and atmosphere                          (`paletteId`, `scene`)
 *
 * There is no template-specific markup anywhere in the codebase. That is the
 * property that lets the library grow to fifty templates without the renderer
 * changing at all.
 */

/** Optional WebGL atmosphere. Every scene has a CSS-only fallback. */
export type SceneId = 'petals' | 'sakura' | 'bloom' | 'heart' | 'embers' | 'none';

/** Lightweight 2D decoration drawn as inline SVG — always safe to render. */
export type MotifId = 'petals' | 'sparks' | 'linen' | 'arch' | 'sun' | 'branch';

/** Everything the creation flow (or the AI planner) knows about the story. */
export type StoryInput = {
  recipientName: string;
  senderName: string;
  relationship: string;
  occasion: OccasionId | string;
  mood: MoodId | string;
  /** Free text the customer wrote in "Tell us the story". */
  story: string;
  photos: Photo[];
  moments?: { date: string; title: string; text?: string }[];
  memories?: { label: string; text: string }[];
  wishes?: string[];
};

export type TemplateDefinition = {
  id: string;
  name: string;
  /** One line, shown under the name in the gallery. */
  tagline: string;
  description: string;
  occasions: OccasionId[];
  moods: MoodId[];
  /** Human description of the motion language, surfaced in the gallery. */
  animationStyle: string;
  paletteId: PaletteId;
  scene: SceneId;
  motif: MotifId;
  /** Beats this template is able to render, in canonical order. */
  supportedSections: SectionKind[];
  /** Per-section look. Missing entries fall back to the component default. */
  sectionVariants: Partial<Record<SectionKind, string>>;
  /** Turns story input into a full section list. The heart of the engine. */
  compose: (input: StoryInput) => CardSection[];
};

export type TemplateSummary = Omit<TemplateDefinition, 'compose'>;

export function toSummary(template: TemplateDefinition): TemplateSummary {
  const { compose: _compose, ...summary } = template;
  return summary;
}
