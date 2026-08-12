import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Ten Thousand Mornings — the formal one.
 * Midnight and brass, architectural spacing, a timeline that carries the story.
 */
export const anniversaryTemplate: TemplateDefinition = {
  id: 'anniversary',
  name: 'Ten Thousand Mornings',
  tagline: 'Architectural, quiet, built around a timeline.',
  description:
    'An anniversary is a long record, so this template makes the timeline the spine of the story. Midnight surfaces, brass detailing and an arched cover give it the weight of something printed rather than posted. The letter sits in the middle, framed like a plaque.',
  occasions: ['anniversary', 'love', 'celebration'],
  moods: ['elegant', 'romantic', 'minimal'],
  animationStyle: 'Architectural wipes, timeline threading, restrained parallax',
  paletteId: 'midnightBrass',
  scene: 'petals',
  motif: 'arch',
  supportedSections: [
    'cover',
    'envelope',
    'intro',
    'timeline',
    'letter',
    'gallery',
    'quote',
    'memories',
    'final',
    'closing',
  ],
  sectionVariants: {
    cover: 'arch',
    envelope: 'wax',
    intro: 'centered',
    timeline: 'ledger',
    letter: 'serif',
    gallery: 'mosaic',
    memories: 'chips',
    quote: 'rule',
    final: 'bloom',
    closing: 'seal',
  },
  compose(input) {
    const sections = standardArc(input, { envelopeVariant: 'wax' });

    // The anniversary story reads better chronology-first: the timeline moves
    // ahead of the letter so the letter lands as the conclusion, not the setup.
    const timeline = sections.find((section) => section.type === 'timeline');
    if (!timeline) return applyVariants(sections, this.sectionVariants);

    const rest = sections.filter((section) => section !== timeline);
    const letterIndex = rest.findIndex((section) => section.type === 'letter');
    const at = letterIndex === -1 ? rest.length : letterIndex;

    return applyVariants(
      [...rest.slice(0, at), timeline, ...rest.slice(at)],
      this.sectionVariants,
    );
  },
};
