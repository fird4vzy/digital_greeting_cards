import 'server-only';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { templateRecipeSchema, type TemplateRecipe, type TemplateRecipeDraft } from '@/lib/card/recipe';

/**
 * WHERE OPERATOR-BUILT TEMPLATES LIVE
 * ===================================
 * The same two-implementation shape the order repository uses, and resolved
 * the same way: PostgreSQL when `DATABASE_URL` is set, a file otherwise so a
 * clean checkout needs no infrastructure.
 *
 * **The file store is not good enough for these in production**, and that is
 * a sharper statement than it is for orders. A serverless filesystem is
 * read-only, so the file store degrades to memory; an order lost that way is
 * one customer's bad afternoon, but a template lost that way takes every card
 * built on it with it — `/templates/<id>` stops resolving and the gallery
 * loses an entry. Published cards survive regardless, because a card is stored
 * already composed and never reads its template again for content.
 */

export interface TemplateStore {
  list(): Promise<TemplateRecipe[]>;
  get(id: string): Promise<TemplateRecipe | null>;
  /** Insert or replace by id. Returns the stored record with its timestamps. */
  save(draft: TemplateRecipeDraft): Promise<TemplateRecipe>;
  remove(id: string): Promise<boolean>;
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'templates.json');

type FileState = { recipes: TemplateRecipe[] | null; writable: boolean; queue: Promise<unknown> };

// Survives hot reloads in development, the way the order store does.
const globalState = globalThis as typeof globalThis & { __templateStore?: FileState };
const state: FileState = (globalState.__templateStore ??= {
  recipes: null,
  writable: true,
  queue: Promise.resolve(),
});

function now(): string {
  return new Date().toISOString();
}

/** Drops rows that no longer parse rather than failing the whole read. */
function parseAll(raw: unknown, source: string): TemplateRecipe[] {
  if (!Array.isArray(raw)) return [];

  const out: TemplateRecipe[] = [];
  for (const entry of raw) {
    const parsed = templateRecipeSchema.safeParse(entry);
    if (parsed.success) {
      out.push(parsed.data);
      continue;
    }
    // A recipe written against an older vocabulary — a retired variant, say.
    // Losing one template is survivable; refusing to serve the gallery is not.
    const id = (entry as { id?: unknown })?.id;
    console.error(
      `[templates] ignoring unreadable recipe ${typeof id === 'string' ? id : '?'} from ${source}: ${parsed.error.issues[0]?.message}`,
    );
  }
  return out;
}

async function loadFile(): Promise<TemplateRecipe[]> {
  if (state.recipes) return state.recipes;

  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    state.recipes = parseAll(JSON.parse(raw), DATA_FILE);
  } catch {
    state.recipes = [];
  }

  return state.recipes;
}

async function persistFile(): Promise<void> {
  if (!state.writable) return;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(state.recipes ?? [], null, 2), 'utf8');
  } catch {
    // Read-only filesystem: keep serving from memory for this process and stop
    // trying, exactly as the order store does.
    state.writable = false;
    console.error(
      '[templates] .data is not writable — templates will live in memory only and vanish with this process. Set DATABASE_URL.',
    );
  }
}

function transact<T>(work: () => Promise<T>): Promise<T> {
  const next = state.queue.then(work, work);
  state.queue = next.catch(() => undefined);
  return next;
}

export const fileTemplateStore: TemplateStore = {
  async list() {
    return [...(await loadFile())];
  },

  async get(id) {
    return (await loadFile()).find((recipe) => recipe.id === id) ?? null;
  },

  async save(draft) {
    return transact(async () => {
      const recipes = await loadFile();
      const at = recipes.findIndex((recipe) => recipe.id === draft.id);
      const stamped: TemplateRecipe = {
        ...draft,
        createdAt: at === -1 ? now() : recipes[at].createdAt,
        updatedAt: now(),
      };

      if (at === -1) recipes.push(stamped);
      else recipes[at] = stamped;

      await persistFile();
      return stamped;
    });
  },

  async remove(id) {
    return transact(async () => {
      const recipes = await loadFile();
      const at = recipes.findIndex((recipe) => recipe.id === id);
      if (at === -1) return false;

      recipes.splice(at, 1);
      await persistFile();
      return true;
    });
  },
};

type PgClient = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>;
};

export function createPostgresTemplateStore(pool: PgClient): TemplateStore {
  return {
    async list() {
      const { rows } = await pool.query('SELECT recipe FROM card_templates ORDER BY created_at');
      return parseAll(rows.map((row) => row.recipe), 'postgres');
    },

    async get(id) {
      const { rows } = await pool.query('SELECT recipe FROM card_templates WHERE id = $1', [id]);
      if (rows.length === 0) return null;
      return parseAll([rows[0].recipe], 'postgres')[0] ?? null;
    },

    async save(draft) {
      const { rows } = await pool.query(
        `INSERT INTO card_templates (id, recipe)
         VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET recipe = EXCLUDED.recipe, updated_at = now()
         RETURNING created_at, updated_at`,
        [draft.id, JSON.stringify(draft)],
      );

      // The timestamps are the database's, not this process's: two operators
      // on two instances must not disagree about which save was later.
      const row = rows[0] ?? {};
      const iso = (value: unknown) =>
        value instanceof Date ? value.toISOString() : String(value ?? now());

      return { ...draft, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) };
    },

    async remove(id) {
      const { rows } = await pool.query('DELETE FROM card_templates WHERE id = $1 RETURNING id', [
        id,
      ]);
      return rows.length > 0;
    },
  };
}
