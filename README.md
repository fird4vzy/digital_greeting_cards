# Bir dunyo

A premium platform for personalised digital greeting cards attached to physical
flower bouquets by QR code.

*Picking the work back up? [`STATUS.md`](./STATUS.md) has the current state,
what is deployed, and what is waiting.*

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
| `/create` | The nine-question creation flow |
| `/c/8FJ29K` | A published card |
| `/c/8FJ29K/preview` | The customer's look at a draft the shop has not published |
| `/c/8FJ29K/qr` | The printable tag the shop ties to the flowers |
| `/admin/login` | The way in — one shared password |
| `/admin` | The shop-side queue |
| `/shops` | The pitch, written for florists rather than their customers — the offer, an earnings calculator, the workflow |

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
  icon.svg                  the tab mark, served from the route
  templates/                gallery + full previews
  create/                   the guided flow
  c/[code]/                 published cards + printable QR tag
  shops/                    the pitch aimed at florists
  admin/                    shop dashboard, orders, cards, templates
  api/                      orders, cards, qr, ai/plan

components/
  marketing/                landing + gallery sections
  cards/sections/           the 14 shared storytelling beats
  cards/CardRenderer.tsx    data → experience
  create/                   the creation flow
  shops/                    the earnings calculator
  three/                    the entire WebGL surface
  admin/  ui/  site/

lib/
  card/       schema, template types, composition, copy bank, demo stories
  design/     tokens, palettes, motion principles
  db/         repository interface, file store, PostgreSQL adapter, schema.sql
  i18n/       ru/uz/en dictionaries, negotiation, plural rules
  auth/       the admin password and session
  ai/         the plan contract, prompt, planners
  shops/      every number the florist offer is made of
  notify/     the Telegram message sent when an order lands
  site.ts     the brand name, in one place
  hooks/  utils/

public/brand/ marketing imagery and the wordmark — never used inside a card

templates/    one directory per template
```

---

## The template engine

*Adding one: [`templates/README.md`](./templates/README.md).*

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

The fourteen section kinds live in `lib/card/schema.ts` as a discriminated union.
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
export DATABASE_URL=postgres://…
npm run db:apply       # create a database from scratch
npm run db:migrate     # bring an existing one forward
```

`db:apply` runs `schema.sql` once, in a transaction. `db:migrate` applies
anything new in `lib/db/migrations/`, recording each file in
`schema_migrations` so it is safe to run repeatedly. Both are needed: once a
deployment is live, a change like adding an order status cannot be delivered by
re-running the schema.

`db:apply` exists because neither obvious route is reliable: `psql` is not
installed everywhere, and the SQL console in the Vercel dashboard sends the
editor's contents as one prepared statement, which cannot hold more than one
command — so a 91-line schema comes back as *"cannot insert multiple commands
into a prepared statement"*. The script applies the file in a single
transaction, so a failure leaves nothing behind; schema.sql has no
`IF NOT EXISTS` anywhere, and a half-applied schema is worse than none.

The `pg` import in `lib/db/postgres.ts` is lazy but deliberately written so a
bundler can see it. Hiding it — behind a computed specifier, say — keeps the
driver out of a traced deployment's output, and the fallback then turns that
into silence: no `DATABASE_URL` error, just an in-memory store quietly
forgetting every order.

Card configuration is `JSONB` deliberately: it is validated at the application
boundary by zod, read as a whole document every time, and its shape evolves
with the template library.

A "card" is not a second table — it is a published order, addressed by its
short code. `lib/db/types.ts` explains where to split that seam if cards ever
need their own lifecycle.

---

## Languages

Russian, Uzbek (Latin) and English, as typed dictionaries in `lib/i18n/`. A
missing string is a compile error rather than an English word surfacing in the
middle of a Russian page.

Two locales exist and are deliberately separate:

- **The visitor's**, negotiated in `proxy.ts` from a cookie, then
  `Accept-Language`. It drives the marketing site, the creation flow *and the
  shop dashboard* — a florist in Tashkent runs the queue in Uzbek.
- **The card's**, stored on the card itself. A card written in Russian stays
  Russian on a recipient's English phone, and in an operator's Uzbek admin.
  This is why `/c/…` is excluded from negotiation entirely.

Counts go through `plural()`, not string concatenation: Russian needs three
forms of the same noun (1 заказ, 2 заказа, 5 заказов) and picks between them on
the last digit, so `n === 1 ? '' : 's'` cannot be translated, only replaced.
`Intl.PluralRules` supplies the rule and the dictionary the wording.

Only human-readable strings live in dictionaries. Structure — which occasions
exist, which sections a template plays, which statuses an order can hold — stays
on the definitions, with English on it as a fallback, and translations are
overlaid at render time by `lib/i18n/localise.ts`.

---

## How an order travels

The customer answers nine questions and submits. The card is **composed
immediately** but published by nobody: it arrives in the dashboard as `NEW`
with a finished draft attached, and the customer gets a link to
`/c/[code]/preview` so the work is visible while the shop still owns the
outcome. `/c/[code]` stays `PUBLISHED`-only, which is what keeps a code
printed onto a tag from ever resolving to an unfinished card.

The shop reads the brief, adjusts the template or regenerates the card, then
publishes. A Telegram message goes out the moment an order lands, so nobody has
to sit watching the queue.

Two fields exist purely for that hand-off: `brief`, the customer's instructions
to the shop, which is never rendered into the card, and a contact — phone or
email, at least one, enforced in the API as well as the form. An order the shop
cannot ask a question about is an order it cannot finish.

---

## Deploying

The app is a standard Next.js server build — anywhere that runs `next build`
and `next start` will do. On Vercel, import the repository and the defaults are
correct; nothing in `next.config.ts` needs changing.

Three environment variables decide whether the deployment is real or a demo:

| Variable | Consequence if unset |
|---|---|
| `DATABASE_URL` | Serverless filesystems are read-only, so the file store degrades to memory. The site works, every order placed is lost. |
| `ADMIN_PASSWORD` | `/admin/login` says it is not configured and lets nobody through. Deliberate — see `lib/auth/admin.ts`. |
| `NEXT_PUBLIC_SITE_URL` | QR codes and share links are generated against the request's own origin. |
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | No notification is sent. Orders still arrive; somebody has to open the dashboard to find them. |

`NEXT_PUBLIC_SITE_URL` deserves more care than the other two. It is baked into
every QR code the shop prints, so a card tagged while it pointed at a
`*.vercel.app` preview keeps pointing there forever — long after the custom
domain is live. Set it to the final domain *before* anyone prints a tag.

Apply the schema to the database once, before the first deploy that has
`DATABASE_URL` set — point `DATABASE_URL` at it locally and run
`npm run db:apply`. After any release that adds a migration, run
`npm run db:migrate` against the same URL before the deploy goes live.

**Deleting versus cancelling.** A published card's code may already be printed
onto a tag and tied to a bouquet, so the row can never go away: `CANCELLED`
takes the page down and keeps the code reserved, and `isDeletable` in
`lib/db/types.ts` refuses to delete anything that has ever been published.
`/admin/export` hands the shop the whole order book as one JSON file — the
provider's backups restore a database, this restores a business.

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

- **The admin has one shared password, not accounts.** `/admin/login` exchanges
  `ADMIN_PASSWORD` for a signed session cookie (`lib/auth/admin.ts`), which is
  enough to keep the order queue off the open internet. It is not an identity
  layer: one credential is shared by everyone, so the app can tell that a
  caller is an operator but never which one, and there is no per-shop ownership
  check — any signed-in operator can act on any shop's order.
  `app/admin/actions.ts` is where that check belongs.
- **Photos are stored as data URLs** in the order record. They are downscaled
  and re-encoded on the device first, which keeps them small, but object
  storage is the right home — `lib/utils/image.ts` is the one function that
  changes.
- **The creation flow collects a story, not a timeline.** Dates, memories and
  wishes are fully supported by the schema, the templates and the admin, but
  the customer-facing flow does not ask for them yet.
- **Nobody chooses the card's language.** The two locales are separate by
  construction — the card carries its own, so it does not follow the reader's
  phone — but the flow never asks, so a card is always written in whatever
  language the customer was browsing in. That is right most of the time and
  wrong for the common case of buying in Russian for an Uzbek-speaking
  grandmother. The field, the API and the renderer already carry it; only the
  step is missing.
- The file-backed store serialises writes through a single promise chain, which
  is correct for one process and wrong for many.
