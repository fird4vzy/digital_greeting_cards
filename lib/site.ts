/**
 * The brand name, in one place.
 *
 * Everything that prints the name reads it from here — the header, the
 * colophon inside a card, the printed tag, every page title. That is the whole
 * point of the file: the last rename touched a dozen files, and the next one
 * should touch this line.
 *
 * Deliberately free of server-only imports so client components can use it.
 * `siteOrigin()` lives in `lib/site-origin.ts` because it reads request
 * headers.
 *
 * **The name is not translated.** "Bir dunyo" is Uzbek for "a whole world" and
 * it stays that way in Russian and English pages, the way a name does. The
 * tagline *is* translated and therefore lives in the dictionaries, not here —
 * see `ui.closing.title`.
 */
export const SITE = {
  name: 'Bir dunyo',
} as const;
