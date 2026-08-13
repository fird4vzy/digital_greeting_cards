import type { Metadata, Viewport } from 'next';
import { SITE } from '@/lib/site';
import { Instrument_Serif, Inter } from 'next/font/google';
import { LOCALE_META } from '@/lib/i18n/config';
import { getLocale } from '@/lib/i18n/server';
import './globals.css';

/**
 * Two families, no more. Instrument Serif carries every emotional line in the
 * product; Inter carries every functional one. The contrast between them is
 * the entire typographic system.
 */
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
  fallback: ['Iowan Old Style', 'Georgia', 'serif'],
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description:
    'Some feelings deserve more than a message. Create a little digital world for someone special, and attach it to their flowers.',
  openGraph: {
    title: SITE.name,
    description: 'Create a little digital world for someone special.',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#f6f2ec',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  // Cards are read one-handed on a phone; pinch-zoom must stay available.
  maximumScale: 5,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Card routes are excluded from locale negotiation, so this is the site's
  // language. A published card overrides it on its own wrapper — see
  // CardRenderer — because a card's language belongs to the card.
  const locale = await getLocale();

  return (
    <html lang={LOCALE_META[locale].htmlLang} className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
