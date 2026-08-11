import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Wordmark } from '@/components/site/Wordmark';
import { QrActions } from '@/components/qr/QrActions';
import { getOrderByCode } from '@/lib/db';
import { cardUrl, qrSvg } from '@/lib/qr';
import { siteOrigin } from '@/lib/site-origin';

export const metadata: Metadata = {
  title: 'Printable card',
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

/**
 * The physical half of the product: the card a flower shop prints and ties to
 * the stems.
 *
 * Sized as a 55 × 85 mm hang tag in real millimetres so a shop can print it at
 * 100% and cut to the crop marks. Everything that is not the tag is marked
 * `print-hide`, so ⌘P produces the card and nothing else.
 */
export default async function QrCardPage({ params }: Props) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order) notFound();

  const origin = await siteOrigin();
  const url = cardUrl(origin, order.code);
  const qr = await qrSvg(url, { dark: '#191512', margin: 0, width: 320 });

  return (
    <main className="min-h-[100svh] bg-paper-warm px-[var(--spacing-gutter)] py-14">
      <div className="print-hide mx-auto mb-12 max-w-[36rem] text-center">
        <Wordmark href="/" />
        <h1 className="mt-8 font-display text-display-sm leading-[1.05] tracking-[-0.025em] text-ink">
          The card for the bouquet.
        </h1>
        <p className="mt-5 text-body text-pretty text-ink-soft">
          Print at 100% on matte card stock, cut to the marks, and tie it to the stems.
          For {order.recipient.name}, from {order.customer.name}.
        </p>

        <QrActions url={url} />
      </div>

      {/* The tag itself — real millimetres, so scale is honest at print time. */}
      <div
        className="print-sheet mx-auto flex flex-col items-center justify-between bg-white text-ink shadow-[var(--shadow-float)]"
        style={{ width: '55mm', height: '85mm', padding: '7mm 6mm' }}
      >
        <div className="flex flex-col items-center gap-[2mm]">
          <svg viewBox="0 0 40 40" aria-hidden="true" style={{ width: '7mm', height: '7mm' }}>
            <g fill="#a33b48">
              {[0, 72, 144, 216, 288].map((angle) => (
                <ellipse
                  key={angle}
                  cx="20"
                  cy="11.5"
                  rx="5.2"
                  ry="8"
                  opacity="0.9"
                  transform={`rotate(${angle} 20 20)`}
                />
              ))}
            </g>
            <circle cx="20" cy="20" r="2.6" fill="#fff" opacity="0.8" />
          </svg>

          <p
            className="text-center font-display leading-[1.25] text-ink"
            style={{ fontSize: '4.1mm', maxWidth: '40mm' }}
          >
            There&rsquo;s a little something extra for you.
          </p>
        </div>

        <span
          className="block [&_svg]:h-full [&_svg]:w-full"
          style={{ width: '30mm', height: '30mm' }}
          dangerouslySetInnerHTML={{ __html: qr }}
        />

        <div className="flex flex-col items-center gap-[1.5mm]">
          <span
            className="uppercase tabular-nums text-ink"
            style={{ fontSize: '2.6mm', letterSpacing: '0.22em' }}
          >
            {order.code}
          </span>
          <span
            className="uppercase text-ink-muted"
            style={{ fontSize: '1.9mm', letterSpacing: '0.18em' }}
          >
            More than a bouquet
          </span>
        </div>
      </div>

      <p className="print-hide mx-auto mt-8 max-w-[36rem] break-all text-center text-caption text-ink-muted">
        {url}
      </p>
    </main>
  );
}
