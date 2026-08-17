import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Candlelight — a dark room, a cake, and one wish.
 *
 * Ported from a hand-written birthday card whose whole shape is a run-up: a
 * few lines in the dark, then a cake to blow out, then the photographs. Its
 * plum-and-gold hexes became the `candlelight` palette — the only dark one in
 * the library that is warm rather than formal.
 *
 * **The cake is why it exists.** Every other template in the library is read;
 * this one is done. The beat sits before the gallery because the album is the
 * evening continuing, and putting it first would make the cake an afterthought
 * to the pictures rather than the thing the pictures follow.
 *
 * The original carried a song, and cards on this template can too — that is
 * `config.audio` rather than a beat, because it plays while the reader is
 * somewhere else entirely. It never starts on its own.
 *
 * No envelope: the original opened straight into the dark, and a sealed flap
 * before a room with candles in it would be one ceremony too many.
 */
export const candlelightTemplate: TemplateDefinition = {
  id: 'candlelight',
  name: 'Candlelight',
  tagline: 'A dark room, a cake, and one wish.',
  description:
    'A birthday card that does not shout. It happens in the dark: a few words first, then a cake whose candles have to be blown out, and only afterwards the photographs. The one card with something to do rather than only something to read.',
  occasions: ['birthday', 'celebration', 'friendship'],
  moods: ['warm', 'dreamy', 'cute'],
  animationStyle: 'Candlelight, flames going out one by one, music if you want it',
  paletteId: 'candlelight',
  scene: 'embers',
  motif: 'sparks',
  supportedSections: ['cover', 'intro', 'letter', 'cake', 'gallery', 'wishes', 'final', 'closing'],
  sectionVariants: {
    cover: 'glow',
    intro: 'centered',
    letter: 'lines',
    cake: 'candles',
    gallery: 'filmstrip',
    wishes: 'list',
    final: 'bloom',
    closing: 'signature',
  },
  compose(input) {
    const sections = standardArc(input, { exclude: ['envelope'] });
    return applyVariants(sections, this.sectionVariants);
  },
};
