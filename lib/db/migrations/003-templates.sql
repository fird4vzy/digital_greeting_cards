-- ---------------------------------------------------------------------------
-- Templates an operator built, as opposed to templates a developer wrote.
--
-- One JSONB document per template, for the same reasons card configuration is
-- JSONB: it is validated at the application boundary by zod
-- (lib/card/recipe.ts), it is read whole every time, and its shape moves with
-- the section vocabulary. A normalised table of beats and variants would have
-- to be migrated every time a variant is added.
--
-- The id is the template id — it appears in /templates/:id and in an order's
-- template_id, so it is a real key rather than a surrogate. Nothing here
-- references orders: a card is stored already composed, so an order outlives
-- the template it was built from even if that template is deleted.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS card_templates (
  id          TEXT PRIMARY KEY,
  recipe      JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
