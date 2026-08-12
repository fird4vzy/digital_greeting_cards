-- Adds the CANCELLED order status to databases created before it existed.
--
-- `IF NOT EXISTS` makes this safe to re-run, which matters because the
-- migration runner records a migration only after it succeeds: a run that
-- fails part way must be able to start again.
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'CANCELLED';
