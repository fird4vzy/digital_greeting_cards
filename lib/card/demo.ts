import { getPalette, photoColors } from '@/lib/design/palettes';
import { demoPhotos } from '@/lib/utils/placeholder';
import { resolveTemplate } from '@/templates';
import { composeConfig } from './service';
import type { CardConfig } from './schema';
import type { StoryInput } from './template';

/**
 * Demo stories, one per template.
 *
 * The gallery, the live previews and the template pages all read from here, so
 * a template always demonstrates itself with content that suits it — a
 * timeline-led template gets dates, a photograph-led one gets photographs.
 * Every preview is composed through the real engine, so what a customer sees
 * in the gallery is exactly what the renderer will produce.
 */

type DemoSeed = Omit<StoryInput, 'photos' | 'locale'> & { photoCount: number };

const SEEDS: Record<string, DemoSeed> = {
  romantic: {
    recipientName: 'Alina',
    senderName: 'Firdavs',
    relationship: 'girlfriend',
    occasion: 'love',
    mood: 'romantic',
    photoCount: 4,
    story:
      'I have started this message eleven times. Every version sounded either too small or too much, so here is the plain one.\n\nTwo years ago you were a stranger with strong opinions about coffee. Now you are the person I tell things to before I have finished thinking them. Somewhere in between, without either of us announcing it, my ordinary days quietly became better.\n\nI bought you peonies because you said once, offhandedly, that they look like they are mid-sentence. I have not stopped thinking about that.',
    moments: [
      { date: 'March 2023', title: 'The coffee argument', text: 'You were right. I have never admitted this until now.' },
      { date: 'August 2023', title: 'The train we missed', text: 'Best four hours of that entire year.' },
      { date: 'This week', title: 'Peonies', text: 'Mid-sentence, as promised.' },
    ],
    memories: [
      { label: 'Your laugh', text: 'The unguarded one, not the polite one.' },
      { label: 'The blue coat', text: 'You have owned it forever. Do not replace it.' },
    ],
  },

  birthday: {
    recipientName: 'Marta',
    senderName: 'Kasia',
    relationship: 'friend',
    occasion: 'birthday',
    mood: 'warm',
    photoCount: 4,
    story:
      'Another year, and you are still the person who answers the phone at 1am and pretends she was awake.\n\nThis year you moved cities, started something terrifying, and somehow still made it to every one of my things. I do not know how you do it. I suspect you do not either.\n\nSo: happy birthday. Have the day you actually want, not the one you think you should want.',
    memories: [
      { label: 'The move', text: 'Four flights of stairs, no lift, in July.' },
      { label: 'Karaoke', text: 'We do not discuss the karaoke.' },
    ],
    wishes: ['A slow morning', 'Something you did not plan', 'People who show up', 'One very good meal'],
  },

  mom: {
    recipientName: 'Mama',
    senderName: 'Firdavs',
    relationship: 'mom',
    occasion: 'for-mom',
    mood: 'warm',
    photoCount: 3,
    story:
      'I called last Sunday and we talked about the weather for twenty minutes, which is our way of saying the other thing.\n\nSo I am writing the other thing down.\n\nAlmost everything I do well, I do because I watched you do it first — the patience especially, though I am still some distance behind. You never made any of it look like effort. I understand now that it was.\n\nThank you. For the enormous things, and for the thousand small ones I only noticed years later.',
    moments: [
      { date: 'Every September', title: 'The first day of school', text: 'You ironed the shirt twice.' },
      { date: '2016', title: 'The year everything moved', text: 'You never once said you were tired.' },
    ],
  },

  anniversary: {
    recipientName: 'Daniel',
    senderName: 'Sofia',
    relationship: 'husband',
    occasion: 'anniversary',
    mood: 'elegant',
    photoCount: 3,
    story:
      'Ten years. It went quickly, which I am told is a good sign.\n\nWhat I keep coming back to is not the big occasions but the ordinary evenings — the ones that would be unremarkable with anyone else.\n\nI would choose this again. I do, most days, without thinking about it.',
    moments: [
      { date: '2016', title: 'The bad hotel', text: 'It rained for six days.' },
      { date: '2019', title: 'The flat with the loud radiator' },
      { date: '2022', title: 'The kitchen we finally finished' },
      { date: 'Today', title: 'Ten years' },
    ],
    memories: [{ label: 'Sunday', text: 'You, the paper, and no plans at all.' }],
  },

  memories: {
    recipientName: 'Lena',
    senderName: 'Tomás',
    relationship: 'family',
    occasion: 'celebration',
    mood: 'warm',
    photoCount: 6,
    story:
      'Nobody in our family had done it before. You went first, and you made it look survivable.\n\nMost people will see the certificate. I saw the two years in front of it, and the mornings you did not want to get up.\n\nThat is the part worth framing.',
    moments: [
      { date: 'Year one', title: 'The library, mostly' },
      { date: 'Year two', title: 'The part you nearly quit' },
      { date: 'June', title: 'Done' },
    ],
  },

  sakura: {
    recipientName: 'Haruto',
    senderName: 'Emi',
    relationship: 'someone-special',
    occasion: 'just-because',
    mood: 'minimal',
    photoCount: 2,
    story:
      'No occasion. Nothing happened, nothing is coming up.\n\nI walked past the florist on the corner and there was one branch in the window, and I thought of you, and that seemed like reason enough.\n\nThat is the whole message.',
    memories: [{ label: 'The corner shop', text: 'Still there. Still that one branch.' }],
  },
};

export function demoStory(templateId: string, locale = 'en'): StoryInput {
  const template = resolveTemplate(templateId);
  const seed = SEEDS[template.id] ?? SEEDS.romantic;
  const palette = getPalette(template.paletteId);
  const { photoCount, ...rest } = seed;

  return {
    ...rest,
    locale,
    // The handwritten demo prose above only exists in English. Rather than
    // show a Russian visitor an English letter, we hand the composer an empty
    // story for other locales and let it fall back to that locale's own
    // letter from the copy bank — which is written, not machine-translated.
    story: locale === 'en' ? rest.story : '',
    photos: demoPhotos(`demo-${template.id}`, photoCount, photoColors(palette)),
  };
}

export function demoConfig(templateId: string, locale = 'en'): CardConfig {
  const template = resolveTemplate(templateId);
  return composeConfig(demoStory(template.id, locale), template.id);
}
