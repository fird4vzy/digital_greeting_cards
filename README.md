# More than a bouquet

A premium platform for personalised digital greeting cards attached to physical
flower bouquets by QR code.

```
Customer  →  Flower shop  →  This platform  →  Recipient
```

Someone buys flowers and adds a digital card. The shop ties a small printed tag
to the stems. The recipient scans it and opens a short, cinematic experience
written for exactly them.

---

## The one architectural idea

**A card is data, never generated markup.**

```
story input  →  template.compose()  →  CardConfig (zod)  →  CardRenderer  →  screen
```

Every card in the product — hand-built, seeded, or AI-planned — travels that
single path. Nothing anywhere writes HTML for a customer. The consequences are
the whole design:

- A new template costs **one file** and zero renderer changes.
- The AI layer is constrained by construction: it selects a registered template
  by enum and fills structured content, so it *cannot* emit markup, styles or
  layout. The worst a bad model output can do is word a card poorly.
- Sections are shared across all templates and styled entirely by CSS custom
  properties, so a brand-new look is one palette object.

`lib/card/schema.ts` is the contract. `templates/index.ts` is the registry.

---

## Running it

```bash
npm install
npm run dev            # http://localhost:3000
```

No database, no API keys, no seed step. The file-backed store seeds itself with
demo orders on first read, composed through the real template engine.

Worth visiting:

| Route | What it is |
|---|---|
| `/` | The landing page |
| `/templates` | The gallery — every template plays a live miniature |
| `/templates/romantic` | A full preview: the real renderer, demo content |
| `/create` | The eight-question creation flow |
| `/c/8FJ29K` | A published card |
| `/c/8FJ29K/qr` | The printable tag the shop ties to the flowers |
| `/admin` | The shop-side queue |

```bash
npm run build          # production build
npm run typecheck      # tsc --noEmit
```

---

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion ·
React Three Fiber / three.js · zod · PostgreSQL-ready repository.

---

## Layout

```
app/
  page.tsx                  landing
  templates/                gallery + full previews
  create/                   the guided flow
  c/[code]/                 published cards + printable QR tag
  admin/                    shop dashboard, orders, cards, templates
  api/                      orders, cards, qr, ai/plan

components/
  marketing/                landing + gallery sections
  cards/sections/           the 11 shared storytelling beats
  cards/CardRenderer.tsx    data → experience
  create/                   the creation flow
  three/                    the entire WebGL surface
  admin/  ui/  site/

lib/
  card/       schema, template types, composition, copy bank, demo stories
  design/     tokens, palettes, motion principles
  db/         repository interface, file store, PostgreSQL adapter, schema.sql
  ai/         the plan contract, prompt, planners
  hooks/  utils/

templates/    one directory per template
```

---

## The template engine

A template is a **recipe**, not a page. It declares which beats it plays, how
the shared sections should look, and its colourway:

```ts
export const romanticTemplate: TemplateDefinition = {
  id: 'romantic',
  name: 'Nocturne',
  paletteId: 'duskRose',
  scene: 'heart',
  supportedSections: ['cover', 'envelope', 'letter', 'gallery', /* … */],
  sectionVariants: { letter: 'serif', gallery: 'stack', closing: 'seal' },
  compose: (input) => applyVariants(standardArc(input), sectionVariants),
};
```

Add the file, add one line to `templates/index.ts`, and it appears in the
gallery, the creation flow, the admin registry and the AI planner's prompt —
because all four read the registry rather than a hard-coded list.

The eleven section kinds live in `lib/card/schema.ts` as a discriminated union.
The dispatch layer is a single exhaustive `switch`, so **TypeScript fails the
build** if a section kind is added without a component to render it.

---

## The 3D layer

Every WebGL scene is mounted through one gate (`components/three/Atmosphere`),
and the rules are the same everywhere:

1. A CSS-only atmosphere renders first and always — a device that never loads
   WebGL is never looking at an empty box.
2. three.js is a dynamic import. Verified: it lands in its own async chunk and
   **no page references it in initial HTML**.
3. It loads only for devices that opt in — reduced-motion, low-core,
   low-memory and data-saver users keep the CSS layer. Verified: zero canvases
   on every route under `prefers-reduced-motion: reduce`.
4. It loads only when the section is near the viewport, and the render loop
   pauses when the tab is hidden.
5. If the canvas throws — context loss, driver bug, blocked WebGL — an error
   boundary drops it and the CSS layer is still standing.

No 3D asset is downloaded, ever. Petals, sakura, embers, the bloom flower and
the cut-crystal heart are all procedural geometry built from bezier curves, and
the heart's environment map is a 64×32 texture generated in memory rather than
an HDRI.

---

## Data

The app depends on `OrderRepository`, never on a concrete store.

- **No `DATABASE_URL`** → file-backed store (`.data/orders.json`), seeded with
  demo orders. Correct for one process, wrong for many — which is exactly the
  line at which you should set the variable.
- **`DATABASE_URL` set** → PostgreSQL, against `lib/db/schema.sql`.

```bash
npm install pg
export DATABASE_URL=postgres://…
psql "$DATABASE_URL" -f lib/db/schema.sql
```

Card configuration is `JSONB` deliberately: it is validated at the application
boundary by zod, read as a whole document every time, and its shape evolves
with the template library.

A "card" is not a second table — it is a published order, addressed by its
short code. `lib/db/types.ts` explains where to split that seam if cards ever
need their own lifecycle.

---

## The AI layer

Set `ANTHROPIC_API_KEY` and the planner switches from heuristic to model. That
is the entire change; no call site is aware of which is running.

```
POST /api/ai/plan
{ "brief": "Something romantic for my girlfriend. Two years. She loves peonies." }
```

The model is given the template registry (generated into the prompt, so it can
never drift out of date) and must return a `CardPlan` — enum-constrained
template, taxonomy ids, and structured content. The result is validated by zod
and composed through the same engine a manual order uses.

The model is an enhancement, never a dependency: a failure, a refusal or a
missing key all fall through to the deterministic planner, because a customer
mid-checkout must always end up with a card.

---

## Known gaps

Honest list of what a v1 does not have:

- **The admin has one shared password, not accounts.** `/admin` is gated by
  HTTP Basic auth in middleware against `ADMIN_PASSWORD` (`lib/auth/admin.ts`),
  which is enough to keep the order queue off the open internet. It is not an
  identity layer: there are no per-operator sessions and no per-shop ownership
  check, so any operator can act on any shop's order. `app/admin/actions.ts` is
  where that check belongs.
- **Photos are stored as data URLs** in the order record. They are downscaled
  and re-encoded on the device first, which keeps them small, but object
  storage is the right home — `lib/utils/image.ts` is the one function that
  changes.
- **The creation flow collects a story, not a timeline.** Dates, memories and
  wishes are fully supported by the schema, the templates and the admin, but
  the customer-facing flow does not ask for them yet.
- The file-backed store serialises writes through a single promise chain, which
  is correct for one process and wrong for many.
