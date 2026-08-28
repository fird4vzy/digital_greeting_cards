import { randomInt, randomUUID } from 'node:crypto';
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

/**
 * Код открытки — единственное, что её защищает.
 *
 * По коду открывается `/c/`, `/preview` и печатная бирка; пароля нет и быть
 * не может — человек читает код с бумажки, стоя над букетом. Значит код обязан
 * быть неугадываемым, а `Math.random()` таким не бывает: V8 крутит
 * xorshift128+, его состояние восстанавливается по нескольким выданным
 * значениям, после чего все следующие предсказуемы. Раздавал это состояние
 * наружу сам `generateId` — он клал сырые биты одного `Math.random()` в
 * идентификатор, который API возвращал заказчику.
 *
 * Восемь знаков вместо шести: 30⁸ против 30⁶ — перебор становится тяжелее в
 * тысячу раз, а строка остаётся такой, что её списывают с бирки не сбиваясь.
 * **Старые шестизначные коды не трогать.** Они напечатаны на бумаге, лежащей
 * у людей дома; длина здесь про новые заказы, а не про формат.
 */
export function generateCode(length = 8): string {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ALPHABET.charAt(randomInt(ALPHABET.length));
  }
  return code;
}

export function generateId(prefix: string): string {
  return `${prefix}_${randomUUID().replaceAll('-', '')}`;
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
