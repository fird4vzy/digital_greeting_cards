# Brand assets

Generated with Higgsfield, kept as source-of-truth files rather than
regenerated on demand: a marketing image that changes every time the page
builds is not a brand.

| File | Where it is used |
|---|---|
| `bouquet-tag.webp` | The hero photograph on `/shops` |
| `bouquet-tag-wide.webp` | Same scene, wider framing. Unused — an alternative |
| `bouquet-tag-vertical.webp` | 9:16, for Instagram. Also the first frame of the reel |
| `bouquet-tag-reel.mp4` | 5s vertical clip, silent. Not served by any page — upload it to Instagram and put music over it |
| `wordmark.svg` | The Bir dunyo wordmark. Transparent, colours driven by `--wm-ink` / `--wm-surface` |

The tag in these shots reads **Bir dunyo**, the name chosen on 13 August. The
rest of the product still says "More than a bouquet" — see STATUS.md.

`wordmark.svg` came out of Recraft needing three corrections, none cosmetic: a
full-canvas rectangle was baked in as a background, the card's fill generated
muddy brown instead of the accent, and every paper-coloured shape — the
counters of *b* and *o*, the lifted corner — was a literal, so the mark punched
pale holes into any surface that was not the page. They are `--wm-surface` now.

The two paths that draw the turned corner carry `wm-fold`, which is what the
hover animation in `globals.css` moves. `components/site/WordmarkBirDunyo.tsx`
is generated from this file rather than transcribed — see the note in it.

Nothing here is used inside a card. The card runtime deliberately ships zero
image or 3D assets: petals and the glass heart are procedural geometry, demo
photographs are generated SVG, and a card opened next to a bouquet on mobile
data should stay that way. These files are for pages a florist reads on wifi.
