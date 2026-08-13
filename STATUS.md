# Where this project stands

Written to be read first — by a person picking the work back up on another
machine, or by an assistant starting a session with no history. The README
explains how the product works; this says what state it is in right now and
what is waiting.

**Last updated:** 13 August 2026, after the rename to Bir dunyo and a pass over
the repository for things the rename and the concierge pivot left behind.

---

## Deployed

Live at `digital-greeting-cards-ochre.vercel.app`, on Vercel, from the branch
`claude/premium-greeting-cards-yhj5rz` — which is this repository's default
branch, so every push to it deploys. Database is Neon PostgreSQL, connected
through the Vercel integration.

Environment variables in Vercel:

| Variable | State |
|---|---|
| `DATABASE_URL` | set by the Neon integration |
| `ADMIN_PASSWORD` | set |
| `NEXT_PUBLIC_SITE_URL` | set |
| `TELEGRAM_BOT_TOKEN` | set — but the token still wants revoking, see item 1 |
| `TELEGRAM_CHAT_ID` | set. A new order writes to the group |

Both migrations in `lib/db/migrations/` are applied to the live database.
Verified by placing a real order against production: it was accepted, arrived
as `NEW`, and stored its brief.

---

## Open items

1. **A bot token was pasted into a chat and must be revoked.** `/revoke` at
   @BotFather, then put the new one into Vercel. An earlier token was also
   committed to the public `fird4vzy/telegram-bot-docker` repository and
   revoked; that file is still in that repository's git history.
   *Audited 13 August:* **this** repository is clean — nothing token-shaped in
   the working tree or in any commit of any branch, so there is no history to
   rewrite here. The exposure is the chat and the other repository.
2. ~~**`TELEGRAM_CHAT_ID` is missing.**~~ **Done** — reported working on
   13 August: the bot is connected and a new order writes to the group. This
   entry stayed marked open long after it was fixed and sent a whole session
   after the wrong priority, which is the argument for closing items here as
   they land rather than in a batch afterwards.
   `/admin` now carries a notifications panel that reads the configuration
   server-side and sends a test message on demand, reporting Telegram's own
   refusal. It was built for this item and outlived it, because the useful half
   is the part that survives a working setup: both variables can look set while
   the token is revoked or the chat id is wrong, and `notifyNewOrder` must
   swallow that failure so an outage cannot break a customer's order. *chat not
   found* means the id is wrong or the bot was never added to the group;
   *Unauthorized* means the token is dead. Nothing about it creates an order,
   which is the point — see item 3.
3. **One test order is on production** and should be deleted from the
   dashboard: `RWNPJV`. It is unpublished, so the delete button is offered.
   The pair of junk orders that prompted the panel in item 2 came from the only
   way to test a deployment that used to exist: placing a real order against it.
4. **The VPS bot is dead** — it polls with the revoked token. Give it the new
   one or leave it down; nothing here depends on it.
5. **That VPS publishes PostgreSQL on `5432`** with credentials that are in its
   public repository. Worth checking from outside (`nc -vz <ip> 5432`) and
   binding to `127.0.0.1` if it answers.
6. **The card published as `5HZKCH` still shows English wishes.** Cards are
   composed once and stored, so fixing the code does not rewrite them —
   "Собрать открытку" on the order regenerates it.

---

## What was built, in order

Each of these has a commit message explaining the reasoning; `git log` is the
long version.

- Admin was open to anyone. Now a login page at `/admin/login` exchanges
  `ADMIN_PASSWORD` for a signed session cookie.
- The PostgreSQL path did not work at all: `pg` was not a dependency, its
  import was hidden from bundler tracing so it would not have shipped, and the
  INSERT failed on a type conflict. TLS is now decided by host rather than by a
  substring in the connection string.
- The whole dashboard was English; it and the card flow are now Russian, Uzbek
  and English throughout, with real plural rules.
- Orders can be cancelled, unpublished ones deleted, and everything exported.
- The creation flow no longer publishes. It collects a brief and a contact,
  composes a draft, and leaves publishing to the shop.

---

## Things that will bite

- **Cards are stored composed.** Changing template code or copy does not change
  cards already published. Regenerate them from the order page.
- **`/c/[code]` serves only `PUBLISHED`** and must stay that way: a code can be
  printed onto a tag. Drafts live at `/c/[code]/preview`.
- **`NEXT_PUBLIC_SITE_URL` is baked into printed QR codes.** Changing the
  domain after tags are printed strands them.
- **Never put a user-visible string in a template file or a component.** Three
  separate bugs came from exactly that, each one a word-for-word copy of an
  English dictionary entry, so each looked correct in English and broke both
  other languages. See `templates/README.md`.
- **Adding a column or an order status needs a migration**, not a re-run of
  `schema.sql` — the live database already has the schema.
- **`npm install` after every pull, not just on a fresh clone.** `pg` was added
  as a dependency partway through; pulling onto a machine with older
  `node_modules` fails the build with a module-not-found pointing at
  `lib/db/postgres.ts`, which looks like a code fault and is not one.
- **Stop the dev server before pulling.** The admin pages moved into the route
  group `app/admin/(dashboard)/`, and on Windows git could not remove the old
  directories while a watcher held them open. It asks
  `Deletion of directory ... failed. Should I try again? (y/n)` — answering `n`
  leaves them behind silently. They were empty that time, so nothing broke, but
  a leftover `page.tsx` under both the old and the new path gives two sources
  for one route with no warning. Verified clean on 13 August; the empty
  directories were removed.

---

## Product direction

This is the part that is not visible in the code, and it is currently the
thing blocking work. Discussed 13 August; decisions marked as such.

### The mismatch that was causing the confusion

The code has already chosen a business model. The landing page has not.

The creation flow no longer publishes — it takes a brief and a contact,
composes a draft, and leaves publishing to the shop. That is a **concierge**
model: the customer describes, a person finishes. The landing page still reads
as **self-serve**: "Create something beautiful", nine steps, do it yourself.

Nothing is broken. The shop window is one turn behind the machinery.

### Decided

- **The shop is the customer, not the buyer.** The shop already has a person
  holding money in the right mood. A counter upsell converts incomparably
  better than trying to bring that same person to a website cold.
- **Per published card, never a subscription.** Small shops here will not buy
  software on a recurring basis.
- **Billing event is the publish action, which already exists.** The shop
  publishes only after it has taken the customer's money, so the platform never
  asks for money the shop does not yet have. This removes the only real
  objection (paying up front for something that might not sell) and needs no
  new code.
- **First 10–20 cards free**, because their feedback is worth more than their
  money at this stage.
- **Stay concierge for now.** At zero volume the only moat is the quality of
  the writing. The AI layer is the path to lowering that cost later, and it is
  already constrained so a model cannot damage layout.

### The name: Bir dunyo

Chosen 13 August, from the candidates below. Uzbek for "a whole world" —
literally the promise the product makes, readable in all three languages, and
short enough for a domain and an Instagram handle. "More than a bouquet"
stays as the tagline ("Больше, чем букет").

**The rename is done.** The wordmark, every `<title>`, the colophon inside a
card, the printed tag, `package.json`, the schema header and the favicon all
say Bir dunyo. The name now lives in `lib/site.ts` and everything reads it from
there, so the next rename is one line. Two occurrences of the old name survive
on purpose: `WordmarkBlossom` is the retired mark and its own label is
historically correct, and `ui.closing.title` is the *tagline*, which the
decision keeps.

The mark is a wordmark — the bowl of the *d* in *dunyo* is a card with its
corner turned, and it peels further open on hover. The tab carries that same
card with a blossom on its face; the name alone is a smear at sixteen pixels,
and the card without the flower reads as a file icon.

Still not done: domain and handle availability unchecked, and
`OFFER.telegram` is `@birdunyo` as a placeholder rather than a real handle.

Candidates it beat: **Lola** (tulip, national flower — very local, very
common), **Konvert** (envelope — understood but generic), **Anor**
(pomegranate — warm and regional).

### Not decided

- **Price.** `/shops` is live and every number on it comes from
  `lib/shops/offer.ts`, marked provisional. Change that file and the page
  follows. The *shape* held up under its own calculator and one correction came
  out of building it: a flat fee per card collapses at the bottom of the range
  — beside a 100 000 bouquet the suggested card is 15 000, so a 15 000 fee left
  the shop earning nothing. It is a share of the card price now (25%), so the
  shop always keeps the majority at any bouquet size. Needs one conversation with one florist, not a guess. Only the
  shape is known: the add-on should be roughly 10–20% of the bouquet price to
  stay an impulse yes, and the majority should stay with the shop — the pitch
  is earnings, not commission. The fastest way to the number is asking a
  florist what *they* would charge.
### Next, in this order

1. **Close the STATUS items above.** A shop page in front of a product whose
   notifications do not work is worthless — the brief never reaches anyone.
2. ~~**Build `/shops`.**~~ Done. Six blocks: the offer, an earnings calculator
   driven by the florist's own bouquet price and volume, the product playing
   itself in a phone, the three-step workflow with real timings, the five
   questions shops actually ask, and a Telegram conversation instead of a
   signup form. Linked from the footer. A price *table* turned into a
   *calculator* deliberately — a florist wants to know what it adds to their
   counter, not what a card costs in the abstract.
   **Before showing it to anyone:** set `telegram` in `lib/shops/offer.ts`. It
   reads `@birdunyo`, which is a placeholder that merely looks real — nobody
   has checked whether the handle exists or registered it.
3. **Do not rebuild the homepage yet.** The current landing is what a shop
   sends its customer; it is written for exactly that. Rewriting it for an
   audience nobody has spoken to yet is optimising blind. Talk to five
   florists first.

Bear in mind the website is not the main tool while there are zero shops. The
first ten close by walking in with a phone, showing a real card, and leaving a
printed tag. The page is what they open after you leave, to check you are not
a student project.

---

## Tools wired up

**Meshy MCP** is configured globally in `~/.claude.json` as `meshy-mcp-server`
(`npx -y @meshy-ai/meshy-mcp-server`, key in `MESHY_API_KEY`). Verified on
13 August: the server starts, the key validates against Meshy's API, and it
exposes 24 tools. It is a local stdio server, so it only works in Claude Code
on a machine — not in the browser, and not as a claude.ai "custom connector",
which wants a hosted https URL that Meshy does not publish.

`meshy_text_to_3d` is the interesting one: a mesh from a description rather
than a reconstruction from a photograph, which is a different and much better
proposition for anything this product would want.

**Higgsfield MCP** is connected too, with about 5.5 credits left — enough for
two images, not for 3D (20) or video (60+).

---

## The 3D layer, and what not to do to it

The hero bloom was rebuilt in code on 13 August rather than replaced with a
generated model, and the reasoning is worth keeping: it renders in WebGL
already; what was wrong was flat petals, `meshLambertMaterial` (no specular
term at all), rings nearly coplanar, and a single sphere for a centre. Curved
geometry, sheen, the existing in-memory studio map, five staggered rings and a
crowd of stamens fixed it for zero bytes.

An imported GLB in the *card runtime* remains the thing not to do — the whole
3D layer's claim is that it downloads nothing and degrades to CSS on a weak
phone. Marketing pages are a different matter.

**There is now a generated tag model**, in `assets/3d/tag/` — deliberately not
in `public/`, so Next never serves it and it never joins a deployment. Its
README carries the prompts, the task ids and the honest limits. Read that before
regenerating anything.

Two findings from making it, both worth keeping:

- **Meshy is better than expected on hard-surface objects, and the route
  matters.** A mesh built from a purpose-made design render — flat ground, even
  light, blank face — has none of the baked lighting and lumpiness that a mesh
  built from a *photograph* inherits. The card came out perfectly flat and the
  twisted jute cord survived as real geometry, which is the part that normally
  collapses. The blanket objection to image-to-3D was about photographs, and
  saying so imprecisely nearly cost the attempt.
- **The numbers still argue for shipping renders, not meshes.** 104 514
  triangles and 6.9 MB for an object a person would model with two hundred, all
  fused into one mesh with one material, so the brass eyelet cannot be given
  metal and the cord cannot be given fibre. Remeshing halved the geometry and
  *doubled* the file, because it re-encoded the textures from JPEG to PNG.

So the tool earns its place upstream of the site, never inside it: open the
model, light it, render a frame, ship the frame. The `/shops` hero was left
alone — the existing photograph is a real scene and nothing generated beats it.

The bouquet was never tested. The prediction that thin organic geometry comes
out as a blob is still just a prediction.

---

## Ideas discussed, not built

- Notifying the **customer** when their card is ready — the VPS bot's
  subscriber table is the obvious groundwork.
- More templates. The variant vocabulary in `lib/card/variants.ts` is the real
  lever, not the number of template files; see `templates/README.md`.
- Real accounts. There is one shared password today, so the app knows a caller
  is an operator but not which one, and any operator can act on any shop's
  order.
