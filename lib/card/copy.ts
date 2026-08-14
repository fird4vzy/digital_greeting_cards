import { getDictionary, t } from '@/lib/i18n';
import type { OccasionCopyStrings } from '@/lib/i18n/types';
import type { OccasionId } from './taxonomy';

/**
 * The copy bank, now keyed by the *card's* locale.
 *
 * This is card content, not site chrome: it is baked into the CardConfig at
 * compose time and travels with the card forever. A card composed in Russian
 * stays Russian when the recipient opens it on an English phone, and stays
 * Russian if the site's default language changes next year.
 *
 * House style lives in the dictionaries themselves — see lib/i18n/dictionaries.
 */

export type OccasionCopy = Omit<OccasionCopyStrings, 'fallbackLetter'> & {
  /** Substitutes the recipient's first name into the locale's template. */
  fallbackLetter: (recipient: string) => string;
};

export function copyFor(occasion: string, locale: string): OccasionCopy {
  const dictionary = getDictionary(locale);
  const bank = dictionary.content.copy;
  const strings = bank[occasion as OccasionId] ?? bank['just-because'];

  return {
    ...strings,
    fallbackLetter: (recipient: string) => t(strings.fallbackLetter, { name: recipient }),
  };
}

/**
 * The signature cover line. Every card in the product opens on the recipient's
 * name and this — it is the one piece of copy that is deliberately not
 * customisable, because it is the brand.
 */
export function coverHeadline(locale: string): string {
  return getDictionary(locale).content.coverHeadline;
}

/** Built-in strings rendered inside a card, in the card's own language. */
export type CardStrings = ReturnType<typeof cardStrings>;

export function cardStrings(locale: string) {
  return getDictionary(locale).content.card;
}

export function openPrompt(variant: string | undefined, locale: string): string {
  const strings = cardStrings(locale);
  if (variant === 'ribbon') return strings.pullRibbon;
  if (variant === 'washi') return strings.unfold;
  return strings.open;
}
