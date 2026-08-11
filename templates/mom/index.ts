import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Kitchen Light — for the card that is mostly gratitude.
 * Soft linen, a lot of air, handwriting-weight letter setting.
 */
export const momTemplate: TemplateDefinition = {
  id: 'mom',
  name: 'Kitchen Light',
  tagline: 'Unhurried, generous, and slightly sunlit.',
  description:
    'Built for the things that never fit into a phone call. Warm linen surfaces, a letter set large enough to read slowly, and a quiet ledger of the things she gave you. No cursive fonts, no floral borders — it takes her seriously.',
  occasions: ['for-mom', 'just-because', 'birthday'],
  moods: ['warm', 'elegant', 'minimal'],
  animationStyle: 'Soft light drift, large type, gentle sequential reveals',
  paletteId: 'linen',
  scene: 'bloom',
  motif: 'linen',
  supportedSections: [
    'cover',
    'envelope',
    'intro',
    'letter',
    'gallery',
    'timeline',
    'memories',
    'quote',
    'final',
    'closing',
  ],
  sectionVariants: {
    cover: 'paper',
    envelope: 'ribbon',
    intro: 'offset',
    letter: 'handwritten',
    gallery: 'mosaic',
    timeline: 'ledger',
    memories: 'notes',
    quote: 'rule',
    final: 'fade',
    closing: 'signature',
  },
  compose(input) {
    const sections = standardArc(input, {
      envelopeVariant: 'ribbon',
      openPrompt: 'Open it',
    });
    return applyVariants(sections, this.sectionVariants);
  },
};
