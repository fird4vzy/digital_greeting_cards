import 'server-only';

import { fileStore } from './file-store';
import { fileTemplateStore, type TemplateStore } from './templates';
import { createPostgresStore } from './postgres';
import type { OrderRepository } from './repository';
import type { Order, PublishedCard } from './types';

/**
 * Repository resolution.
 *
 * `DATABASE_URL` present and `pg` installed → PostgreSQL.
 * Anything else → the file-backed store, so `npm run dev` works on a clean
 * checkout with no infrastructure at all.
 *
 * Resolved once per process and memoised on the promise, not the value, so
 * concurrent first requests share a single connection pool.
 */
type Stores = { orders: OrderRepository; templates: TemplateStore };

let storesPromise: Promise<Stores> | null = null;

async function resolveStores(): Promise<Stores> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const stores = await createPostgresStore(url);
    if (stores) return stores;
    console.warn(
      '[db] DATABASE_URL is set but the "pg" driver could not be loaded — falling back to the file store. Run: npm install pg',
    );
  }

  return { orders: fileStore, templates: fileTemplateStore };
}

function getStores(): Promise<Stores> {
  storesPromise ??= resolveStores();
  return storesPromise;
}

export async function getRepository(): Promise<OrderRepository> {
  return (await getStores()).orders;
}

/**
 * Templates an operator built, as opposed to the ones in `templates/`.
 *
 * Separate from `getRepository` because they are separate concerns, resolved
 * together because they are one database and one pool.
 */
export async function getTemplateStore(): Promise<TemplateStore> {
  return (await getStores()).templates;
}

/** Convenience wrappers so pages do not repeat the await dance. */
export async function listOrders(...args: Parameters<OrderRepository['list']>) {
  return (await getRepository()).list(...args);
}

export async function getOrder(id: string) {
  return (await getRepository()).get(id);
}

export async function getOrderByCode(code: string) {
  return (await getRepository()).getByCode(code);
}

export async function createOrder(...args: Parameters<OrderRepository['create']>) {
  return (await getRepository()).create(...args);
}

export async function updateOrder(...args: Parameters<OrderRepository['update']>) {
  return (await getRepository()).update(...args);
}

/**
 * Permanent. Callers must refuse to delete anything that has ever been
 * published — a code printed onto a tag has to keep resolving, so the way to
 * retire a live card is `status: 'CANCELLED'`, not this.
 */
export async function removeOrder(...args: Parameters<OrderRepository['remove']>) {
  return (await getRepository()).remove(...args);
}

export function toPublishedCard(order: Order, origin: string): PublishedCard {
  return {
    id: order.id,
    code: order.code,
    recipientName: order.recipient.name,
    senderName: order.customer.name,
    templateId: order.templateId,
    occasion: order.occasion,
    publishedAt: order.publishedAt ?? null,
    url: `${origin}/c/${order.code}`,
  };
}

export type { OrderRepository };
