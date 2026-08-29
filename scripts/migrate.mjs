/**
 * Applies pending files from lib/db/migrations to the database in DATABASE_URL.
 *
 *   npm run db:migrate
 *
 * `db:apply` creates a database from scratch; this brings an existing one
 * forward. Both are needed: the schema is already live on a deployment, so a
 * change like adding an order status cannot be delivered by re-running the
 * schema — it has to be an incremental step that knows what has already run.
 *
 * Applied filenames are recorded in `schema_migrations`, so running this twice
 * is a no-op. Each file runs inside a transaction where PostgreSQL allows it;
 * `ALTER TYPE … ADD VALUE` is the notable exception, which is why migrations
 * are also written to be safe to re-run on their own.
 */

import { readFile, readdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'lib', 'db', 'migrations');

/**
 * Reads `.env.local` and `.env`, the way `next dev` already does.
 *
 * This is a plain node script, so it does not inherit Next's env loading, and
 * that difference cost a session. The connection string lives in `.env.local`
 * for every other command in the project; this one alone demanded it be pasted
 * into the shell by hand, and a string pasted into a terminal lasts exactly as
 * long as that terminal — which is why the same migration looked un-runnable
 * the second time it was needed.
 *
 * A real environment variable still wins, so `DATABASE_URL=... npm run
 * db:migrate` keeps working for a one-off run against another database.
 *
 * Twenty lines rather than a dependency: it needs `KEY=value`, comments and
 * quotes, and nothing else.
 */
function loadEnvFiles() {
  // `.env.local` first, so `.env` cannot overwrite what it set.
  for (const name of ['.env.local', '.env']) {
    let text;
    try {
      text = readFileSync(path.join(root, name), 'utf8');
    } catch {
      continue;
    }

    for (const line of text.split(/\r?\n/)) {
      const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;

      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;

      const value = rawValue.trim();
      const quoted = /^(['"])([\s\S]*)\1$/.exec(value);
      // An unquoted value ends at the first `#`; a quoted one may contain one,
      // and a connection string routinely does, inside the password.
      process.env[key] = quoted ? quoted[2] : value.split('#')[0].trim();
    }
  }
}

loadEnvFiles();

/** Mirrors the rule in lib/db/postgres.ts: anything not loopback gets TLS. */
function sslOptionsFor(connectionString) {
  let host;
  try {
    host = new URL(connectionString).hostname;
  } catch {
    return { rejectUnauthorized: true };
  }

  const isLocal = ['localhost', '127.0.0.1', '::1', ''].includes(host);
  if (isLocal && !connectionString.includes('sslmode=require')) return undefined;

  return { rejectUnauthorized: !connectionString.includes('sslmode=no-verify') };
}

// Та же развилка, что у приложения: вне продакшена DATABASE_URL_DEV
// побеждает. Миграция, применённая не к той базе, обнаруживается позже всего,
// поэтому выбор здесь обязан совпадать с выбором в lib/db/connection.ts.
const devUrl = process.env.NODE_ENV === 'production' ? null : process.env.DATABASE_URL_DEV?.trim();
const url = devUrl || process.env.DATABASE_URL;
if (devUrl) console.log('База разработки (DATABASE_URL_DEV).
');
if (!url) {
  console.error('DATABASE_URL is not set, and no .env.local or .env supplied it.\n');
  console.error('  Best: put one line into .env.local — it is gitignored, and it is');
  console.error('  what every other command in this project already reads:\n');
  console.error('    DATABASE_URL=postgres://...\n');
  console.error('  The string is in Vercel under Settings -> Environment Variables,');
  console.error('  or in the Neon dashboard.\n');
  // Один и тот же тупик встречают на каждой новой машине, и не потому, что
  // что-то сломалось: `.env*.local` стоит в .gitignore — там пароль от базы,
  // ему там и место, — поэтому `git pull` этот файл не приносит и не
  // принесёт никогда. Копировать строку руками при этом не обязательно:
  // Vercel отдаёт весь набор одной командой, и делается это раз на машину.
  console.error('  Or let Vercel write the file for you — once per machine:\n');
  console.error('    npx vercel link                 # pick this project');
  console.error('    npx vercel env pull .env.local\n');
  console.error('  Just this once, without a file:');
  console.error('    PowerShell:  $env:DATABASE_URL = "postgres://..."; npm run db:migrate');
  console.error('    bash:        DATABASE_URL="postgres://..." npm run db:migrate');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: sslOptionsFor(url) });

try {
  await client.connect();
} catch (error) {
  console.error(`Could not connect: ${error.message}`);
  process.exit(1);
}

const schemaPresent = await client.query(
  "SELECT to_regclass('public.orders') IS NOT NULL AS present",
);

if (!schemaPresent.rows[0].present) {
  console.error('No schema found — run "npm run db:apply" first.');
  await client.end();
  process.exit(1);
}

await client.query(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    name       TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )
`);

const { rows: done } = await client.query('SELECT name FROM schema_migrations');
const applied = new Set(done.map((row) => row.name));

const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
const pending = files.filter((f) => !applied.has(f));

if (pending.length === 0) {
  console.log(`Up to date — ${files.length} migration(s) already applied.`);
  await client.end();
  process.exit(0);
}

for (const file of pending) {
  const sql = await readFile(path.join(dir, file), 'utf8');

  try {
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    console.log(`  applied ${file}`);
  } catch (error) {
    console.error(`  failed  ${file}: ${error.message}`);
    console.error('\nStopped. Later migrations were not run.');
    await client.end();
    process.exit(1);
  }
}

console.log(`\n${pending.length} migration(s) applied.`);
await client.end();
