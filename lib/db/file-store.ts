import { promises as fs } from 'node:fs';
import path from 'node:path';
import { generateCode, generateId, matchesFilter, type OrderRepository } from './repository';
import { seedOrders } from './seed';
import type { Order, OrderDraft, OrderFilter, OrderPatch } from './types';

/**
 * Development store.
 *
 * Satisfies the same contract as the PostgreSQL implementation so the whole
 * product — creation flow, admin, published cards — runs with no database
 * installed. Writes go to `.data/orders.json`; if the filesystem is read-only
 * (a preview deployment, a container with no writable volume) it degrades to
 * an in-process store rather than failing the request.
 *
 * Not intended for production concurrency: writes are serialised through a
 * single promise chain, which is correct for one process and wrong for many.
 * That is exactly the line at which DATABASE_URL should be set.
 */

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

type StoreState = {
  orders: Order[] | null;
  writable: boolean;
  queue: Promise<unknown>;
};

// Next.js dev recompiles modules on edit; hanging state off globalThis keeps
// the seeded data stable across hot reloads.
const globalState = globalThis as typeof globalThis & { __cardStore?: StoreState };
const state: StoreState = (globalState.__cardStore ??= { orders: null, writable: true, queue: Promise.resolve() });

async function load(): Promise<Order[]> {
  if (state.orders) return state.orders;

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    state.orders = JSON.parse(raw) as Order[];
  } catch {
    state.orders = seedOrders();
    await persist();
  }

  return state.orders;
}

async function persist(): Promise<void> {
  if (!state.writable || !state.orders) return;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(state.orders, null, 2), 'utf8');
  } catch {
    // Read-only filesystem: keep serving from memory for the rest of the
    // process lifetime instead of throwing on every mutation.
    state.writable = false;
  }
}

/** Serialises mutations so two concurrent writes cannot lose each other. */
function transact<T>(work: () => Promise<T>): Promise<T> {
  const next = state.queue.then(work, work);
  state.queue = next.catch(() => undefined);
  return next;
}

function now(): string {
  return new Date().toISOString();
}

export const fileStore: OrderRepository = {
  async list(filter: OrderFilter = {}) {
    const orders = await load();
    const matched = orders
      .filter((order) => matchesFilter(order, filter))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    // Тот же контракт, что у postgres: сначала пропустить, потом ограничить.
    const from = filter.offset ?? 0;
    return filter.limit ? matched.slice(from, from + filter.limit) : matched.slice(from);
  },

  async get(id: string) {
    const orders = await load();
    return orders.find((order) => order.id === id) ?? null;
  },

  async getByCode(code: string) {
    const orders = await load();
    const wanted = code.trim().toUpperCase();
    return orders.find((order) => order.code.toUpperCase() === wanted) ?? null;
  },

  async create(draft: OrderDraft) {
    return transact(async () => {
      const orders = await load();

      // Та же семантика, что у postgres: повторная отправка возвращает уже
      // созданный заказ. Контракт хранилищ должен совпадать, иначе поведение
      // зависит от того, поднята база или нет.
      if (draft.idempotencyKey) {
        const existing = orders.find((order) => order.idempotencyKey === draft.idempotencyKey);
        if (existing) return existing;
      }

      let code = generateCode();
      while (orders.some((order) => order.code === code)) code = generateCode();

      const timestamp = now();
      const order: Order = {
        ...draft,
        id: generateId('ord'),
        code,
        status: draft.status ?? 'NEW',
        config: draft.config ?? null,
        createdAt: timestamp,
        updatedAt: timestamp,
        publishedAt: draft.status === 'PUBLISHED' ? timestamp : null,
      };

      orders.unshift(order);
      await persist();
      return order;
    });
  },

  async update(id: string, patch: OrderPatch) {
    return transact(async () => {
      const orders = await load();
      const index = orders.findIndex((order) => order.id === id);
      if (index === -1) return null;

      const previous = orders[index];
      const becamePublished = patch.status === 'PUBLISHED' && previous.status !== 'PUBLISHED';

      const updated: Order = {
        ...previous,
        ...patch,
        id: previous.id,
        createdAt: previous.createdAt,
        updatedAt: now(),
        publishedAt: becamePublished ? now() : (patch.publishedAt ?? previous.publishedAt ?? null),
      };

      orders[index] = updated;
      await persist();
      return updated;
    });
  },

  async remove(id: string) {
    return transact(async () => {
      const orders = await load();
      const index = orders.findIndex((order) => order.id === id);
      if (index === -1) return false;

      orders.splice(index, 1);
      await persist();
      return true;
    });
  },
};
