import 'server-only';

import { fileStore } from './file-store';
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
let repositoryPromise: Promise<OrderRepository> | null = null;

async function resolveRepository(): Promise<OrderRepository> {
  const url = process.env.DATABASE_URL;

  if (url) {
    const store = await createPostgresStore(url);
    if (store) return store;
    console.warn(
      '[db] DATABASE_URL is set but the "pg" driver could not be loaded — falling back to the file store. Run: npm install pg',
    );
  }

  return fileStore;
}

export function getRepository(): Promise<OrderRepository> {
  repositoryPromise ??= resolveRepository();
  return repositoryPromise;
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
