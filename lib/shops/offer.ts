/**
 * THE COMMERCIAL OFFER
 * ====================
 * Every number a flower shop is shown lives here, and nowhere else.
 *
 * ⚠️ **These are placeholders.** Not one of them has been tested against a
 * real florist, and STATUS.md is explicit that the price comes from asking one
 * rather than from guessing. They are here so the page can be built, read and
 * argued with — change them here and the whole page follows.
 *
 * The shape is what has been decided, and that part is not a guess:
 *
 *   - The shop is the customer. It keeps most of what the card sells for.
 *   - Charged per published card. Never a subscription — small shops here will
 *     not buy software on a recurring basis.
 *   - The fee is owed at publish, which is *after* the shop has taken the
 *     customer's money. The platform never asks for money the shop does not
 *     already hold.
 *   - The first cards are free, because early feedback is worth more than
 *     early revenue.
 */

export const OFFER = {
  /** UZS. Written out rather than abbreviated: florists price in full sums. */
  currency: 'сум',

  /**
   * What the shop charges the customer for a card, as a share of the bouquet.
   *
   * Expressed as a fraction rather than a fixed price on purpose: a card sold
   * beside a 200 000 bouquet and one sold beside a million-sum arrangement are
   * not the same upsell. Roughly a tenth to a fifth is the band that stays an
   * impulse yes.
   */
  suggestedShare: { low: 0.1, high: 0.2 },

  /**
   * The platform's cut of what the card sells for.
   *
   * A share rather than a fixed sum, and that is a correction rather than a
   * preference: a flat fee was tried first and it collapses at the bottom of
   * the range. Beside a 100 000 bouquet the suggested card is 15 000, so a
   * 15 000 fee left the shop earning nothing — the calculator showed it
   * immediately, which is the reason it exists. A share cannot do that. The
   * shop keeps the rest, and the rest is always the majority.
   */
  feeShare: 0.25,

  /** Free cards before the fee starts. */
  freeCards: 15,

  /**
   * Defaults for the earnings calculator — a mid-range Tashkent bouquet and a
   * modest guess at how many cards a shop sells in a month. Both are the
   * florist's to change on the page; these only decide where the sliders start.
   */
  calculator: {
    bouquetPrice: { min: 100_000, max: 1_000_000, step: 50_000, default: 300_000 },
    cardsPerMonth: { min: 1, max: 60, step: 1, default: 15 },
  },

  /** Where a shop actually reaches a human. Set this before the page is shared. */
  telegram: '@morethanabouquet',
} as const;

/** The card price this offer suggests beside a bouquet of `bouquetPrice`. */
export function suggestedCardPrice(bouquetPrice: number): number {
  const mid = (OFFER.suggestedShare.low + OFFER.suggestedShare.high) / 2;
  // Rounded to the nearest 5 000: nobody prices an upsell at 37 400.
  return Math.round((bouquetPrice * mid) / 5_000) * 5_000;
}

/** What the shop keeps, per card and per month, after the platform's share. */
export function shopEarnings(bouquetPrice: number, cardsPerMonth: number) {
  const cardPrice = suggestedCardPrice(bouquetPrice);
  const fee = Math.round((cardPrice * OFFER.feeShare) / 1_000) * 1_000;
  const perCard = cardPrice - fee;

  return {
    cardPrice,
    perCard,
    perMonth: perCard * cardsPerMonth,
    feePerMonth: fee * cardsPerMonth,
  };
}
