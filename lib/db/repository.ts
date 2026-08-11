import type { Order, OrderDraft, OrderFilter, OrderPatch } from './types';

/**
 * The persistence contract.
 *
 * Every route, server action and admin page depends on this interface and
 * never on a concrete store. Today it is satisfied by a file-backed store;
 * pointing DATABASE_URL at PostgreSQL swaps the implementation without a
 * single call site changing.
 */
export interface OrderRepository {
  list(filter?: OrderFilter): Promise<Order[]>;
  get(id: string): Promise<Order | null>;
  /** Case-insensitive: QR scans and hand-typed codes both have to work. */
  getByCode(code: string): Promise<Order | null>;
  create(draft: OrderDraft): Promise<Order>;
  update(id: string, patch: OrderPatch): Promise<Order | null>;
  remove(id: string): Promise<boolean>;
}

/** Codes people read off a printed card: no 0/O, no 1/I/L, no vowels. */
const ALPHABET = '23456789ACDEFGHJKMNPQRSTUVWXYZ';

export function generateCode(length = 6): string {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET.charAt(Math.floor(Math.random() * ALPHABET.length));
  }
  return code;
}

export function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}

export function matchesFilter(order: Order, filter: OrderFilter = {}): boolean {
  if (filter.status && order.status !== filter.status) return false;

  const search = filter.search?.trim().toLowerCase();
  if (!search) return true;

  return [
    order.code,
    order.id,
    order.customer.name,
    order.customer.email ?? '',
    order.customer.shop ?? '',
    order.recipient.name,
    order.occasion,
  ]
    .join(' ')
    .toLowerCase()
    .includes(search);
}
