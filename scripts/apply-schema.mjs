/**
 * Applies lib/db/schema.sql to the database in DATABASE_URL.
 *
 *   npm run db:apply
 *
 * Exists because the obvious routes both fail. `psql` is not installed on
 * every machine that needs to deploy this, and the SQL console embedded in the
 * Vercel dashboard sends the editor's contents as a single prepared statement,
 * which cannot hold more than one command — so pasting a 91-line schema into
 * it returns "cannot insert multiple commands into a prepared statement" no
 * matter how many times you press Run.
 *
 * `pg` has no such limit: a query with no parameters goes over the simple
 * query protocol, which takes a whole script.
 *
 * The script runs inside one transaction. PostgreSQL makes DDL transactional,
 * so a failure half way through leaves nothing behind — worth having because
 * schema.sql is deliberately not idempotent (no `IF NOT EXISTS` anywhere), and
 * a partially applied schema is far more annoying to unpick than a clean
 * failure.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
  console.error('  Windows PowerShell:  $env:DATABASE_URL = "postgres://..."; npm run db:apply');
  console.error('  bash:                DATABASE_URL="postgres://..." npm run db:apply');
  process.exit(1);
}

const sql = await readFile(path.join(root, 'lib', 'db', 'schema.sql'), 'utf8');
const client = new pg.Client({ connectionString: url, ssl: sslOptionsFor(url) });

try {
  await client.connect();
} catch (error) {
  console.error(`Could not connect: ${error.message}`);
  process.exit(1);
}

// A schema already in place is the common re-run, and the raw duplicate-object
// error does not make that obvious. Say so plainly instead.
const { rows } = await client.query(
  "SELECT to_regclass('public.orders') IS NOT NULL AS present",
);

if (rows[0].present) {
  console.log('The schema is already applied — "orders" exists. Nothing to do.');
  await client.end();
  process.exit(0);
}

try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(`Schema failed to apply, nothing was changed: ${error.message}`);
  await client.end();
  process.exit(1);
}

const summary = await client.query(`
  SELECT
    (SELECT count(*) FROM information_schema.tables  WHERE table_schema = 'public' AND table_type = 'BASE TABLE') AS tables,
    (SELECT count(*) FROM information_schema.views   WHERE table_schema = 'public') AS views,
    (SELECT count(*) FROM pg_indexes                 WHERE schemaname  = 'public') AS indexes
`);

const { tables, views, indexes } = summary.rows[0];
console.log(`Schema applied: ${tables} tables, ${views} view(s), ${indexes} indexes.`);

await client.end();
