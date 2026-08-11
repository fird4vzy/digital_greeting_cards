import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * The Archive — photograph-led, no WebGL at all.
 * The lightest template in the library, and deliberately so: when the story is
 * carried by twenty photographs, the atmosphere should get out of the way.
 */
export const memoriesTemplate: TemplateDefinition = {
  id: 'memories',
  name: 'The Archive',
  tagline: 'Photograph-led. The pictures do the talking.',
  description:
    'For the card that is really a small exhibition. Archival paper, captions set like museum labels, and a horizontal filmstrip you scrub through with a thumb. No 3D, no effects — it loads instantly on any phone and puts every pixel into the photographs.',
  occasions: ['just-because', 'friendship', 'anniversary'],
  moods: ['minimal', 'warm', 'elegant'],
  animationStyle: 'Filmstrip scrubbing, museum captions, near-zero effects',
  paletteId: 'archive',
  scene: 'none',
  motif: 'sun',
  supportedSections: [
    'cover',
    'intro',
    'gallery',
    'timeline',
    'letter',
    'memories',
    'quote',
    'final',
    'closing',
  ],
  sectionVariants: {
    cover: 'paper',
    intro: 'offset',
    gallery: 'filmstrip',
    timeline: 'ledger',
    letter: 'serif',
    memories: 'chips',
    quote: 'rule',
    final: 'fade',
    closing: 'signature',
  },
  compose(input) {
    // No envelope: an archive opens by being walked into, not unsealed.
    const sections = standardArc(input, { exclude: ['envelope'] });

    // Photographs lead here — the gallery moves ahead of the letter.
    const gallery = sections.find((section) => section.type === 'gallery');
    if (!gallery) return applyVariants(sections, this.sectionVariants);

    const rest = sections.filter((section) => section !== gallery);
    const letterIndex = rest.findIndex((section) => section.type === 'letter');
    const at = letterIndex === -1 ? rest.length : letterIndex;

    return applyVariants([...rest.slice(0, at), gallery, ...rest.slice(at)], this.sectionVariants);
  },
};
