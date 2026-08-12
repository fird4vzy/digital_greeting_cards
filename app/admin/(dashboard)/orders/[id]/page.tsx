import Link from 'next/link';
import { notFound } from 'next/navigation';
import { regenerateCard, saveOrderNotes, setOrderStatus } from '../../../actions';
import { StatusPill } from '@/components/admin/StatusPill';
import { CopyButton } from '@/components/admin/CopyButton';
import { getOrder } from '@/lib/db';
import { ORDER_STATUSES, STATUS_META } from '@/lib/db/types';
import { moodLabel, occasionLabel, recipientLabel } from '@/lib/card/taxonomy';
import { cardUrl } from '@/lib/qr';
import { siteOrigin } from '@/lib/site-origin';
import { listTemplates, resolveTemplate } from '@/templates';
import { paragraphs } from '@/lib/card/schema';

type Props = { params: Promise<{ id: string }> };

export default async function OrderDetail({ params }: Props) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const origin = await siteOrigin();
  const url = cardUrl(origin, order.code);
  const template = resolveTemplate(order.templateId);

  return (
    <>
      <Link href="/admin/orders" className="text-caption text-ink-muted hover:text-ink">
        ← Orders
      </Link>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-5 border-b border-line pb-8">
        <div>
          <h1 className="font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
            {order.recipient.name}
          </h1>
          <p className="mt-3 text-caption text-ink-muted">
            {occasionLabel(order.occasion)} · {moodLabel(order.mood)} · from {order.customer.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={order.status} />
          <span className="eyebrow text-ink-faint tabular-nums">{order.code}</span>
        </div>
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-12">
          <section>
            <h2 className="eyebrow mb-5 text-ink-muted">The order</h2>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
              <Detail label="Order ID">{order.id}</Detail>
              <Detail label="Customer">
                {order.customer.name}
                {order.customer.email ? (
                  <span className="block text-ink-muted">{order.customer.email}</span>
                ) : null}
              </Detail>
              <Detail label="Recipient">
                {order.recipient.name} · {recipientLabel(order.recipient.relationship)}
              </Detail>
              <Detail label="Shop">{order.customer.shop ?? 'Direct'}</Detail>
              <Detail label="Template">{template.name}</Detail>
              <Detail label="Created">
                {new Date(order.createdAt).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </Detail>
              <Detail label="Published">
                {order.publishedAt
                  ? new Date(order.publishedAt).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Not yet'}
              </Detail>
              <Detail label="Card">
                {order.config
                  ? `${order.config.sections.length} sections composed`
                  : 'Not composed yet'}
              </Detail>
            </dl>
          </section>

          <section>
            <h2 className="eyebrow mb-5 text-ink-muted">What the customer wrote</h2>
            <div className="space-y-4 rounded-[1rem] border border-line bg-white/60 p-6">
              {paragraphs(order.message).length > 0 ? (
                paragraphs(order.message).map((block, index) => (
                  <p key={index} className="text-body leading-[1.8] text-ink-soft">
                    {block}
                  </p>
                ))
              ) : (
                <p className="text-caption italic text-ink-faint">
                  Nothing written — the template will supply an honest fallback letter.
                </p>
              )}
            </div>
          </section>

          {order.photos.length > 0 ? (
            <section>
              <h2 className="eyebrow mb-5 text-ink-muted">
                Photographs ({order.photos.length})
              </h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                {order.photos.map((photo) => (
                  <span
                    key={photo.id}
                    className="block overflow-hidden rounded-[0.5rem]"
                    style={{ aspectRatio: '3 / 4' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" className="h-full w-full object-cover" />
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {(order.moments.length > 0 || order.memories.length > 0) && (
            <section>
              <h2 className="eyebrow mb-5 text-ink-muted">Details supplied</h2>
              <ul className="divide-y divide-line border-y border-line">
                {order.moments.map((moment, index) => (
                  <li key={`moment-${index}`} className="flex gap-5 py-3.5">
                    <span className="eyebrow w-32 shrink-0 text-ink-faint">{moment.date}</span>
                    <span className="text-caption text-ink-soft">
                      {moment.title}
                      {moment.text ? ` — ${moment.text}` : ''}
                    </span>
                  </li>
                ))}
                {order.memories.map((memory, index) => (
                  <li key={`memory-${index}`} className="flex gap-5 py-3.5">
                    <span className="eyebrow w-32 shrink-0 text-ink-faint">{memory.label}</span>
                    <span className="text-caption text-ink-soft">{memory.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="eyebrow mb-5 text-ink-muted">Shop notes</h2>
            <form action={saveNotes} className="rounded-[1rem] border border-line bg-white/60 p-5">
              <input type="hidden" name="id" value={order.id} />
              <textarea
                name="notes"
                rows={3}
                defaultValue={order.notes ?? ''}
                placeholder="Pickup time, packaging, anything the next person needs to know."
                className="w-full resize-none bg-transparent text-body text-ink outline-none placeholder:text-ink-faint"
              />
              <button
                type="submit"
                className="mt-3 rounded-full border border-line-strong px-4 py-1.5 text-caption text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                Save notes
              </button>
            </form>
          </section>
        </div>

        {/* Actions rail */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          <Panel title="Status">
            <div className="flex flex-wrap gap-2">
              {ORDER_STATUSES.map((status) => (
                <form key={status} action={changeStatus}>
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="status" value={status} />
                  <button
                    type="submit"
                    disabled={order.status === status}
                    className="rounded-full border border-line-strong px-3.5 py-1.5 text-caption text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:border-ink disabled:bg-ink disabled:text-paper"
                  >
                    {STATUS_META[status].label}
                  </button>
                </form>
              ))}
            </div>
          </Panel>

          <Panel title="Card">
            <div className="space-y-2.5">
              <form action={regenerate}>
                <input type="hidden" name="id" value={order.id} />
                <select
                  name="templateId"
                  defaultValue={order.templateId}
                  className="mb-2.5 h-9 w-full rounded-[0.5rem] border border-line-strong bg-white px-3 text-caption text-ink outline-none focus:border-ink"
                >
                  {listTemplates().map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <ActionButton type="submit">Generate card</ActionButton>
              </form>

              <ActionLink href={`/c/${order.code}`} disabled={order.status !== 'PUBLISHED'}>
                Preview the card
              </ActionLink>
              <ActionLink href={`/templates/${order.templateId}`}>
                Preview the template
              </ActionLink>
            </div>
          </Panel>

          <Panel title="QR">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/qr/${order.code}?size=256`}
                alt={`QR code for card ${order.code}`}
                width={80}
                height={80}
                className="h-20 w-20 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <ActionLink href={`/c/${order.code}/qr`}>Printable card</ActionLink>
                <CopyButton value={url} />
              </div>
            </div>
            <p className="mt-4 break-all text-[0.7rem] leading-relaxed text-ink-faint">{url}</p>
          </Panel>
        </aside>
      </div>
    </>
  );
}

/* Server-action adapters. Forms post FormData; the actions take arguments. */

async function changeStatus(formData: FormData) {
  'use server';
  await setOrderStatus(String(formData.get('id')), String(formData.get('status')));
}

async function regenerate(formData: FormData) {
  'use server';
  await regenerateCard(String(formData.get('id')), String(formData.get('templateId')));
}

async function saveNotes(formData: FormData) {
  'use server';
  await saveOrderNotes(String(formData.get('id')), String(formData.get('notes') ?? ''));
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line pb-3">
      <dt className="eyebrow text-ink-faint">{label}</dt>
      <dd className="mt-1.5 text-caption text-ink">{children}</dd>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1rem] border border-line bg-white/60 p-5">
      <h2 className="eyebrow mb-4 text-ink-muted">{title}</h2>
      {children}
    </section>
  );
}

function ActionButton({ children, type = 'button' }: { children: React.ReactNode; type?: 'button' | 'submit' }) {
  return (
    <button
      type={type}
      className="block w-full rounded-[0.5rem] border border-line-strong px-4 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      {children}
    </button>
  );
}

function ActionLink({
  href,
  children,
  disabled,
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="block w-full cursor-not-allowed rounded-[0.5rem] border border-line px-4 py-2 text-center text-caption text-ink-faint">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="block w-full rounded-[0.5rem] border border-line-strong px-4 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      {children}
    </Link>
  );
}
