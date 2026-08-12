import { generateCode, generateId, type OrderRepository } from './repository';
import type { Order, OrderDraft, OrderFilter, OrderPatch } from './types';

/**
 * PostgreSQL implementation of `OrderRepository`, against lib/db/schema.sql.
 *
 * `pg` is an optional dependency: installations that run on the file-backed
 * store should not have to carry a database driver. It is therefore loaded
 * through a runtime-computed specifier so no bundler tries to resolve it at
 * build time, and `createPostgresStore` returns null if it is absent — the
 * caller falls back rather than crashing the app on boot.
 *
 *   npm install pg && export DATABASE_URL=postgres://??
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

// Hidden from bundler static analysis; evaluated only in the Node runtime.
const dynamicImport = new Function('specifier', 'return import(specifier)') as (
  specifier: string,
) => Promise<Record<string, unknown>>;

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
    const pg = (await dynamicImport('pg')) as { default?: { Pool: new (c: unknown) => Pool }; Pool?: new (c: unknown) => Pool };
    const PoolCtor = pg.Pool ?? pg.default?.Pool;
    if (!PoolCtor) return null;

    pool = new PoolCtor({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
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
               $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
               CASE WHEN $18 = 'PUBLISHED' THEN now() ELSE NULL END
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
