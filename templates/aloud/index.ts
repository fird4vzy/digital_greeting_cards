import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Aloud — the one where the sender speaks.
 *
 * Ported from a hand-written card (`iLove`): a title screen over blush glows,
 * an envelope you tap, a recording, then a letter that arrives line by line.
 * Four screens, one of them a video, and no timeline — it is the shortest and
 * most direct template in the library, which is the whole reason to keep it
 * beside the longer ones.
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
    cover: 'glow',
    envelope: 'ribbon',
    intro: 'centered',
    video: 'full',
    letter: 'serif',
    gallery: 'stack',
    quote: 'centered',
    final: 'fade',
    closing: 'signature',
  },
  compose(input) {
    const sections = standardArc(input, { envelopeVariant: 'ribbon' });

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
