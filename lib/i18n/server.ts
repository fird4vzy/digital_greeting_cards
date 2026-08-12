import 'server-only';

import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_HEADER, asLocale, type Locale } from './config';
import { getDictionary } from './index';
import type { Dictionary } from './types';

/**
 * Reads the locale middleware negotiated for this request.
 *
 * Falls back to the cookie and then the default, so a route the middleware
 * matcher skips (or a component rendered outside a request) still gets a
 * sensible language rather than throwing.
 */
export async function getLocale(): Promise<Locale> {
  try {
    const requestHeaders = await headers();
    const fromHeader = requestHeaders.get(LOCALE_HEADER);
    if (fromHeader) return asLocale(fromHeader);

    const store = await cookies();
    return asLocale(store.get(LOCALE_COOKIE)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** The locale plus its dictionary — what almost every page actually wants. */
export async function getI18n(): Promise<{ locale: Locale; dict: Dictionary }> {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
