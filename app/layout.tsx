import type { Metadata, Viewport } from 'next';
import { Instrument_Serif, Inter } from 'next/font/google';
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
    default: 'More than a bouquet',
    template: '%s · More than a bouquet',
  },
  description:
    'Some feelings deserve more than a message. Create a little digital world for someone special, and attach it to their flowers.',
  openGraph: {
    title: 'More than a bouquet',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
