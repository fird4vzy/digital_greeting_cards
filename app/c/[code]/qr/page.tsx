import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Wordmark } from '@/components/site/Wordmark';
import { QrActions } from '@/components/qr/QrActions';
import { cardStrings } from '@/lib/card/copy';
import { getOrderByCode } from '@/lib/db';
import { getI18n } from '@/lib/i18n/server';
import { cardUrl, qrSvg } from '@/lib/qr';
import { SITE } from '@/lib/site';
import { siteOrigin } from '@/lib/site-origin';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();

  return {
    title: dict.ui.qr.title,
    robots: { index: false, follow: false },
  };
}

type Props = { params: Promise<{ code: string }> };

/**
 * The physical half of the product: the card a flower shop prints and ties to
 * the stems.
 *
 * Sized as a 55 × 85 mm hang tag in real millimetres so a shop can print it at
 * 100% and cut to the crop marks. Everything that is not the tag is marked
 * `print-hide`, so ⌘P produces the card and nothing else.
 *
 * **Two languages on one page.** The instructions are for the florist, so they
 * follow the operator's locale. The tag is read by the recipient standing over
 * a bouquet, so its one line follows the *card's* locale — the same split the
 * rest of the product makes, and the reason a Russian card cannot end up with
 * an English tag tied to it.
 */
export default async function QrCardPage({ params }: Props) {
  const { code } = await params;
  const order = await getOrderByCode(code);

  // Та же граница, что у `/preview`: страница показывает имена получателя и
  // заказчика, и для отменённого заказа показывать их нечего. За сессию
  // оператора её не убрать — сюда приходит и заказчик, сразу после того как
  // собрал открытку (`components/create/PublishedCard.tsx`).
  if (!order || order.status === 'CANCELLED') notFound();

  const { dict } = await getI18n();
  const t = dict.ui.qr;
  const tag = cardStrings(order.locale);

  const origin = await siteOrigin();
  const url = cardUrl(origin, order.code);
  const qr = await qrSvg(url, { dark: '#191512', margin: 0, width: 320 });

  return (
    <main className="min-h-[100svh] bg-paper-warm px-[var(--spacing-gutter)] py-14">
      <div className="print-hide mx-auto mb-12 max-w-[36rem] text-center">
        <Wordmark href="/" />
        <h1 className="mt-8 font-display text-display-sm leading-[1.05] tracking-[-0.025em] text-ink">
          {t.title}
        </h1>
        <p className="mt-5 text-body text-pretty text-ink-soft">
          {t.lead
            .replace('{recipient}', order.recipient.name)
            .replace('{sender}', order.customer.name)}
        </p>

        <QrActions
          url={url}
          labels={{ print: t.print, copyLink: t.copyLink, copied: t.copied }}
        />
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
            {tag.tagLine}
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
            {SITE.name}
          </span>
        </div>
      </div>

      <p className="print-hide mx-auto mt-8 max-w-[36rem] break-all text-center text-caption text-ink-muted">
        {url}
      </p>
    </main>
  );
}
