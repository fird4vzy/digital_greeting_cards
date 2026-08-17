import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Shall We — the one that asks.
 *
 * Ported from a hand-written card: a page of photographs with captions, then
 * "Пойдём?" and two buttons, one of which runs away from the cursor. There is
 * no page where the answer is no; pressing yes leads to confetti and a single
 * word.
 *
 * **The question is the template.** Every other one in the library narrates —
 * here is what happened, here is what I think of you — and this one stops and
 * waits. That is why it is the only template declaring the `question` beat and
 * why the beat sits at the end: everything before it is the case being made.
 *
 * No envelope and no letter. The original had neither, and adding them would
 * turn a joke that lands in fifteen seconds into a card somebody has to read
 * before they get to the part they will remember.
 */
export const askTemplate: TemplateDefinition = {
  id: 'ask',
  name: 'Shall We',
  tagline: 'Asks a question and will not take no.',
  description:
    'The only template that asks for something instead of telling you something. Photographs, a short run-up, and a question with two buttons — except that "no" runs away from the cursor. There is no way to decline, and that is the joke: the card is not requesting a decision, it is performing one.',
  occasions: ['love', 'just-because', 'friendship'],
  moods: ['funny', 'cute', 'warm'],
  animationStyle: 'Bright, a button that flees, an answer instead of a question',
  paletteId: 'confetti',
  scene: 'petals',
  motif: 'sparks',
  supportedSections: ['cover', 'intro', 'gallery', 'question', 'final'],
  sectionVariants: {
    cover: 'glow',
    intro: 'centered',
    gallery: 'polaroid',
    question: 'chase',
    final: 'bloom',
  },
  compose(input) {
    const sections = standardArc(input, { exclude: ['envelope'] });
    return applyVariants(sections, this.sectionVariants);
  },
};
