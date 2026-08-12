import type { Locale } from './config';
import type { PluralForms } from './types';

/**
 * Picks the right plural form for a count.
 *
 * The site used to write `${n} order${n === 1 ? '' : 's'}` inline, which is
 * fine for English and untranslatable everywhere else: Russian needs three
 * forms for the same noun (1 заказ, 2 заказа, 5 заказов) and picks between
 * them on the last digit, not on "is it one". Uzbek needs one form and leaves
 * the noun alone after a numeral.
 *
 * `Intl.PluralRules` already knows all of these rules, so the dictionary only
 * has to supply the wording for the categories its language actually uses.
 * `{count}` in the chosen form is replaced with the number, formatted for the
 * locale.
 */
export function plural(count: number, forms: PluralForms, locale: Locale): string {
  const category = new Intl.PluralRules(locale).select(count);

  // `other` is the guaranteed fallback: every language defines it, and a
  // locale that omits a category it never selects still resolves.
  const form = forms[category as keyof PluralForms] ?? forms.other;

  return form.replaceAll('{count}', new Intl.NumberFormat(locale).format(count));
}
