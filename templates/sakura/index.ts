import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Hanami — Japanese-inspired, and restrained about it.
 * Washi paper, sumi ink, asymmetry, one branch. No cherry-blossom wallpaper.
 */
export const sakuraTemplate: TemplateDefinition = {
  id: 'sakura',
  name: 'Hanami',
  tagline: 'Washi paper, sumi ink, one branch of blossom.',
  description:
    'Borrowed from Japanese print composition rather than Japanese decoration: enormous margins, a deliberately off-centre column, and a single sakura branch that sheds petals as you read. The quietest template in the library, and the one that ages best.',
  occasions: ['just-because', 'love', 'friendship'],
  moods: ['minimal', 'dreamy', 'elegant'],
  animationStyle: 'Falling sakura, asymmetric columns, ink-wash transitions',
  paletteId: 'washi',
  scene: 'sakura',
  motif: 'branch',
  supportedSections: [
    'cover',
    'envelope',
    'intro',
    'letter',
    'video',
    'gallery',
    'quote',
    'memories',
    'timeline',
    'final',
    'closing',
  ],
  sectionVariants: {
    cover: 'washi',
    envelope: 'washi',
    intro: 'offset',
    letter: 'washi',
    video: 'full',
    gallery: 'stack',
    timeline: 'thread',
    memories: 'notes',
    quote: 'centered',
    final: 'fade',
    closing: 'seal',
  },
  compose(input) {
    const sections = standardArc(input, { envelopeVariant: 'washi' });
    return applyVariants(sections, this.sectionVariants);
  },
};
