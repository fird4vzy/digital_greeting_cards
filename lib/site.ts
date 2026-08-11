/**
 * Brand constants. Deliberately free of server-only imports so client
 * components can use them — `siteOrigin()` lives in `lib/site-origin.ts`
 * because it reads request headers.
 */
export const SITE = {
  name: 'More than a bouquet',
  /** The positioning line. Used in the header, the footer and the QR card. */
  promise: 'Your bouquet says I care. Your digital card tells them why.',
  tagline: 'A little world, made just for them.',
} as const;
