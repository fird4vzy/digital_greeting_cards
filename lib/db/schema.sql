-- ---------------------------------------------------------------------------
-- Bir dunyo — PostgreSQL schema
--
-- The application talks to a repository interface (lib/db/repository.ts), so
-- this schema is the production target rather than a hard dependency: the
-- file-backed store implements the same contract for local development.
--
-- Card configuration is stored as JSONB deliberately. It is validated at the
-- application boundary by the zod schema in lib/card/schema.ts, it is read as
-- a whole document every time, and its shape evolves with the template
-- library — all three point away from a normalised section table.
-- ---------------------------------------------------------------------------

-- 'CANCELLED' is a terminal state, not a deletion: a printed tag must keep
-- resolving to a reserved code. See lib/db/types.ts.
CREATE TYPE order_status AS ENUM ('NEW', 'PROCESSING', 'REVIEW', 'READY', 'PUBLISHED', 'CANCELLED');

CREATE TABLE orders (
  id              TEXT PRIMARY KEY,
  -- Public short code used in /c/:code. Unique, case-insensitive in practice.
  code            TEXT NOT NULL UNIQUE,

  customer_name   TEXT NOT NULL,
  customer_email  TEXT,
  customer_phone  TEXT,
  customer_telegram TEXT,
  shop            TEXT,

  recipient_name  TEXT NOT NULL,
  relationship    TEXT NOT NULL,
  occasion        TEXT NOT NULL,
  mood            TEXT NOT NULL,
  moods           TEXT[] NOT NULL DEFAULT '{}',
  -- The language the card is written in. Not the language the shop ordered
  -- in: a Tashkent shop browsing in Uzbek routinely sends a Russian card.
  locale          TEXT NOT NULL DEFAULT 'ru',

  message         TEXT NOT NULL DEFAULT '',
  photos          JSONB NOT NULL DEFAULT '[]'::jsonb,
  moments         JSONB NOT NULL DEFAULT '[]'::jsonb,
  memories        JSONB NOT NULL DEFAULT '[]'::jsonb,
  wishes          JSONB NOT NULL DEFAULT '[]'::jsonb,

  template_id     TEXT NOT NULL,
  status          order_status NOT NULL DEFAULT 'NEW',

  -- Validated against cardConfigSchema before it is written.
  config          JSONB,
  notes           TEXT,
  -- The customer's instructions to the shop. Never rendered into the card.
  brief           TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at    TIMESTAMPTZ
);

-- The card lookup on /c/:code is the hottest read in the product: it runs on
-- every scan, from a phone, next to a bouquet, with the customer watching.
CREATE UNIQUE INDEX orders_code_idx ON orders (upper(code));
CREATE INDEX orders_status_created_idx ON orders (status, created_at DESC);
CREATE INDEX orders_shop_idx ON orders (shop) WHERE shop IS NOT NULL;

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER orders_touch_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- A published card is a projection, not a second source of truth. This is the
-- seam to promote into a real table if cards ever outlive their order.
CREATE VIEW published_cards AS
  SELECT
    id,
    code,
    recipient_name,
    customer_name AS sender_name,
    template_id,
    occasion,
    published_at
  FROM orders
  WHERE status = 'PUBLISHED' AND config IS NOT NULL;

-- Scan analytics. Append-only; never joined on the hot path.
CREATE TABLE card_views (
  id         BIGSERIAL PRIMARY KEY,
  code       TEXT NOT NULL REFERENCES orders (code) ON DELETE CASCADE,
  viewed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer   TEXT
);

CREATE INDEX card_views_code_idx ON card_views (code, viewed_at DESC);

-- ---------------------------------------------------------------------------
-- Templates an operator built. See migrations/003-templates.sql for the full
-- reasoning; kept here so a database created from scratch matches one that was
-- migrated forward.
-- ---------------------------------------------------------------------------
CREATE TABLE card_templates (
  id          TEXT PRIMARY KEY,
  recipe      JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
