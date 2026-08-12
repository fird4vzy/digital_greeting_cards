import Link from 'next/link';
import { CopyButton } from '@/components/admin/CopyButton';
import { listOrders, toPublishedCard } from '@/lib/db';
import { siteOrigin } from '@/lib/site-origin';
import { occasionLabel } from '@/lib/card/taxonomy';
import { resolveTemplate } from '@/templates';

export const metadata = { title: 'Cards' };

/**
 * Published cards.
 *
 * A projection over published orders rather than a second table — see
 * lib/db/types.ts for why. This is the page a shop opens when someone rings
 * up saying the code on their tag does not work.
 */
export default async function CardsPage() {
  const origin = await siteOrigin();
  const orders = await listOrders({ status: 'PUBLISHED' });
  const cards = orders.map((order) => ({ order, card: toPublishedCard(order, origin) }));

  return (
    <>
      <header className="mb-10">
        <h1 className="font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
          Cards
        </h1>
        <p className="mt-3 text-caption text-ink-muted">
          {cards.length} live card{cards.length === 1 ? '' : 's'}. Each one is private and never
          indexed.
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="rounded-[1rem] border border-line bg-white/50 p-10 text-center text-caption text-ink-muted">
          Nothing published yet.
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map(({ order, card }) => (
            <li
              key={card.id}
              className="flex flex-col rounded-[1rem] border border-line bg-white/60 p-5"
            >
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/qr/${card.code}?size=256`}
                  alt={`QR code for ${card.code}`}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-display text-title leading-none text-ink">
                    {card.recipientName}
                  </p>
                  <p className="mt-2 text-caption text-ink-muted">
                    from {card.senderName} · {occasionLabel(card.occasion)}
                  </p>
                  <p className="mt-1 text-caption text-ink-faint">
                    {resolveTemplate(card.templateId).name}
                  </p>
                </div>
              </div>

              <p className="mt-4 eyebrow text-ink-faint tabular-nums">{card.code}</p>
              <p className="mt-2 break-all text-[0.7rem] leading-relaxed text-ink-faint">
                {card.url}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href={`/c/${card.code}`}
                  className="rounded-[0.5rem] border border-line-strong px-3 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  Open
                </Link>
                <Link
                  href={`/c/${card.code}/qr`}
                  className="rounded-[0.5rem] border border-line-strong px-3 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  Print
                </Link>
                <div className="col-span-2">
                  <CopyButton value={card.url} label="Copy link" />
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="col-span-2 text-center text-caption text-ink-muted hover:text-ink"
                >
                  Open the order
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
