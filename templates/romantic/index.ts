import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Nocturne — the flagship romantic template.
 * Dark, candle-lit, unhurried. Everything arrives late and settles slowly.
 */
export const romanticTemplate: TemplateDefinition = {
  id: 'romantic',
  name: 'Nocturne',
  tagline: 'Low light, slow reveals, one long letter.',
  description:
    'A card that behaves like the end of a good evening. The story opens in near-darkness, a single glass heart holds the light, and the letter is revealed one paragraph at a time as they scroll. Built for the message you have been rehearsing for a while.',
  occasions: ['love', 'anniversary', 'just-because'],
  moods: ['romantic', 'dreamy', 'elegant'],
  animationStyle: 'Long fades, drifting petals, paragraph-by-paragraph reveal',
  paletteId: 'duskRose',
  scene: 'heart',
  motif: 'petals',
  supportedSections: [
    'cover',
    'envelope',
    'intro',
    'letter',
    'gallery',
    'timeline',
    'quote',
    'memories',
    'final',
    'closing',
  ],
  sectionVariants: {
    cover: 'glow',
    envelope: 'wax',
    intro: 'centered',
    letter: 'serif',
    gallery: 'stack',
    timeline: 'thread',
    memories: 'notes',
    quote: 'centered',
    final: 'bloom',
    closing: 'seal',
  },
  compose(input) {
    const sections = standardArc(input, { envelopeVariant: 'wax', openPrompt: 'Open it' });
    return applyVariants(sections, this.sectionVariants);
  },
};
