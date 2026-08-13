# Where this project stands

Written to be read first — by a person picking the work back up on another
machine, or by an assistant starting a session with no history. The README
explains how the product works; this says what state it is in right now and
what is waiting.

**Last updated:** 13 August 2026, after the rename to Bir dunyo.

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
| `TELEGRAM_BOT_TOKEN` | set, **but see the open items below** |
| `TELEGRAM_CHAT_ID` | **not set** — so no notification is ever sent |

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
2. **`TELEGRAM_CHAT_ID` is missing**, so no order notification is sent. The
   quickest way to the value is messaging @userinfobot. For a group, the bot
   has to be a member of it, and the id is negative.
   `notifyNewOrder` no longer fails silently: with *neither* variable set it
   stays quiet (that is `npm run dev` and every preview), but with only one
   set it logs an error naming the missing one, once per process. Until the
   variable is added, that line is in the Vercel runtime logs on every order.
3. **Redeploy after setting it.** Environment variables only reach a new build.
4. **Two test orders are on production** and should be deleted from the
   dashboard: `RWNPJV`, and whichever the first Telegram test creates. Both are
   unpublished, so the delete button is offered.
5. **The VPS bot is dead** — it polls with the revoked token. Give it the new
   one or leave it down; nothing here depends on it.
6. **That VPS publishes PostgreSQL on `5432`** with credentials that are in its
   public repository. Worth checking from outside (`nc -vz <ip> 5432`) and
   binding to `127.0.0.1` if it answers.
7. **The card published as `5HZKCH` still shows English wishes.** Cards are
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
as **self-serve**: "Create something beautiful", eight steps, do it yourself.

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
   **Before showing it to anyone:** set `telegram` in `lib/shops/offer.ts`; it
   is still the placeholder `@morethanabouquet`.
3. **Do not rebuild the homepage yet.** The current landing is what a shop
   sends its customer; it is written for exactly that. Rewriting it for an
   audience nobody has spoken to yet is optimising blind. Talk to five
   florists first.

Bear in mind the website is not the main tool while there are zero shops. The
first ten close by walking in with a phone, showing a real card, and leaving a
printed tag. The page is what they open after you leave, to check you are not
a student project.

---

## Ideas discussed, not built

- Notifying the **customer** when their card is ready — the VPS bot's
  subscriber table is the obvious groundwork.
- More templates. The variant vocabulary in `lib/card/variants.ts` is the real
  lever, not the number of template files; see `templates/README.md`.
- Real accounts. There is one shared password today, so the app knows a caller
  is an operator but not which one, and any operator can act on any shop's
  order.
