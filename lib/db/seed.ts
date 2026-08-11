import { resolveTemplate } from '@/templates';
import type { StoryInput } from '@/lib/card/template';
import { demoPhotos } from '@/lib/utils/placeholder';
import { palettes, photoColors } from '@/lib/design/palettes';
import type { Order } from './types';

/**
 * Demo data.
 *
 * Every seeded order is composed through the real template engine — the same
 * code path a customer order takes — so the admin, the gallery and the
 * published cards all show genuine output rather than hand-written fixtures.
 */

function compose(templateId: string, input: StoryInput) {
  const template = resolveTemplate(templateId);
  return {
    version: 1,
    templateId: template.id,
    recipient: { name: input.recipientName, relationship: input.relationship },
    sender: { name: input.senderName },
    occasion: String(input.occasion),
    mood: String(input.mood),
    locale: 'en',
    sections: template.compose(input),
  };
}

function order(
  partial: Omit<Order, 'config' | 'createdAt' | 'updatedAt'> & { daysAgo: number; story: StoryInput },
): Order {
  const created = new Date(Date.now() - partial.daysAgo * 86_400_000).toISOString();
  const { daysAgo: _daysAgo, story, ...rest } = partial;

  return {
    ...rest,
    config: rest.status === 'NEW' ? null : compose(rest.templateId, story),
    createdAt: created,
    updatedAt: created,
    publishedAt: rest.status === 'PUBLISHED' ? created : null,
  };
}

export function seedOrders(): Order[] {
  const alinaStory: StoryInput = {
    recipientName: 'Alina',
    senderName: 'Firdavs',
    relationship: 'girlfriend',
    occasion: 'love',
    mood: 'romantic',
    story:
      'Alina,\n\nI have started this message eleven times. Every version sounded either too small or too much, so here is the plain one.\n\nTwo years ago you were a stranger with strong opinions about coffee. Now you are the person I tell things to before I have finished thinking them. Somewhere in between, without either of us announcing it, my ordinary days quietly became better.\n\nYou notice things. You remember what people said months ago. You are kind in the unglamorous way, the kind nobody claps for.\n\nI bought you peonies because you said once, offhandedly, that they look like they are mid-sentence. I have not stopped thinking about that.',
    photos: demoPhotos('alina', 4, photoColors(palettes.duskRose)),
    moments: [
      { date: 'March 2023', title: 'The coffee argument', text: 'You were right. I have never admitted this until now.' },
      { date: 'August 2023', title: 'The train we missed', text: 'Best four hours of that entire year.' },
      { date: 'January 2024', title: 'Your flat, the small kitchen', text: 'You burnt the garlic and we ate it anyway.' },
      { date: 'This week', title: 'Peonies', text: 'Mid-sentence, as promised.' },
    ],
    memories: [
      { label: 'Your laugh', text: 'The unguarded one, not the polite one.' },
      { label: 'Sunday, 8am', text: 'You, asleep, refusing to acknowledge the day.' },
      { label: 'The blue coat', text: 'You have owned it forever. Do not replace it.' },
    ],
  };

  const martaStory: StoryInput = {
    recipientName: 'Marta',
    senderName: 'Kasia',
    relationship: 'friend',
    occasion: 'birthday',
    mood: 'warm',
    story:
      'Marta!\n\nAnother year, and you are still the person who answers the phone at 1am and pretends she was awake.\n\nThis year you moved cities, started something terrifying, and somehow still made it to every one of my things. I do not know how you do it. I suspect you do not either.\n\nSo: happy birthday. Have the day you actually want, not the one you think you should want.',
    photos: demoPhotos('marta', 4, photoColors(palettes.champagne)),
    memories: [
      { label: 'The move', text: 'Four flights of stairs, no lift, in July.' },
      { label: 'Karaoke', text: 'We do not discuss the karaoke.' },
    ],
    wishes: ['A slow morning', 'Something you did not plan', 'People who show up', 'One very good meal'],
  };

  const momStory: StoryInput = {
    recipientName: 'Mama',
    senderName: 'Firdavs',
    relationship: 'mom',
    occasion: 'for-mom',
    mood: 'warm',
    story:
      'Mama,\n\nI called last Sunday and we talked about the weather for twenty minutes, which is our way of saying the other thing.\n\nSo I am writing the other thing down.\n\nAlmost everything I do well, I do because I watched you do it first — the patience especially, though I am still some distance behind. You never made any of it look like effort. I understand now that it was.\n\nThank you. For the enormous things, and for the thousand small ones I only noticed years later.',
    photos: demoPhotos('mama', 3, photoColors(palettes.linen)),
    moments: [
      { date: 'Every September', title: 'The first day of school', text: 'You ironed the shirt twice.' },
      { date: '2016', title: 'The year everything moved', text: 'You never once said you were tired.' },
    ],
  };

  return [
    order({
      id: 'ord_alina',
      code: '8FJ29K',
      customer: { name: 'Firdavs', email: 'firdavs@example.com', shop: 'Fleur Atelier' },
      recipient: { name: 'Alina', relationship: 'girlfriend' },
      occasion: 'love',
      mood: 'romantic',
      message: alinaStory.story,
      photos: alinaStory.photos,
      moments: alinaStory.moments ?? [],
      memories: alinaStory.memories ?? [],
      wishes: [],
      templateId: 'romantic',
      status: 'PUBLISHED',
      notes: 'Peonies. Customer asked for the card to be ready before 6pm pickup.',
      daysAgo: 2,
      story: alinaStory,
    }),

    order({
      id: 'ord_marta',
      code: 'QW47HD',
      customer: { name: 'Kasia Nowak', email: 'kasia@example.com', shop: 'Fleur Atelier' },
      recipient: { name: 'Marta', relationship: 'friend' },
      occasion: 'birthday',
      mood: 'warm',
      message: martaStory.story,
      photos: martaStory.photos,
      moments: [],
      memories: martaStory.memories ?? [],
      wishes: martaStory.wishes ?? [],
      templateId: 'birthday',
      status: 'PUBLISHED',
      daysAgo: 5,
      story: martaStory,
    }),

    order({
      id: 'ord_mama',
      code: 'RT52MP',
      customer: { name: 'Firdavs', email: 'firdavs@example.com', shop: 'Botanica' },
      recipient: { name: 'Mama', relationship: 'mom' },
      occasion: 'for-mom',
      mood: 'warm',
      message: momStory.story,
      photos: momStory.photos,
      moments: momStory.moments ?? [],
      memories: [],
      wishes: [],
      templateId: 'mom',
      status: 'READY',
      notes: 'Waiting on the customer to confirm the second photograph.',
      daysAgo: 1,
      story: momStory,
    }),

    order({
      id: 'ord_haruto',
      code: 'KD83VN',
      customer: { name: 'Emi Tanaka', shop: 'Botanica' },
      recipient: { name: 'Haruto', relationship: 'someone-special' },
      occasion: 'just-because',
      mood: 'minimal',
      message: 'No occasion. I saw the branch in the window and thought of you.',
      photos: [],
      moments: [],
      memories: [],
      wishes: [],
      templateId: 'sakura',
      status: 'REVIEW',
      daysAgo: 1,
      story: {
        recipientName: 'Haruto',
        senderName: 'Emi',
        relationship: 'someone-special',
        occasion: 'just-because',
        mood: 'minimal',
        story: 'No occasion. I saw the branch in the window and thought of you.',
        photos: [],
      },
    }),

    order({
      id: 'ord_daniel',
      code: 'PF61XC',
      customer: { name: 'Sofia Ruiz', shop: 'Maison Verte' },
      recipient: { name: 'Daniel', relationship: 'husband' },
      occasion: 'anniversary',
      mood: 'elegant',
      message: 'Ten years. I would like the card to feel like the good hotel we could not afford in 2016.',
      photos: [],
      moments: [],
      memories: [],
      wishes: [],
      templateId: 'anniversary',
      status: 'PROCESSING',
      daysAgo: 0,
      story: {
        recipientName: 'Daniel',
        senderName: 'Sofia',
        relationship: 'husband',
        occasion: 'anniversary',
        mood: 'elegant',
        story: 'Ten years. I would like the card to feel like the good hotel we could not afford in 2016.',
        photos: [],
        moments: [
          { date: '2016', title: 'The bad hotel', text: 'It rained for six days.' },
          { date: '2019', title: 'The flat with the loud radiator' },
          { date: '2024', title: 'Ten years' },
        ],
      },
    }),

    order({
      id: 'ord_lena',
      code: 'ZH94BT',
      customer: { name: 'Tomás Silva', shop: 'Maison Verte' },
      recipient: { name: 'Lena', relationship: 'family' },
      occasion: 'celebration',
      mood: 'warm',
      message: 'She finished the degree. Nobody in our family has done that before.',
      photos: [],
      moments: [],
      memories: [],
      wishes: [],
      templateId: 'memories',
      status: 'NEW',
      daysAgo: 0,
      story: {
        recipientName: 'Lena',
        senderName: 'Tomás',
        relationship: 'family',
        occasion: 'celebration',
        mood: 'warm',
        story: 'She finished the degree. Nobody in our family has done that before.',
        photos: [],
      },
    }),
  ];
}
