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
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, 'lib', 'db', 'migrations');

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

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.\n');
  console.error('  Windows PowerShell:  $env:DATABASE_URL = "postgres://..."; npm run db:migrate');
  console.error('  bash:                DATABASE_URL="postgres://..." npm run db:migrate');
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
