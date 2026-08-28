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
| `icon-blossom.svg` | The first favicon — a bare blossom. Retired, unused, kept for the record |
| `avatar-mark-*.png` | 1024² profile picture for Telegram and Instagram. **Use these two** |
| `avatar-wordmark-*.png` | 1024² with the name spelled out, for anywhere the picture is shown large |
| `wordmark-cream.png`, `wordmark-noir.png` | 2400×800 banner on a solid ground — channel headers, posts |
| `wordmark-ink.png`, `wordmark-paper.png` | 3000×1000, transparent. `ink` for light grounds, `paper` for dark |

Everything in the table above whose name starts with `avatar-` or
`wordmark-` is built by `npm run brand:export`, from `wordmark.svg` and
`app/icon.svg` — **do not edit them by hand.** They exist as files because
Telegram and Instagram take PNG and compress it themselves; drawing that PNG
once by hand would create a second logo that eventually disagrees with the
site. Each also ships as `.svg` beside it, for print and for anyone who asks
for "the logo file".

Two pairs of avatars, and it is not a matter of taste: Telegram shows a
profile as a forty-pixel circle, where *bir dunyo* fits but cannot be read.
The mark goes in the profile; the name is for headers and posts. Sizes are
chosen from that circle — the mark's corners land at 87% of its radius, and
the square wordmark is set narrower than the banner one because the outermost
letters sit exactly where the crop falls.

In the transparent pair, the pale areas of the wordmark — the underside of the
turned corner, the counters of *b* and *o* — are cut out with a mask rather
than filled, for the same reason those shapes are `--wm-surface` on the web:
they are the ground showing through, not white paint.

The tag in these shots reads **Bir dunyo**, and so does the rest of the
product: the rename is complete, and the name lives in `lib/site.ts`.

`icon-blossom.svg` is not the tab icon. That is `app/icon.svg`, which Next
serves from the route rather than from here, and it draws the card *and* the
blossom — the blossom alone said flowers but not cards, and the card alone
reads as a file icon in a strip of tabs.

`wordmark.svg` came out of Recraft needing three corrections, none cosmetic: a
full-canvas rectangle was baked in as a background, the card's fill generated
muddy brown instead of the accent, and every paper-coloured shape — the
counters of *b* and *o*, the lifted corner — was a literal, so the mark punched
pale holes into any surface that was not the page. They are `--wm-surface` now.

The two paths that draw the turned corner carry `wm-fold`, which is what the
hover animation in `app/globals.css` moves. `components/site/Wordmark.tsx` is
generated from this file rather than transcribed — see the note in it. It keeps
the plain name `Wordmark` so the places that render the brand did not each need
editing; `WordmarkBlossom.tsx` beside it is the mark it replaced, unused and
kept for the record.

Nothing here is used inside a card. The card runtime deliberately ships zero
image or 3D assets: petals and the glass heart are procedural geometry, demo
photographs are generated SVG, and a card opened next to a bouquet on mobile
data should stay that way. These files are for pages a florist reads on wifi.
