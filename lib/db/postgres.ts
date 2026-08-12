import { generateCode, generateId, type OrderRepository } from './repository';
import type { Order, OrderDraft, OrderFilter, OrderPatch } from './types';

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
  shop: string | null;
  recipient_name: string;
  relationship: string;
  occasion: string;
  mood: string;
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
      shop: row.shop ?? undefined,
    },
    recipient: { name: row.recipient_name, relationship: row.relationship },
    occasion: row.occasion,
    mood: row.mood,
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
    createdAt: iso(row.created_at) ?? new Date().toISOString(),
    updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
    publishedAt: iso(row.published_at),
  };
}

const COLUMNS = `id, code, customer_name, customer_email, customer_phone, shop,
  recipient_name, relationship, occasion, mood, locale, message, photos, moments,
  memories, wishes, template_id, status, config, notes, created_at, updated_at,
  published_at`;

export async function createPostgresStore(connectionString: string): Promise<OrderRepository | null> {
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
      max: 10,
      idleTimeoutMillis: 30_000,
      ssl: sslOptionsFor(connectionString),
    });
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
        values.push(`%${filter.search.trim()}%`);
        const i = values.length;
        conditions.push(
          `(code ILIKE $${i} OR customer_name ILIKE $${i} OR recipient_name ILIKE $${i} OR shop ILIKE $${i})`,
        );
      }

      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const limit = filter.limit ? `LIMIT ${Number(filter.limit)}` : '';

      const result = await pool.query<OrderRow>(
        `SELECT ${COLUMNS} FROM orders ${where} ORDER BY created_at DESC ${limit}`,
        values,
      );
      return result.rows.map(toOrder);
    },

    async get(id: string) {
      const result = await pool.query<OrderRow>(`SELECT ${COLUMNS} FROM orders WHERE id = $1`, [id]);
      return result.rows[0] ? toOrder(result.rows[0]) : null;
    },

    async getByCode(code: string) {
      const result = await pool.query<OrderRow>(
        `SELECT ${COLUMNS} FROM orders WHERE upper(code) = upper($1)`,
        [code.trim()],
      );
      return result.rows[0] ? toOrder(result.rows[0]) : null;
    },

    async create(draft: OrderDraft) {
      const status = draft.status ?? 'NEW';

      // Retry on the unique-code constraint rather than pre-checking: the read
      // would be a race anyway, and a collision is a one-in-millions event.
      for (let attempt = 0; attempt < 5; attempt += 1) {
        try {
          const result = await pool.query<OrderRow>(
            `INSERT INTO orders (
               id, code, customer_name, customer_email, customer_phone, shop,
               recipient_name, relationship, occasion, mood, locale, message, photos,
               moments, memories, wishes, template_id, status, config, notes,
               published_at
             ) VALUES (
               $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
               $18::order_status,$19,$20,
               -- Both casts are load-bearing. $18 appears twice, and without
               -- them Postgres deduces order_status from the column and text
               -- from the comparison, then rejects the statement outright
               -- (42P08). Naming the type at both sites keeps them agreeing.
               CASE WHEN $18::order_status = 'PUBLISHED' THEN now() ELSE NULL END
             )
             RETURNING ${COLUMNS}`,
            [
              generateId('ord'),
              generateCode(),
              draft.customer.name,
              draft.customer.email ?? null,
              draft.customer.phone ?? null,
              draft.customer.shop ?? null,
              draft.recipient.name,
              draft.recipient.relationship,
              draft.occasion,
              draft.mood,
              draft.locale,
              draft.message,
              JSON.stringify(draft.photos ?? []),
              JSON.stringify(draft.moments ?? []),
              JSON.stringify(draft.memories ?? []),
              JSON.stringify(draft.wishes ?? []),
              draft.templateId,
              status,
              draft.config ? JSON.stringify(draft.config) : null,
              draft.notes ?? null,
            ],
          );

          const row = result.rows[0];
          if (row) return toOrder(row);
        } catch (error) {
          const code = (error as { code?: string }).code;
          if (code !== '23505') throw error;
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
      if (patch.recipient?.name !== undefined) push('recipient_name', patch.recipient.name);
      if (patch.recipient?.relationship !== undefined) push('relationship', patch.recipient.relationship);
      if (patch.occasion !== undefined) push('occasion', patch.occasion);
      if (patch.mood !== undefined) push('mood', patch.mood);
      if (patch.locale !== undefined) push('locale', patch.locale);
      if (patch.message !== undefined) push('message', patch.message);
      if (patch.photos !== undefined) push('photos', JSON.stringify(patch.photos));
      if (patch.moments !== undefined) push('moments', JSON.stringify(patch.moments));
      if (patch.memories !== undefined) push('memories', JSON.stringify(patch.memories));
      if (patch.wishes !== undefined) push('wishes', JSON.stringify(patch.wishes));
      if (patch.templateId !== undefined) push('template_id', patch.templateId);
      if (patch.config !== undefined) push('config', patch.config ? JSON.stringify(patch.config) : null);
      if (patch.notes !== undefined) push('notes', patch.notes ?? null);

      if (patch.status !== undefined) {
        push('status', patch.status);
        if (patch.status === 'PUBLISHED') {
          sets.push('published_at = COALESCE(published_at, now())');
        }
      }

      if (sets.length === 0) return store.get(id);

      values.push(id);
      const result = await pool.query<OrderRow>(
        `UPDATE orders SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING ${COLUMNS}`,
        values,
      );
      return result.rows[0] ? toOrder(result.rows[0]) : null;
    },

    async remove(id: string) {
      const result = await pool.query<{ id: string }>('DELETE FROM orders WHERE id = $1 RETURNING id', [id]);
      return result.rows.length > 0;
    },
  };

  return store;
}
