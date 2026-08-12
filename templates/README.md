# Adding a template

A template is a **recipe, not a page**. There is no template-specific markup
anywhere in this codebase, and adding one must never introduce any. That single
rule is what lets the library grow without the renderer changing.

Concretely, a template is one file of about fifty lines that answers four
questions:

| Question | Field |
|---|---|
| Which beats does it play, in what order? | `compose` |
| How should each beat look? | `sectionVariants` |
| What colour is it? | `paletteId` |
| What is in the air behind it? | `scene`, `motif` |

## The steps

1. Create `templates/<id>/index.ts`. Copy the closest existing template and
   change the answers — `sakura` is the simplest, `anniversary` shows how to
   reorder beats.
2. Add one import and one array entry in [`templates/index.ts`](./index.ts).

That is the whole job. The gallery, the creation flow, the admin, the AI
planner and the recommendation scoring all read from the registry, so the new
template appears in every one of them with no further work. No screenshots are
needed: the gallery plays each template live through the real renderer.

## What you can draw from

**Beats** (`supportedSections`) — `cover`, `envelope`, `intro`, `letter`,
`gallery`, `timeline`, `memories`, `quote`, `wishes`, `final`, `closing`.
A beat with no data disappears on its own: no photographs, no gallery.

**Looks** (`sectionVariants`) — the vocabulary lives in
[`lib/card/variants.ts`](../lib/card/variants.ts) and is checked at compile
time. Asking for a look nobody has built is a build error, not a silent
fallback to the default.

**Colour** (`paletteId`) — see [`lib/design/palettes.ts`](../lib/design/palettes.ts).

**Atmosphere** (`scene`) — `petals`, `sakura`, `bloom`, `heart`, `embers`, or
`none`. Every scene has a CSS-only fallback, so `scene` never decides whether
the card is readable.

## Where the differences actually come from

Ranked by how much distance they create, cheapest first:

1. **Palette and scene.** Two lines, and the card feels like a different
   product.
2. **Which beats play, and in what order.** `anniversary` moves the timeline
   ahead of the letter so the letter lands as a conclusion; `memories` drops
   the envelope entirely, because an archive is walked into, not unsealed.
   This is the strongest lever and it costs nothing but thought.
3. **Section variants.** The finest-grained control — and the one that pays
   forward, since a new variant is immediately available to every template that
   already exists.

If a new template needs a look that does not exist yet, add the variant to the
section component and to `SECTION_VARIANTS`, rather than forking the component.
The next template gets it for free.

## Rules that are easy to break by accident

- **Never put a user-visible string in a template file.** Card copy comes from
  the dictionaries in `lib/i18n/`, keyed by the *card's* locale. Templates once
  passed a literal `openPrompt: 'Open it'`, which shadowed the localised value
  and printed English on every Russian and Uzbek card; the option no longer
  exists. A template that wants different wording adds a dictionary key.
- **No gendered wording** anywhere in card copy. The sender and the recipient
  are both of unknown gender, and Russian has no neutral past tense — see the
  note at the top of [`lib/i18n/dictionaries/ru.ts`](../lib/i18n/dictionaries/ru.ts).
- **Do not assume data exists.** Photographs, moments, memories and wishes are
  all optional. `standardArc` already guards each one; hand-built arcs must too.
- **Do not add a screenshot or a preview image.** If a template only looks right
  in a still, it does not look right.

## Checking your work

```bash
npm run typecheck      # variants, palette ids and scene ids are all typed
npm run dev            # /templates plays every template live
```

Then open `/templates/<id>` for the full-size preview, and `/create` to confirm
the recommendation scoring picks it up for the occasions you declared.
