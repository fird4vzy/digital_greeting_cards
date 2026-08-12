/**
 * i18n configuration.
 *
 * Two locale concepts live in this product and they are deliberately separate:
 *
 *   uiLocale   — the language the *visitor* browses in. Comes from the URL
 *                segment (/ru, /uz, /en) and is negotiated from the browser.
 *   cardLocale — the language a *published card* is written in. Stored on the
 *                card itself (`CardConfig.locale`).
 *
 * They must not be conflated. A card link is handed to a recipient whose
 * browser may be in any language; a card written in Russian has to stay in
 * Russian when a shop owner opens it from an English admin panel. That is why
 * `/c/[code]` sits outside the `[locale]` segment entirely.
 */

export const LOCALES = ['ru', 'uz', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when negotiation finds nothing usable. */
export const DEFAULT_LOCALE: Locale = 'ru';

export const LOCALE_META: Record<Locale, { label: string; native: string; htmlLang: string }> = {
  ru: { label: 'Русский', native: 'Русский', htmlLang: 'ru' },
  // Latin script — the official standard in Uzbekistan.
  uz: { label: "O'zbekcha", native: "O'zbekcha", htmlLang: 'uz-Latn' },
  en: { label: 'English', native: 'English', htmlLang: 'en' },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function asLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/**
 * Picks the best locale from an Accept-Language header.
 *
 * Deliberately hand-rolled rather than pulled from a negotiation library: the
 * whole rule set is "match a language subtag, respect q-weights, fall back" —
 * about fifteen lines — and it runs in middleware on every request, where an
 * extra dependency is real weight.
 */
export function negotiateLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      return {
        // "uz-Latn-UZ" and "ru-RU" both reduce to their language subtag.
        tag: (tag ?? '').trim().toLowerCase().split('-')[0] ?? '',
        q: q ? Number.parseFloat(q.split('=')[1] ?? '1') : 1,
      };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const entry of ranked) {
    if (isLocale(entry.tag)) return entry.tag;
  }

  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = 'mtab_locale';

/** Set by middleware so server components can read the negotiated locale. */
export const LOCALE_HEADER = 'x-mtab-locale';
