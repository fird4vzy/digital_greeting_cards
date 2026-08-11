import type { OccasionId } from './taxonomy';

/**
 * The copy bank.
 *
 * Templates compose a card out of the customer's own words plus these lines.
 * Keeping them here — rather than inside components — means the writing can be
 * edited, localised or replaced by an AI-written variant without touching a
 * single component.
 *
 * House style: short. Concrete over abstract. Never "special moments",
 * never exclamation marks, never "cherish".
 */

export type OccasionCopy = {
  /** Framing line right after the cover. */
  intro: string;
  /** Pull quote used mid-story. */
  quote: string;
  /** Section titles. */
  galleryTitle: string;
  timelineTitle: string;
  memoriesTitle: string;
  /** The last full-screen message. */
  finalHeadline: string;
  finalText: string;
  signOff: string;
  /** Placeholder letter, used only when the customer left the story empty. */
  fallbackLetter: (recipient: string) => string;
};

const bank: Record<OccasionId, OccasionCopy> = {
  love: {
    intro: 'There are things that are too big for a text message.',
    quote: 'I did not fall for you all at once. I keep falling, quietly, on ordinary Tuesdays.',
    galleryTitle: 'Us, mostly unposed',
    timelineTitle: 'How we got here',
    memoriesTitle: 'Small things I kept',
    finalHeadline: 'Some people make ordinary days feel a little less ordinary.',
    finalText: 'You are the reason I keep noticing them.',
    signOff: 'With love,',
    fallbackLetter: (recipient) =>
      `${recipient},\n\nI am not always good at saying this out loud, so I am writing it down instead.\n\nYou make the ordinary parts of my life better. Not in a dramatic way — in the quiet way, the one you only notice when you imagine it missing.\n\nI wanted you to have something you could keep.`,
  },

  birthday: {
    intro: 'A whole year of you. That deserves more than a message.',
    quote: 'The world got noticeably better the year you turned up in it.',
    galleryTitle: 'This year, in pieces',
    timelineTitle: 'The year, roughly',
    memoriesTitle: 'Reasons to celebrate you',
    finalHeadline: 'Here is to another year of you being exactly who you are.',
    finalText: 'No notes. No edits. Just more of it.',
    signOff: 'Happy birthday,',
    fallbackLetter: (recipient) =>
      `Happy birthday, ${recipient}.\n\nI could have sent a message. It felt too small for the occasion.\n\nSo instead: a whole year of you happened, and it made things better for everyone standing near you. That is worth saying properly.\n\nHave the day you actually want.`,
  },

  'for-mom': {
    intro: 'There are things that never quite fit into a phone call.',
    quote: 'Everything soft in me, I learned from you.',
    galleryTitle: 'Us, over the years',
    timelineTitle: 'Things you gave me',
    memoriesTitle: 'What I remember',
    finalHeadline: 'Thank you. For all of it, including the parts I never noticed.',
    finalText: 'I notice them now.',
    signOff: 'With love,',
    fallbackLetter: (recipient) =>
      `${recipient},\n\nI do not say this often enough, and a phone call never seems like the right place for it.\n\nSo much of how I move through the world came from you. The patience especially — I am still working on that one.\n\nThank you. For the enormous things, and for the thousand small ones I only understood later.`,
  },

  anniversary: {
    intro: 'Years, measured in ordinary mornings.',
    quote: 'Given the choice again, and again after that — you.',
    galleryTitle: 'The evidence',
    timelineTitle: 'The years so far',
    memoriesTitle: 'Things worth keeping',
    finalHeadline: 'Still you. Still this. Still glad.',
    finalText: 'Here is to the next stretch of ordinary mornings.',
    signOff: 'Always,',
    fallbackLetter: (recipient) =>
      `${recipient},\n\nAnother year. It went quickly, which I am told is a good sign.\n\nWhat I keep coming back to is not the big occasions but the ordinary evenings — the ones that would be unremarkable with anyone else.\n\nI would choose this again. I do, most days, without thinking about it.`,
  },

  friendship: {
    intro: 'Some people just stay. You are one of them.',
    quote: 'Not everyone stays. You never made it a question.',
    galleryTitle: 'Exhibits A through Z',
    timelineTitle: 'A brief history',
    memoriesTitle: 'Things I have not forgotten',
    finalHeadline: 'Thank you for being easy to love and hard to lose.',
    finalText: 'You already know. Here it is in writing anyway.',
    signOff: 'Yours,',
    fallbackLetter: (recipient) =>
      `${recipient},\n\nThis is not an occasion card. It is more of a receipt.\n\nYou have shown up for a lot of things that were not convenient, and never once made it feel like a favour. That is rarer than you think.\n\nAnyway. Flowers seemed like the right amount of dramatic.`,
  },

  celebration: {
    intro: 'You did the thing. Properly, and against the odds.',
    quote: 'Nobody saw the early mornings. I did.',
    galleryTitle: 'How it looked',
    timelineTitle: 'The long way round',
    memoriesTitle: 'What it took',
    finalHeadline: 'Whatever comes next, you have already proved the point.',
    finalText: 'Take the win. Properly, for once.',
    signOff: 'So proud of you,',
    fallbackLetter: (recipient) =>
      `${recipient},\n\nCongratulations. Genuinely.\n\nMost people will see the result. I saw the part before it — the unglamorous stretch where it was not obvious this would work, and you kept going anyway.\n\nThat is the part worth celebrating.`,
  },

  'just-because': {
    intro: 'No occasion. Just a Tuesday, and you on my mind.',
    quote: 'Some days you do not need a reason. This is one of those days.',
    galleryTitle: 'Nothing in particular',
    timelineTitle: 'Assorted evidence',
    memoriesTitle: 'Small things',
    finalHeadline: 'No reason. That is the whole reason.',
    finalText: 'Hope it landed on a good day.',
    signOff: 'Thinking of you,',
    fallbackLetter: (recipient) =>
      `${recipient},\n\nThere is no occasion attached to this. Nothing happened, nothing is coming up.\n\nI just thought about you at an ordinary moment on an ordinary day and decided that was reason enough.\n\nThat is the whole message.`,
  },
};

const fallback = bank['just-because'];

export function copyFor(occasion: string): OccasionCopy {
  return bank[occasion as OccasionId] ?? fallback;
}

/**
 * The signature moment. Every card in the product opens on the recipient's
 * name and this line — it is the one piece of copy that is deliberately not
 * customisable, because it is the brand.
 */
export const COVER_HEADLINE = 'there’s something waiting for you…';

export const OPEN_PROMPTS = {
  wax: 'Open it',
  ribbon: 'Pull the ribbon',
  washi: 'Unfold',
} as const;
