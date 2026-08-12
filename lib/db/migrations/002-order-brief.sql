-- The customer's instructions to the shop: deadlines, styling requests, the
-- things the eight questions have no slot for. Read by the shop, never
-- rendered into the card.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS brief TEXT;
