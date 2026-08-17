# Where this project stands

Written to be read first — by a person picking the work back up on another
machine, or by an assistant starting a session with no history. The README
explains how the product works; this says what state it is in right now and
what is waiting.

**Last updated:** 17 August 2026 — every hand-written card ported, the
scroll bug found, and the dashboard finished in three languages.

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
- **Never print an identifier at a person either.** The dashboard spent weeks
  showing `СЦЕНА petals`, `НАСТРОЕНИЯ romantic, warm, dreamy` and every look in
  the builder as a raw id, which is the same bug as the one below wearing a
  different hat: correct-looking in English, wrong in both other languages, and
  invisible to anyone testing in English. Scenes, motifs, beats and all 37 looks
  are named in ru/en/uz now — `sceneLabel`, `motifLabel`, `beatLabel`,
  `lookLabel` in `lib/i18n/localise.ts`. A *template id* stays Latin, in a
  `<code>` under a label that says ID: an id is not a word.
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
- **Kill stale `next start` processes before believing a local test.** Ten of
  them were found listening at once on this machine. A new server on a taken
  port fails with `EADDRINUSE` *in its log* and exits, so requests go to
  whatever old build already owned the port and everything looks inexplicably
  out of date — a newly registered template missing from `/templates`, a 404 on
  a page that exists. `netstat -ano | grep LISTENING` and check the port is
  actually yours.
  This was first written up as "clear `.next`", because clearing it appeared to
  fix exactly that symptom. It probably did not: the working run also used a
  free port. The `.next` claim is withdrawn rather than left in as folklore.
- **Do not put `scroll-behavior: smooth` on `html`.** It was there and it was
  landing readers at the *bottom* of every page, two different ways. On a fresh
  load the browser restores the previous scroll offset while the document is
  still short — fonts, images and lazy sections have not arrived — so a restore
  of 3000px into a document currently 1200px tall clamps to the end, and the
  page then grows underneath somebody already at the bottom. On navigation the
  App Router's own scroll-to-top becomes an animation racing a document whose
  height is still changing. Anchor links jump now, which is what links do.
  Anything that wants smooth asks at the call site, the way `EnvelopeSection`
  does.
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
`OFFER.telegram` is `@birdunyo` as a placeholder rather than a real handle, so
the "write to us on Telegram" button on `/shops` currently leads nowhere.

**One bot cannot both notify and receive, asked and answered 17 August.** A
Telegram bot's username has to end in `bot`, so `@birdunyo` can never be the
notification bot — it would be `@birdunyo_bot`, and `t.me/birdunyo` is a person
or a channel. Separately, the bot here only *sends*: `lib/notify/telegram.ts`
deliberately has nothing to poll and no webhook, because notifications only go
outward. Making it receive means a webhook, a route and forwarding.

Three ways out, cheapest first: put a **real personal username** in
`lib/shops/offer.ts` — one line, works today, and a florist reaching a human
beats reaching a bot at zero volume; or `@birdunyo_bot` **with a webhook**,
which is real work and adds the inbound path the architecture avoided; or a
**channel**, which looks right and is the wrong shape, because nobody writes
into a channel. The first is the recommendation.

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
3. **Templates.** The plan is its own section further down — a video beat, then
   one hand port, then a builder, then an importer. That is the next real work.
4. **Do not rebuild the homepage yet.** The current landing is what a shop
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
two images, not for 3D (20) or video (60+). Meshy had 560 and has **406**; what
they bought is in the 3D section below.

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

### Where it landed: generate the organic, author the designed

The bouquet **was** tested, and the prediction that thin organic geometry comes
out as a blob was wrong — that belief talked the attempt out of happening twice.
The kraft cone has real creases, the jute bow has loops and tails, the stems
below the tie are separate, and the roses keep the spiral of their petals.

The tag went the other way. Two attempts at generating it failed differently:
the first flattened the folded corner and invented lettering, the second turned
the whole card scarlet. `image_to_3d` re-interprets a colour scheme every run,
and that design *is* a colour scheme — cream face, rose reverse, a corner turned
back to show it. So `components/three/scenes/BrandTag.tsx` builds it in code, a
few kilobytes against 2 MB, in the brand's own hexes.

**That is the rule now.** A rose is easier grown than drawn; a rounded rectangle
with a chamfer, a hole and a torus is the opposite. The seam also happens to be
the right one for the product: the flowers will not change and the tag will.

### What is live on `/shops`

The hero is that scene — bouquet mesh plus tag component, joined in the scene
graph, transparent canvas on the page's own paper. It replaced a photograph
that could not be re-shot and so went on showing a plain white rectangle long
after the tag was designed. Below it the tag section is a **still** of the
chosen design: two interactive objects on one page compete rather than add.

`public/3d/bouquet.glb` is 3.98 MB and the only downloaded 3D asset in the
product. It goes through the same gate as everything else, and three.js appears
nowhere in the initial HTML — verified against a production build. Draco would
take roughly half the geometry again if that ever matters.

### Two tools, and why they exist

- `scripts/glb-shrink.mjs` — re-encodes the textures inside a GLB. **Remesh
  always re-exports them as PNG**, twice out of twice: it cuts geometry honestly
  and then trebles the file. The bouquet went 44.29 → 17.32 → **3.80 MB** across
  generate, remesh, shrink while its triangles fell 1 413 730 → 60 682 and
  stayed there. Judge a GLB by its textures first.
- `scripts/glb-render.mjs` — rasterises a GLB to PNG in pure node, no browser,
  no GPU. It exists because a texture bug shipped twice and the *model* got the
  blame both times. **glTF puts UV (0,0) at the image's top-left**, which already
  matches a decoded bitmap's row order, so `imageOrientation: 'flipY'` samples
  every atlas upside down. Pass `flip` to reproduce the failure. Check a model
  here before anyone sees it.

### Credits

560 to start, **406 left** after the tag, the bouquet, four hero photographs and
four tag designs. The two failed tag generations cost 69 of that, and buying the
lesson was worth it.

### The tag design

Concept 1 — the folded corner — from four generated in
`assets/3d/tag/concepts/`. The logo made physical: the bowl of the *d* is a card
with its corner turned, so the tag is the mark rather than a label bearing it.

One finding there is functional, not aesthetic: **a QR must be dark on light.**
Concept 4 reverses it out of a rose band, and part of the scanner population
will not take an inverted code. The tag is read in someone else's shop, in bad
light, on the first try.

---

## Hand-made templates, and how they get in

There are one-off cards written by hand as plain static pages, outside this
repository:

| Where | What | Weight |
|---|---|---|
| `github.com/fird4vzy/invite` | `main.html` + `yes.html`, css, js, five GIFs | **19 MB** |
| `github.com/fird4vzy/1` | `index.html` + mp4 | 2 MB |
| `~/Desktop/проджэктыы/iLove` | one `index.html`, inline style and script, video | 9 MB |

**`iLove/index.html` has a bug to fix at source:** its first line is a markdown
fence — ```` ```html ```` — and its last is ```` ``` ````. A browser renders
both as visible text. Two lines to delete.

### Decided: port them into the engine

Four routes were weighed — link out to them as separate sites, upload and serve
them sandboxed, the same with token substitution, or port them into the template
engine. **Ported.** The others all end with third-party HTML and JS being served
from this origin, which is fine while one person writes them and is a hole the
day somebody else sends one: a script at `/c/[code]` shares an origin with the
admin and can read an operator's session cookie.

Porting removes that entirely. Nothing of theirs is ever served — it is read,
and what comes out is data.

### Why this is cheaper than it looks

**A template is already data, not code.** All six read the same way:

```ts
const sections = standardArc(input, { envelopeVariant: 'wax' });
return applyVariants(sections, this.sectionVariants);
```

Not one writes its own composition. The difference between any two is a palette
(6), a scene (6), which beats play (11), and one word per beat (30 variants).
That fits in a database row and a form — no file, no deploy.

### The plan, in order

1. ~~**A video beat.**~~ **Done, 14 August.** `video` is the twelfth section
   kind, declared by all six templates, and it composes straight after the
   letter — a recording is the closest thing to the sender being in the room,
   and it lands hardest once the words have set it up. Verified through the real
   path: with a clip the arc runs cover → envelope → intro → letter → **video**
   → gallery → quote → final → closing, and the beat's title arrives in the
   *card's* locale rather than the reader's.

   It is the one beat that can cost megabytes, so it spends nothing until it is
   asked to: the `<video>` is not mounted until the beat is near the viewport,
   `preload` is `none`, and a poster stands in until then. Autoplay is muted,
   in-view only, and off entirely under reduced motion.

   **It takes a URL, not a data URL**, and that is the important consequence.
   Photographs are inlined into the order record today; a nine-megabyte clip
   would be a twelve-megabyte database row. This field is where object storage
   stops being optional — the README already lists inlined photos as a known
   gap, and this makes it due.
2. ~~**Port `iLove` by hand.**~~ **Done, 14 August.** It is `templates/aloud/`,
   called *Вслух / Aloud / Ovoz bilan* — the one where the sender speaks. Live
   at `/templates/aloud`.

   **The port needed no markup, and cost one palette and one reordering.** The
   original was a single 40 KB HTML file with its styles and script inline; its
   four screens mapped onto `cover → envelope → video → letter` exactly, its
   letter was already blank-line separated paragraphs, and its flying hearts
   became the `petals` scene over a new `blush` palette taken from its own hex
   values. The only custom code is a `compose` that moves the video ahead of
   the letter, the same technique `anniversary` uses for its timeline: you
   watch someone say it, and the words that follow read as what would not fit
   in the camera.

   **The choreography was then ported too**, after the first pass turned out to
   be the right skeleton in the engine's default clothes. Four variants carry
   it, added the way `templates/README.md` prescribes so the next template gets
   them free:

   - `cover: gradient` — colour travelling along the name, three stops and back
     over seven seconds.
   - `envelope: heart` — not an envelope. The gate is a heart built from one
     rotated square and two circles, and tapping it sends the note up out of it
     rather than lifting a flap. The original's units are kept (a 125px square
     at −45°, circles offset by half its width) because those numbers are what
     make the lobes meet the point.
   - `video: screen` — the clip in a near-black box even in a light palette. A
     video is a window and a window is darker than its wall; without that it
     reads as an illustration pasted onto paper.
   - `letter: lines` — one line at a time, each resolving out of blur. The
     original does this with thirty-six hand-written `nth-child` rules, which
     works once, for a letter of exactly that length; here the stagger is an
     index. The blur went to `lib/design/motion.ts` as a `focus` preset.

   Hearts are thrown on the tap — fourteen, outward but never straight down,
   because hearts that sink read as falling rather than escaping.

   **What still does not survive a port is timing that was tuned by hand**, and
   that is worth expecting rather than treating as a fault when the importer
   makes the same trade automatically.

   Verified through the real path: given a clip, `aloud` composes
   cover → envelope → intro → **video → letter** → gallery → quote → final →
   closing, while `romantic` on the same input keeps letter → video.
3. ~~**A builder in `/admin/templates`.**~~ **Done, 14 August.** Pick a palette,
   a scene, the beats and a look for each, plus one optional reordering, and
   save. It appears in the gallery, at `/templates/<id>` and in the creation
   flow with no deploy.

   **A template is a row now, not a file.** `lib/card/recipe.ts` is the shape
   and `recipeToDefinition` rebuilds a working `TemplateDefinition` from it,
   `compose` included, so nothing downstream can tell a stored template from a
   compiled one. Stored in `card_templates` as JSONB — migration
   `003-templates.sql`, and **`npm run db:migrate` has to run against
   production before the next deploy.**

   Every control is an enum drawn from the vocabulary the renderer implements,
   so a form post cannot ask for a look nobody built — the same guarantee the
   AI layer has, for the same reason. An id belonging to a compiled template is
   refused outright rather than shadowing it.

   Two things it deliberately does not do. **The AI planner will not see a new
   template until the next restart**, because `lib/ai/schema.ts` builds its
   enum at module load; the cost is a slightly worse suggestion, never a broken
   card. And **there is no live preview in the form** — save it and open
   `/templates/<id>`, which plays the real thing rather than an approximation
   of it.

   Verified end to end against a production build: a recipe written straight
   into the store appears in the gallery beside the seven compiled ones and its
   page renders.

   Still to come: "save this order as a template", which is now cheap because a
   finished order already carries most of these fields.
4. ~~**An importer.**~~ **Done, 14 August.** A field at the top of the builder:
   paste a public GitHub URL, and it reads the repository's HTML, CSS and JS
   and fills the form below.

   It is the card planner with a different input. `lib/ai/import-schema.ts`
   holds the contract, and every field in it is an enum built from what the
   renderer implements — so the model cannot emit markup any more than the
   planner can, because there is no field for markup. **That is also what
   removes the security problem the other three routes had:** serving a
   stranger's HTML puts their script in the same cookie jar as the admin, and
   reading it produces data, which does not run.

   **It never saves.** The mapping is a judgement and some of those judgements
   will be wrong, so the result lands in the form for an operator to correct.

   `unmapped` is the field worth watching. The model is told to list screens no
   beat covers rather than stretch a beat to fit — that list is the engine's
   missing vocabulary, named by the thing that needed it. The video beat exists
   because a hand port turned one up the same way.

   Private repositories are refused rather than asked for a token. A feature
   that reads source should not start collecting credentials that can read
   source.

   **It is not switched on, deliberately.** `ANTHROPIC_API_KEY` is unset and
   buying one was weighed and declined on 17 August: the importer saves work on
   templates that are now all ported, and the four that existed were done by
   hand for nothing. Turn it on when somebody other than the two of us needs to
   add a template, or when there are thirty rather than ten.

   Setting the key no longer switches the card planner — that needs
   `AI_PLANNER=on` as well. They were one switch, which quietly coupled an
   operator tool run a handful of times to every customer's letter being
   rewritten by a model. At this volume a person writes better, which is why the
   product is concierge; the planner stays off until writing by hand gets
   expensive.

   The importer also takes a **folder**, not only a URL. Most hand-written cards
   are a folder on a desktop, and the browser posts only the text — images,
   audio and video are filtered out, because they belong to a card rather than a
   template.

5. ~~**`invite` and `1` through the builder.**~~ **Ported by hand instead, 17
   August, along with `BirthdayParty`.** The importer needs a paid key that is
   not worth buying yet — see the note below — and four templates by hand is an
   afternoon, so they were done properly rather than approximately.

   | Original | Template | What the engine was missing |
   |---|---|---|
   | `iLove` | **Вслух / Aloud** | the `video` beat |
   | `1` | **За окном / The Window** | `cover: film` — video *behind* the type |
   | `invite` | **Пойдём? / Shall We** | the `question` beat |
   | `BirthdayParty` | **При свечах / Candlelight** | the `cake` beat, card-level music |

   Ten templates now, four of them ported. **Every port turned up vocabulary
   the engine did not have**, which is the same thing the importer's
   `unmapped` field is for — doing them by hand simply found it sooner.

Order mattered, and it paid: building the builder first would have meant
guessing its fields, and the `reorder` field — the one that separates *Aloud*
from *Nocturne* — only became obvious after porting a template by hand.

---

## Ideas discussed, not built

- Notifying the **customer** when their card is ready — the VPS bot's
  subscriber table is the obvious groundwork.
- More templates. The variant vocabulary in `lib/card/variants.ts` is the real
  lever, not the number of template files; see `templates/README.md`.
- Real accounts. There is one shared password today, so the app knows a caller
  is an operator but not which one, and any operator can act on any shop's
  order.
