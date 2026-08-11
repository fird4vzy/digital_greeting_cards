import { applyVariants, standardArc } from '@/lib/card/compose';
import type { TemplateDefinition } from '@/lib/card/template';

/**
 * Golden Hour — birthdays without a single balloon graphic.
 * Warm champagne paper, embers rising instead of confetti falling.
 */
export const birthdayTemplate: TemplateDefinition = {
  id: 'birthday',
  name: 'Golden Hour',
  tagline: 'Celebratory, warm, and completely free of balloons.',
  description:
    'Birthday cards usually shout. This one raises a glass. Warm champagne paper, photographs arranged like they were just laid on a table, and a wish list that unfolds line by line. Ends on a single sentence about the person, not the date.',
  occasions: ['birthday', 'celebration', 'friendship'],
  moods: ['warm', 'cute', 'funny'],
  animationStyle: 'Rising embers, tilted photographs, line-by-line wishes',
  paletteId: 'champagne',
  scene: 'embers',
  motif: 'sparks',
  supportedSections: [
    'cover',
    'envelope',
    'intro',
    'letter',
    'gallery',
    'wishes',
    'quote',
    'memories',
    'final',
    'closing',
  ],
  sectionVariants: {
    cover: 'paper',
    envelope: 'ribbon',
    intro: 'centered',
    letter: 'serif',
    gallery: 'polaroid',
    memories: 'chips',
    quote: 'rule',
    wishes: 'list',
    final: 'fade',
    closing: 'signature',
  },
  compose(input) {
    const wishes =
      input.wishes && input.wishes.length > 0
        ? input.wishes
        : ['A slow morning', 'Something you did not plan', 'People who show up', 'One very good meal'];

    const sections = standardArc(
      { ...input, wishes },
      { envelopeVariant: 'ribbon', openPrompt: 'Pull the ribbon' },
    );
    return applyVariants(sections, this.sectionVariants);
  },
};
