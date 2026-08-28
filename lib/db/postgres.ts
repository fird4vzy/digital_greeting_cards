import { generateCode, generateId, type OrderRepository } from './repository';
import type { Order, OrderDraft, OrderFilter, OrderPatch } from './types';
import { createPostgresTemplateStore, type TemplateStore } from './templates';
import { createPostgresCardFileStore, type CardFileStore } from './card-files';

/**
 * PostgreSQL implementation of `OrderRepository`, against lib/db/schema.sql.
 *
 * `pg` is a real dependency but a lazily loaded one: the driver is only
 * imported when `DATABASE_URL` is set, so a file-store installation never pays
 * to connect it. `createPostgresStore` still returns null if the import fails,
 * and the caller falls back rather than crashing the app on boot.
 *
 * **The import must stay statically analysable.** It was once hidden behind a
 * runtime-computed specifier to keep bundlers away from it. That is exactly
 * wrong on a traced deployment: Next follows the import graph to decide which
 * files ship, so an import it cannot see means `pg` is missing at runtime, the
 * catch below swallows it, and the app quietly serves orders from an in-memory
 * store that forgets them. `pg` is on Next's `serverExternalPackages` list, so
 * a plain `import()` is already left as a native require rather than bundled.
 *
 *   psql "$DATABASE_URL" -f lib/db/schema.sql
 */

type QueryResult<T> = { rows: T[] };
type Pool = { query<T = OrderRow>(text: string, values?: unknown[]): Promise<QueryResult<T>> };

type OrderRow = {
  id: string;
  code: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_telegram: string | null;
  idempotency_key?: string | null;
  shop: string | null;
  recipient_name: string;
  relationship: string;
  occasion: string;
  mood: string;
  moods: string[] | null;
  custom_entry: string | null;
  wish: Order['wish'] | null;
  locale: string;
  message: string;
  photos: Order['photos'];
  moments: Order['moments'];
  memories: Order['memories'];
  wishes: string[];
  template_id: string;
  status: Order['status'];
  config: Order['config'];
  notes: string | null;
  brief: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  published_at: Date | string | null;
};

/**
 * TLS settings deduced from the connection string.
 *
 * Decided by *where the database is*, not by whether the URL happens to spell
 * `sslmode=require`. Matching on that substring failed open: a managed host
 * whose URL omitted it — or wrote `verify-full` instead — got a plaintext
 * connection attempt, which every managed provider then refuses. Anything that
 * is not loopback is treated as remote and gets TLS.
 *
 * Certificates are verified. Neon, Vercel Postgres and Supabase all present
 * publicly-signed certificates, so verification costs nothing and an encrypted
 * connection nobody authenticates is not much of a defence. A host with a
 * self-signed certificate can opt out with `sslmode=no-verify`, the same
 * spelling libpq uses.
 */
function sslOptionsFor(connectionString: string): { rejectUnauthorized: boolean } | undefined {
  let host: string;
  try {
    host = new URL(connectionString).hostname;
  } catch {
    // Unparseable: assume remote. Failing towards TLS is the safe direction.
    return { rejectUnauthorized: true };
  }

  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '';
  if (isLocal && !connectionString.includes('sslmode=require')) return undefined;

  return { rejectUnauthorized: !connectionString.includes('sslmode=no-verify') };
}

function iso(value: Date | string | null): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

function toOrder(row: OrderRow): Order {
  return {
    id: row.id,
    code: row.code,
    customer: {
      name: row.customer_name,
      email: row.customer_email ?? undefined,
      phone: row.customer_phone ?? undefined,
      telegram: row.customer_telegram ?? undefined,
      shop: row.shop ?? undefined,
    },
    recipient: { name: row.recipient_name, relationship: row.relationship },
    occasion: row.occasion,
    mood: row.mood,
    // Заказы, созданные до миграции 004, приходят с пустым массивом: их
    // единственный выбор восстанавливается из `mood`, чтобы читающий код
    // никогда не встречал заказ вообще без настроений.
    moods: row.moods?.length ? row.moods : row.mood ? [row.mood] : [],
    customEntry: row.custom_entry ?? null,
    wish: row.wish ?? null,
    idempotencyKey: row.idempotency_key ?? undefined,
    locale: row.locale ?? 'ru',
    message: row.message,
    photos: row.photos ?? [],
    moments: row.moments ?? [],
    memories: row.memories ?? [],
    wishes: row.wishes ?? [],
    templateId: row.template_id,
    status: row.status,
    config: row.config,
    notes: row.notes ?? undefined,
    brief: row.brief ?? undefined,
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
    publishedAt: iso(row.published_at),
  };
}

const BASE_COLUMNS = `id, code, customer_name, customer_email, customer_phone, shop,
  recipient_name, relationship, occasion, mood, locale, message, photos, moments,
  memories, wishes, template_id, status, config, notes, brief, created_at, updated_at,
  published_at`;

/**
 * Применена ли миграция 004, добавляющая `moods`.
 *
 * Спрашивается у базы один раз за процесс, а не предполагается. Причина
 * практическая: код уезжает на Vercel пушем, а миграция запускается руками, и
 * между этими двумя событиями всегда есть окно. Без этой проверки в окне
 * ломались бы не только новые заказы, но и чтение всех старых — `moods` попал
 * бы в каждый SELECT. С ней миграцию можно применить когда угодно: до
 * выкладки, после или через неделю.
 *
 * Ошибка при самой проверке трактуется как «колонки нет»: это всегда рабочее
 * поведение, просто без множественных настроений.
 */
const columnCache = new Map<string, Promise<boolean>>();

/**
 * Кешируется только «колонка есть». «Нет» и «не смог спросить» — никогда.
 *
 * Раньше кешировался любой ответ, навсегда, и из этого следовали две тихие
 * поломки. Первая: обещание «миграцию можно применить когда угодно — до
 * выкладки, после или через неделю» переставало быть правдой для уже
 * запущенного процесса. Он спросил один раз, услышал «нет» и продолжал
 * молча выбрасывать `moods`, `wish` и телеграм заказчика до самой пересборки.
 * Вторая хуже: `.catch(() => false)` не отличает «колонки нет» от «база
 * моргнула». Один разрыв связи на первой же проверке убеждал инстанс, что
 * колонки нет, — навсегда, и заказы теряли поля без единой ошибки в логе.
 *
 * «Есть» кешировать безопасно: колонку никто не удаляет, а миграции только
 * добавляют. Лишний запрос до миграции — цена куда меньшая, чем потерянное
 * поле после неё.
 */
function hasColumn(pool: Pool, column: string): Promise<boolean> {
  let probe = columnCache.get(column);

  if (!probe) {
    probe = pool
      .query<{ present: boolean }>(
        `SELECT EXISTS (
           SELECT 1 FROM information_schema.columns
            WHERE table_name = 'orders' AND column_name = $1
         ) AS present`,
        [column],
      )
      .then((result) => {
        const present = Boolean((result.rows[0] as { present?: boolean } | undefined)?.present);
        if (!present) columnCache.delete(column);
        return present;
      })
      .catch(() => {
        columnCache.delete(column);
        return false;
      });

    columnCache.set(column, probe);
  }

  return probe;
}

/** Какие из необязательных колонок уже есть. Спрашивается раз за процесс. */
async function optionalColumns(pool: Pool) {
  const [moods, customEntry, wish, telegram, idempotency] = await Promise.all([
    hasColumn(pool, 'moods'),
    hasColumn(pool, 'custom_entry'),
    hasColumn(pool, 'wish'),
    hasColumn(pool, 'customer_telegram'),
    hasColumn(pool, 'idempotency_key'),
  ]);
  return { moods, customEntry, wish, telegram, idempotency };
}

/** Что вернул `optionalColumns` — чтобы это не расписывать в каждой сигнатуре. */
type Present = Awaited<ReturnType<typeof optionalColumns>>;

/** Список колонок для SELECT и RETURNING, с `moods` только если он есть. */
const columnsFor = (present: Present) =>
  [
    BASE_COLUMNS,
    present.moods ? 'moods' : null,
    present.customEntry ? 'custom_entry' : null,
    present.wish ? 'wish' : null,
    present.telegram ? 'customer_telegram' : null,
    present.idempotency ? 'idempotency_key' : null,
  ]
    .filter(Boolean)
    .join(', ');

/**
 * Both stores, on one pool.
 *
 * Orders and operator-built templates are unrelated concerns, but they are the
 * same database and a second pool for a table read once per page would be
 * waste. The template store is a thin wrapper — see lib/db/templates.ts.
 */
export async function createPostgresStore(
  connectionString: string,
): Promise<{
  orders: OrderRepository;
  templates: TemplateStore;
  cardFiles: CardFileStore;
} | null> {
  let pool: Pool;

  try {
    // `pg` is CommonJS: under ESM interop the named export may only be
    // reachable through `default`, so try both rather than assume a shape.
    const pg = (await import('pg')) as unknown as {
      default?: { Pool?: new (c: unknown) => Pool };
      Pool?: new (c: unknown) => Pool;
    };
    const PoolCtor = pg.Pool ?? pg.default?.Pool;
    if (!PoolCtor) return null;

    pool = new PoolCtor({
      connectionString,
      // Пять, а не десять. Это предел на инстанс, а инстансов у Vercel
      // столько, сколько он решит поднять: десять на каждый упираются в
      // потолок Neon раньше, чем в него упрётся трафик.
      max: 5,
      idleTimeoutMillis: 30_000,
      ssl: sslOptionsFor(connectionString),
    });

    // Настоящий запрос, а не только успешный конструктор. `new Pool()`
    // соединение не открывает и с неверной строкой не падает — без этой
    // проверки «хранилище готово» означало бы лишь «объект создан», и первая
    // же настоящая ошибка вылезла бы на заказчике.
    await pool.query('SELECT 1');
  } catch {
    return null;
  }

  const store: OrderRepository = {
    async list(filter: OrderFilter = {}) {
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (filter.status) {
        values.push(filter.status);
        conditions.push(`status = $${values.length}`);
      }

      if (filter.search?.trim()) {
        // `%` и `_` экранируются. Инъекции здесь нет — запрос параметрический,
        // — но без экранирования поиск по «%» совпадал со всеми заказами
        // сразу, а поиск по имени с подчёркиванием находил лишнее.
        const needle = filter.search.trim().replace(/([%_\\])/g, '\\$1');
        values.push(`%${needle}%`);
        const i = values.length;
        conditions.push(
          `(code ILIKE $${i} OR customer_name ILIKE $${i} OR recipient_name ILIKE $${i} OR shop ILIKE $${i})`,
        );
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const limit = filter.limit ? `LIMIT ${Number(filter.limit)}` : '';

      const result = await pool.query<OrderRow>(
        `SELECT ${columnsFor(await optionalColumns(pool))} FROM orders ${where} ORDER BY created_at DESC ${limit}`,
        values,
      );
      return result.rows.map(toOrder);
    },

    async get(id: string) {
      const result = await pool.query<OrderRow>(
        `SELECT ${columnsFor(await optionalColumns(pool))} FROM orders WHERE id = $1`,
        [id],
      );
      return result.rows[0] ? toOrder(result.rows[0]) : null;
    },

    async getByCode(code: string) {
      const result = await pool.query<OrderRow>(
        `SELECT ${columnsFor(await optionalColumns(pool))} FROM orders WHERE upper(code) = upper($1)`,
        [code.trim()],
      );
      return result.rows[0] ? toOrder(result.rows[0]) : null;
    },

    async create(draft: OrderDraft) {
      const status = draft.status ?? 'NEW';
      const present = await optionalColumns(pool);

      /**
       * Повторная отправка возвращает уже созданный заказ, а не второй такой же.
       *
       * Двойное нажатие на медленной связи создавало два заказа, два кода и
       * два сообщения в рабочую группу: заказчик платил один раз, магазин
       * видел работу на два букета. Флаг `publishing` в форме от этого не
       * спасает — он живёт в браузере.
       *
       * Проверка до вставки ловит обычный случай, гонка двух одновременных
       * отправок — ниже, на уникальном индексе.
       */
      const byKey = async (key: string) => {
        const found = await pool.query<OrderRow>(
          `SELECT ${columnsFor(present)} FROM orders WHERE idempotency_key = $1`,
          [key],
        );
        return found.rows[0] ? toOrder(found.rows[0]) : null;
      };

      const key = present.idempotency ? draft.idempotencyKey : undefined;
      if (key) {
        const existing = await byKey(key);
        if (existing) return existing;
      }

      /**
       * Колонка и её значение объявляются вместе.
       *
       * Раньше здесь были два независимых списка — имена в SQL и значения в
       * массиве, — а номера плейсхолдеров считались вручную: `statusIndex =
       * moods ? 19 : 18`. Каждая новая необязательная колонка удваивала число
       * случаев, и одна уже потерялась молча: `wish` читался и выбирался, но
       * никогда не вставлялся, поэтому «своя идея» клиента не доезжала до
       * оператора. Пара «имя + значение» делает такую потерю невозможной:
       * забыть значение нельзя, не убрав колонку.
       */
      // `code` и `id` пересчитываются на каждой попытке — см. цикл ниже.
      const buildFields = (): [string, unknown][] => [
        ['id', generateId('ord')],
        ['code', generateCode()],
        ['customer_name', draft.customer.name],
        ['customer_email', draft.customer.email ?? null],
        ['customer_phone', draft.customer.phone ?? null],
        ['shop', draft.customer.shop ?? null],
        ['recipient_name', draft.recipient.name],
        ['relationship', draft.recipient.relationship],
        ['occasion', draft.occasion],
        ['mood', draft.mood],
        ['locale', draft.locale],
        ['message', draft.message],
        ['photos', JSON.stringify(draft.photos ?? [])],
        ['moments', JSON.stringify(draft.moments ?? [])],
        ['memories', JSON.stringify(draft.memories ?? [])],
        ['wishes', JSON.stringify(draft.wishes ?? [])],
        ['template_id', draft.templateId],
        ['status', status],
        ['config', draft.config ? JSON.stringify(draft.config) : null],
        ['notes', draft.notes ?? null],
        ['brief', draft.brief ?? null],
      ];

      /**
       * Retry on the unique-code constraint rather than pre-checking: the read
       * would be a race anyway, and a collision is a one-in-millions event.
       *
       * Сборка полей — внутри цикла, и это исправление, а не стиль. Раньше
       * `generateCode()` вычислялся один раз снаружи, поэтому повтор пять раз
       * подряд слал в базу тот же самый занятый код и заканчивался тем же
       * исключением. Цикл существовал ровно ради этого случая и ровно его не
       * обрабатывал.
       */
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const fields = buildFields();

        // Необязательные — только если миграция уже прошла.
        if (present.moods) fields.push(['moods', draft.moods?.length ? draft.moods : [draft.mood]]);
        if (present.wish) fields.push(['wish', draft.wish ? JSON.stringify(draft.wish) : null]);
        if (present.telegram) {
          fields.push(['customer_telegram', draft.customer.telegram ?? null]);
        }
        if (key) fields.push(['idempotency_key', key]);

        const statusIndex = fields.findIndex(([name]) => name === 'status') + 1;
        const columnSql = fields.map(([name]) => name).join(', ');
        const placeholders = fields
          .map((_, index) => (index + 1 === statusIndex ? `$${index + 1}::order_status` : `$${index + 1}`))
          .join(',');
        const values = fields.map(([, value]) => value);

        try {
          const result = await pool.query<OrderRow>(
            `INSERT INTO orders (
               ${columnSql}, published_at
             ) VALUES (
               ${placeholders},
               -- Both casts are load-bearing. The status placeholder appears
               -- twice, and without them Postgres deduces order_status from
               -- the column and text from the comparison, then rejects the
               -- statement outright (42P08). Naming the type at both sites
               -- keeps them agreeing.
               CASE WHEN $${statusIndex}::order_status = 'PUBLISHED' THEN now() ELSE NULL END
             )
             RETURNING ${columnsFor(present)}`,
            values,
          );

          const row = result.rows[0];
          if (!row) continue;

          return toOrder(row);
        } catch (error) {
          const failure = error as { code?: string; constraint?: string };
          if (failure.code !== '23505') throw error;

          // Столкнулись на ключе повторной отправки, а не на коде: значит
          // параллельный запрос успел создать этот же заказ. Возвращаем его —
          // это и есть нужный ответ, а не ошибка.
          if (failure.constraint === 'orders_idempotency_key_idx' && key) {
            const existing = await byKey(key);
            if (existing) return existing;
          }
        }
      }

      throw new Error('Could not allocate a unique card code');
    },

    async update(id: string, patch: OrderPatch) {
      const sets: string[] = [];
      const values: unknown[] = [];

      const push = (column: string, value: unknown) => {
        values.push(value);
        sets.push(`${column} = $${values.length}`);
      };

      if (patch.customer?.name !== undefined) push('customer_name', patch.customer.name);
      if (patch.customer?.email !== undefined) push('customer_email', patch.customer.email ?? null);
      if (patch.customer?.phone !== undefined) push('customer_phone', patch.customer.phone ?? null);
      if (patch.customer?.shop !== undefined) push('shop', patch.customer.shop ?? null);
      if (patch.customer?.telegram !== undefined && (await hasColumn(pool, 'customer_telegram'))) {
        push('customer_telegram', patch.customer.telegram ?? null);
      }
      if (patch.recipient?.name !== undefined) push('recipient_name', patch.recipient.name);
      if (patch.recipient?.relationship !== undefined) push('relationship', patch.recipient.relationship);
      if (patch.occasion !== undefined) push('occasion', patch.occasion);
      if (patch.mood !== undefined) push('mood', patch.mood);
      // Обновляется только при наличии колонки — до миграции правка просто
      // не записывается, а не роняет весь заказ.
      if (patch.moods !== undefined && (await hasColumn(pool, 'moods'))) push('moods', patch.moods);
      if (patch.customEntry !== undefined && (await hasColumn(pool, 'custom_entry'))) {
        push('custom_entry', patch.customEntry);
      }
      if (patch.wish !== undefined && (await hasColumn(pool, 'wish'))) {
        push('wish', patch.wish ? JSON.stringify(patch.wish) : null);
      }
      if (patch.locale !== undefined) push('locale', patch.locale);
      if (patch.message !== undefined) push('message', patch.message);
      if (patch.photos !== undefined) push('photos', JSON.stringify(patch.photos));
      if (patch.moments !== undefined) push('moments', JSON.stringify(patch.moments));
      if (patch.memories !== undefined) push('memories', JSON.stringify(patch.memories));
      if (patch.wishes !== undefined) push('wishes', JSON.stringify(patch.wishes));
      if (patch.templateId !== undefined) push('template_id', patch.templateId);
      if (patch.config !== undefined) push('config', patch.config ? JSON.stringify(patch.config) : null);
      if (patch.notes !== undefined) push('notes', patch.notes ?? null);
      if (patch.brief !== undefined) push('brief', patch.brief ?? null);

      if (patch.status !== undefined) {
        push('status', patch.status);
        if (patch.status === 'PUBLISHED') {
          sets.push('published_at = COALESCE(published_at, now())');
        }
      }

      if (sets.length === 0) return store.get(id);

      values.push(id);
      const result = await pool.query<OrderRow>(
        `UPDATE orders SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING ${columnsFor(
          await optionalColumns(pool),
        )}`,
        values,
      );
      return result.rows[0] ? toOrder(result.rows[0]) : null;
    },

    async remove(id: string) {
      const result = await pool.query<{ id: string }>('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    },
  };

  return {
    orders: store,
    templates: createPostgresTemplateStore(pool),
    cardFiles: createPostgresCardFileStore(pool),
  };
}
