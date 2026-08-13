import Link from 'next/link';
import { NotificationCheck } from '@/components/admin/NotificationCheck';
import { StatusPill } from '@/components/admin/StatusPill';
import { listOrders } from '@/lib/db';
import { notificationState } from '@/lib/notify/telegram';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/db/types';
import { getI18n } from '@/lib/i18n/server';
import { localiseTemplate, localisedStatus, occasionLabel } from '@/lib/i18n/localise';
import { plural } from '@/lib/i18n/plural';
import { resolveTemplate } from '@/templates';

// The dashboard reflects a live queue; prerendering it at build time would
// show an operator whatever the data looked like when the image was built.
export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const { locale, dict } = await getI18n();
  const t = dict.admin.overview;
  const orders = await listOrders();

  const counts = ORDER_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: orders.filter((o) => o.status === status).length }),
    {} as Record<OrderStatus, number>,
  );

  const needsAttention = orders.filter(
    (order) => order.status === 'NEW' || order.status === 'REVIEW',
  );

  return (
    <>
      <header className="mb-10">
        <h1 className="font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
          {t.title}
        </h1>
        <p className="mt-3 text-caption text-ink-muted">
          {plural(orders.length, t.count, locale)}
        </p>
      </header>

      {/* The queue, as a single row of counts. */}
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[1rem] border border-line bg-line sm:grid-cols-5">
        {ORDER_STATUSES.map((status) => {
          const meta = localisedStatus(status, dict);

          return (
            <Link
              key={status}
              href={`/admin/orders?status=${status}`}
              className="group bg-paper p-5 transition-colors duration-300 hover:bg-white"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="block h-1.5 w-1.5 rounded-full"
                  style={{ background: meta.tone }}
                />
                <span className="eyebrow text-ink-muted">{meta.label}</span>
              </span>
              <p className="mt-4 font-display text-[2.5rem] leading-none tabular-nums text-ink">
                {counts[status]}
              </p>
              <p className="mt-2 text-[0.75rem] leading-snug text-ink-faint">{meta.hint}</p>
            </Link>
          );
        })}
      </div>

      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-title leading-none text-ink">{t.needsPerson}</h2>
          <Link href="/admin/orders" className="text-caption text-ink-muted hover:text-ink">
            {t.allOrders}
          </Link>
        </div>

        {needsAttention.length === 0 ? (
          <p className="mt-6 rounded-[1rem] border border-line bg-white/50 p-8 text-center text-caption text-ink-muted">
            {t.nothingWaiting}
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {needsAttention.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2 py-5 transition-colors duration-300 hover:bg-white/60"
                >
                  <span className="font-display text-[1.15rem] leading-none text-ink">
                    {order.recipient.name}
                  </span>
                  <span className="text-caption text-ink-muted">
                    {occasionLabel(order.occasion, dict)} ·{' '}
                    {localiseTemplate(resolveTemplate(order.templateId), dict).name}
                  </span>
                  <span className="text-caption text-ink-faint">
                    {order.customer.shop ?? dict.admin.order.direct}
                  </span>
                  <StatusPill status={order.status} className="ml-auto" />
                  <span className="eyebrow w-16 text-right text-ink-faint tabular-nums">
                    {order.code}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Read on the server: the state is derived from the variables, and
          neither value ever crosses to the browser. */}
      <NotificationCheck state={notificationState()} strings={dict.admin.notifications} />
    </>
  );
}
