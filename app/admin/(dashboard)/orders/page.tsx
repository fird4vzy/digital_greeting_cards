import Link from 'next/link';
import { StatusPill } from '@/components/admin/StatusPill';
import { listOrders } from '@/lib/db';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/db/types';
import { getI18n } from '@/lib/i18n/server';
import {
  localiseTemplate,
  localisedStatus,
  occasionLabel,
  recipientLabel,
} from '@/lib/i18n/localise';
import { plural } from '@/lib/i18n/plural';
import { resolveTemplate } from '@/templates';
import { cn } from '@/lib/utils/cn';

export async function generateMetadata() {
  const { dict } = await getI18n();
  return { title: dict.admin.nav.orders };
}

type Props = { searchParams: Promise<{ status?: string; q?: string }> };

export default async function OrdersPage({ searchParams }: Props) {
  const { locale, dict } = await getI18n();
  const t = dict.admin.orders;

  const { status, q } = await searchParams;
  const active = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const orders = await listOrders({ status: active, search: q });

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
            {t.title}
          </h1>
          <p className="mt-3 text-caption text-ink-muted">
            {plural(orders.length, t.shown, locale)}
            {active ? ` · ${localisedStatus(active, dict).label}` : ''}
          </p>
        </div>

        {/* Plain GET form — filters stay shareable and survive a refresh. */}
        <form className="flex items-center gap-2" action="/admin/orders">
          {active ? <input type="hidden" name="status" value={active} /> : null}
          <input
            name="q"
            defaultValue={q ?? ''}
            placeholder={t.searchPlaceholder}
            className="h-9 w-56 rounded-full border border-line-strong bg-white/60 px-4 text-caption text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-ink"
          />
          <button
            type="submit"
            className="h-9 rounded-full border border-line-strong px-4 text-caption text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {t.search}
          </button>

          {/* A plain link, not a fetch: the browser's own download handling is
              better than anything we would build, and it works with no JS. */}
          <a
            href="/admin/export"
            download
            className="flex h-9 items-center rounded-full border border-line-strong px-4 text-caption text-ink-soft transition-colors hover:border-ink hover:text-ink"
          >
            {t.export}
          </a>
        </form>
      </header>

      <div className="flex flex-wrap gap-2">
        <FilterLink href="/admin/orders" active={!active}>
          {t.all}
        </FilterLink>
        {ORDER_STATUSES.map((value) => (
          <FilterLink
            key={value}
            href={`/admin/orders?status=${value}`}
            active={active === value}
          >
            {localisedStatus(value, dict).label}
          </FilterLink>
        ))}
      </div>

      {orders.length === 0 ? (
        <p className="mt-10 rounded-[1rem] border border-line bg-white/50 p-10 text-center text-caption text-ink-muted">
          {t.noMatch}
        </p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[54rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line-strong">
                {[
                  t.columns.recipient,
                  t.columns.for,
                  t.columns.occasion,
                  t.columns.template,
                  t.columns.shop,
                  t.columns.created,
                  t.columns.status,
                  t.columns.code,
                ].map((heading) => (
                  <th key={heading} className="eyebrow pb-3 pr-4 font-medium text-ink-faint">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="group border-b border-line transition-colors hover:bg-white/70"
                >
                  <td className="py-4 pr-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-display text-[1.15rem] leading-none text-ink after:absolute"
                    >
                      {order.recipient.name}
                    </Link>
                    <span className="mt-1 block text-[0.75rem] text-ink-faint">
                      {t.from} {order.customer.name}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-caption text-ink-soft">
                    {recipientLabel(order.recipient.relationship, dict)}
                  </td>
                  <td className="py-4 pr-4 text-caption text-ink-soft">
                    {occasionLabel(order.occasion, dict)}
                  </td>
                  <td className="py-4 pr-4 text-caption text-ink-soft">
                    {localiseTemplate(resolveTemplate(order.templateId), dict).name}
                  </td>
                  <td className="py-4 pr-4 text-caption text-ink-muted">
                    {order.customer.shop ?? '—'}
                  </td>
                  <td className="py-4 pr-4 text-caption text-ink-muted tabular-nums">
                    {new Date(order.createdAt).toLocaleDateString(locale, {
                      day: '2-digit',
                      month: 'short',
                    })}
                  </td>
                  <td className="py-4 pr-4">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="py-4 text-caption tabular-nums text-ink">
                    <Link href={`/admin/orders/${order.id}`} className="hover:text-accent">
                      {order.code}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-caption transition-colors duration-300',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line-strong text-ink-soft hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
