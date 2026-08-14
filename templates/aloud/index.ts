import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Aloud — the one where the sender speaks.
 *
 * Ported from a hand-written card (`iLove`): a title screen over blush glows,
 * a heart you tap, a recording, then the letter. Four screens, one of them a
 * video, and no timeline — the shortest and most direct template in the
 * library, which is the whole reason to keep it beside the longer ones.
 *
 * **The look is ported too, not only the shape.** The first pass mapped its
 * screens onto beats and left them wearing the engine's default clothes, which
 * produced the right skeleton and the wrong card. `cover: gradient` and
 * `envelope: heart` are its own: colour that travels along the name, and a gate
 * that is a heart rather than an envelope, with the note escaping upward out of
 * it instead of a flap lifting.
 *
 * **The port needed no markup.** The original was one 40 KB HTML file with its
 * styles and script inline; what survives here is a palette, four beats and a
 * reordering, because that is all the difference between it and the rest of
 * the library ever was. What did not survive is its exact choreography — the
 * hearts, the particular easing — and that is the honest cost of porting.
 */
export const aloudTemplate: TemplateDefinition = {
  id: 'aloud',
  name: 'Aloud',
  tagline: 'A recording first, then the words.',
  description:
    'The shortest card in the library, and the only one that opens its mouth. A title over soft light, an envelope to tap, then the sender on camera before a single line is read — the letter arrives afterwards, one line at a time, as the reply. For the message that is easier said than written.',
  occasions: ['love', 'just-because', 'anniversary'],
  moods: ['romantic', 'warm', 'dreamy'],
  animationStyle: 'Drifting light, a tapped envelope, the letter line by line',
  paletteId: 'blush',
  scene: 'petals',
  motif: 'petals',
  supportedSections: [
    'cover',
    'envelope',
    'intro',
    'video',
    'letter',
    'gallery',
    'quote',
    'final',
    'closing',
  ],
  sectionVariants: {
    cover: 'gradient',
    envelope: 'heart',
    intro: 'centered',
    video: 'full',
    letter: 'serif',
    gallery: 'stack',
    quote: 'centered',
    final: 'fade',
    closing: 'signature',
  },
  compose(input) {
    const sections = standardArc(input, { envelopeVariant: 'heart' });

    // The original played the recording *before* the letter, and that order is
    // the template's argument: you watch someone say it, and the words that
    // follow read as what they could not fit into the camera. The standard arc
    // puts the video after the letter, which makes the letter the setup — true
    // of every other template here, and wrong for this one.
    const video = sections.find((section) => section.type === 'video');
    if (!video) return applyVariants(sections, this.sectionVariants);

    const rest = sections.filter((section) => section !== video);
    const letterIndex = rest.findIndex((section) => section.type === 'letter');
    const at = letterIndex === -1 ? rest.length : letterIndex;

    return applyVariants(
      [...rest.slice(0, at), video, ...rest.slice(at)],
      this.sectionVariants,
    );
  },
};
