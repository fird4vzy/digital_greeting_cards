import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * The Window — a few words over something moving.
 *
 * Ported from a hand-written get-well card: a clip filling the screen, a pale
 * wash and a blur over it, and three short lines floating in the middle.
 *
 * **The video is weather here, not content.** Every other template that takes
 * a clip gives it a screen of its own and expects to be watched; this one puts
 * it behind the type and expects to be read across. That is why the cover has
 * a `film` variant rather than this template declaring the `video` beat —
 * declaring the beat is what asks for the other treatment, and asking for both
 * would play the clip twice.
 *
 * Few beats on purpose. Nobody reads at length across a moving picture, so the
 * arc is: arrive, say the short thing, sign it. A gallery or a timeline here
 * would be asking the reader to work.
 */
export const windowTemplate: TemplateDefinition = {
  id: 'window',
  name: 'The Window',
  tagline: 'A few words over something moving.',
  description:
    'The video plays behind the words rather than beside them, like a view somebody is half-watching. There is little text and it is large, because nobody reads for long across a moving picture. For the things said quietly: rest, get better, I am here.',
  occasions: ['just-because', 'friendship', 'celebration'],
  moods: ['warm', 'minimal', 'dreamy'],
  animationStyle: 'Movement behind the type, falling petals, nothing hurried',
  paletteId: 'daylight',
  scene: 'sakura',
  motif: 'branch',
  supportedSections: ['cover', 'intro', 'letter', 'final', 'closing'],
  sectionVariants: {
    cover: 'film',
    intro: 'centered',
    letter: 'lines',
    final: 'fade',
    closing: 'signature',
  },
  compose(input) {
    // No envelope: there is nothing to unseal when the card is already open
    // behind the first word. The original had no gate either.
    const sections = standardArc(input, { exclude: ['envelope'] });
    return applyVariants(sections, this.sectionVariants);
  },
};
