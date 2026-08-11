import { headers } from 'next/headers';

export const SITE = {
  name: 'More than a bouquet',
  /** The positioning line. Used in the header, the footer and the QR card. */
  promise: 'Your bouquet says I care. Your digital card tells them why.',
  tagline: 'A little world, made just for them.',
} as const;

/**
 * Absolute origin for QR codes and share links.
 *
 * Prefers the configured public URL (the only value that is correct on a
 * printed card), then the forwarded host from the current request, then
 * localhost for development.
 */
export async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');

  try {
    const list = await headers();
    const host = list.get('x-forwarded-host') ?? list.get('host');
    if (host) {
      const protocol = list.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
      return `${protocol}://${host}`;
    }
  } catch {
    // Called outside a request scope (build-time metadata, scripts).
  }

  return 'http://localhost:3000';
}
