import 'server-only';

import { cache } from 'react';

import { fileStore } from './file-store';
import { fileTemplateStore, type TemplateStore } from './templates';
import { memoryCardFileStore, type CardFileStore } from './card-files';
import { createPostgresStore, type SqlPool } from './postgres';
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
 *
 * **В проде отката нет.** Раньше был, и он молча терял заказы. Цепочка:
 * `DATABASE_URL` не задан или `pg` не поднялся → один `console.warn`, которого
 * никто не читает → файловое хранилище → на Vercel файловая система только для
 * чтения, значит первая же запись падает, `writable` встаёт в `false`
 * навсегда → заказы живут в памяти одного инстанса. Заказчик получает 201 и
 * видит «готово». В телеграм уходит ссылка на `/admin/orders/<id>`. Оператор
 * жмёт — попадает на другой инстанс, который об этом заказе не слышал, и
 * видит 404. Инстанс гасится, заказ исчезает; ни ошибки, ни следа, что он
 * вообще был. Вдобавок `load()` подсовывает демо-данные, и в очереди
 * появляется Алина вперемешку с настоящими заказами.
 *
 * Упавшая страница — это то, что видно. Тихая память — это бизнес, который
 * нельзя свести.
 */
type Stores = {
  orders: OrderRepository;
  templates: TemplateStore;
  cardFiles: CardFileStore;
  /** Есть только у postgres: файловому хранилищу подставлять нечего. */
  pool?: SqlPool;
};

let storesPromise: Promise<Stores> | null = null;

async function resolveStores(): Promise<Stores> {
  const url = process.env.DATABASE_URL;
  const production = process.env.NODE_ENV === 'production';

  if (url) {
    const stores = await createPostgresStore(url);
    if (stores) return stores;

    if (production) {
      throw new Error(
        '[db] DATABASE_URL задан, но подключиться не удалось. Отказываюсь обслуживать из памяти: заказы бы принимались и пропадали.',
      );
    }

    console.warn(
      '[db] DATABASE_URL is set but the "pg" driver could not be loaded — falling back to the file store. Run: npm install pg',
    );
  } else if (production) {
    throw new Error('[db] DATABASE_URL обязателен в продакшене.');
  }

  return { orders: fileStore, templates: fileTemplateStore, cardFiles: memoryCardFileStore };
}

function getStores(): Promise<Stores> {
  // Мемоизация снимается при неудаче. Без этого одна секундная недоступность
  // Neon на холодном старте оставила бы в переменной отвергнутый промис, и
  // инстанс отвечал бы ошибкой до самой пересборки — уже после того, как база
  // вернулась.
  storesPromise ??= resolveStores().catch((error) => {
    storesPromise = null;
    throw error;
  });

  return storesPromise;
}

/**
 * Живо ли хранилище — для `/api/health`.
 *
 * Настоящий запрос, а не проверка переменных: смысл здоровья в том, что путь
 * до базы работает целиком, а `DATABASE_URL` может быть задан и при этом вести
 * в никуда.
 */
export async function storeHealth(): Promise<{ ok: boolean; store: string; error?: string }> {
  try {
    const stores = await getStores();
    await stores.orders.list({ limit: 1 });
    return { ok: true, store: stores.orders === fileStore ? 'memory' : 'postgres' };
  } catch (error) {
    return { ok: false, store: 'unreachable', error: (error as Error).message };
  }
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

/**
 * Файлы открыток, написанных руками.
 *
 * Та же пара реализаций и тот же пул, что у заказов и шаблонов.
 */
export async function getCardFileStore(): Promise<CardFileStore> {
  return (await getStores()).cardFiles;
}

/**
 * Пул для запросов, у которых нет своего хранилища (счётчик просмотров).
 *
 * `null` на файловом хранилище — и это правильный ответ, а не заглушка:
 * считать сканирования там негде и незачем.
 */
export async function getPool(): Promise<SqlPool | null> {
  return (await getStores()).pool ?? null;
}

/** Convenience wrappers so pages do not repeat the await dance. */
export async function listOrders(...args: Parameters<OrderRepository['list']>) {
  return (await getRepository()).list(...args);
}

export async function getOrder(id: string) {
  return (await getRepository()).get(id);
}

/**
 * Открытка по коду — с кешом на время одного запроса.
 *
 * Один скан QR приводил к трём одинаковым запросам в базу: `generateMetadata`,
 * `generateViewport` и сама страница читают заказ каждая для себя, и это
 * нормальная работа Next, а не ошибка. Ненормально было платить за неё тремя
 * походами в Neon на самом горячем пути продукта — при доставке букетов
 * запросы приходят пачкой, а соединений в пуле пять на инстанс.
 *
 * `cache` из React живёт ровно один запрос, поэтому устаревших данных здесь
 * появиться не может: следующий скан читает заново.
 */
export const getOrderByCode = cache(async (code: string) => {
  return (await getRepository()).getByCode(code);
});

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
