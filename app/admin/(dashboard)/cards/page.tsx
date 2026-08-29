import Link from 'next/link';
import { CopyButton } from '@/components/admin/CopyButton';
import { listOrders, toPublishedCard } from '@/lib/db';
import { siteOrigin } from '@/lib/site-origin';
import { getI18n } from '@/lib/i18n/server';
import { localiseTemplate, occasionLabel } from '@/lib/i18n/localise';
import { plural } from '@/lib/i18n/plural';
import { resolveTemplate } from '@/templates';

export async function generateMetadata() {
  const { dict } = await getI18n();
  return { title: dict.admin.nav.cards };
}

/**
 * Published cards.
 *
 * A projection over published orders rather than a second table — see
 * lib/db/types.ts for why. This is the page a shop opens when someone rings
 * up saying the code on their tag does not work.
 */
export default async function CardsPage() {
  const { locale, dict } = await getI18n();
  const t = dict.admin.cards;

  const origin = await siteOrigin();
  const orders = await listOrders({ status: 'PUBLISHED' });
  const cards = orders.map((order) => ({ order, card: toPublishedCard(order, origin) }));

  return (
    <>
      <header className="mb-10">
        <h1 className="font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
          {t.title}
        </h1>
        <p className="mt-3 text-caption text-ink-muted">
          {plural(cards.length, t.count, locale)} {t.neverIndexed}
        </p>
      </header>

      {cards.length === 0 ? (
        <p className="rounded-[1rem] border border-line bg-white/50 p-10 text-center text-caption text-ink-muted">
          {t.none}
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
                  alt={`${t.qrAlt} ${card.code}`}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] shrink-0"
                />
                <div className="min-w-0">
                  <p className="font-display text-title leading-none text-ink">
                    {card.recipientName}
                  </p>
                  <p className="mt-2 text-caption text-ink-muted">
                    {t.from} {card.senderName} · {occasionLabel(card.occasion, dict)}
                  </p>
                  <p className="mt-1 text-caption text-ink-muted">
                    {localiseTemplate(resolveTemplate(card.templateId), dict).name}
                  </p>
                </div>
              </div>

              <p className="mt-4 eyebrow text-ink-muted tabular-nums">{card.code}</p>
              <p className="mt-2 break-all text-[0.7rem] leading-relaxed text-ink-muted">
                {card.url}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href={`/c/${card.code}`}
                  className="rounded-[0.5rem] border border-line-strong px-3 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {t.open}
                </Link>
                <Link
                  href={`/c/${card.code}/qr`}
                  className="rounded-[0.5rem] border border-line-strong px-3 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {t.print}
                </Link>
                <div className="col-span-2">
                  <CopyButton value={card.url} label={t.copyLink} copiedLabel={t.copied} />
                </div>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="col-span-2 text-center text-caption text-ink-muted hover:text-ink"
                >
                  {t.openOrder}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
