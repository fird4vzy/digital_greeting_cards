# 3D source material

Not `public/`, deliberately. Everything under `public/` is served by Next and
uploaded with every deployment; none of this is meant to reach a browser. These
are production files — you open them in Blender, light them, render a frame, and
*that frame* is what ships. Putting them here keeps them out of the build.

**Nothing in this directory is imported by any page, and that is the rule, not
an omission.** The card runtime's whole claim is that it downloads no 3D asset
at all: petals, sakura, the bloom and the glass heart are procedural geometry
and the environment map is generated in memory. A GLB in a card would end that.
Marketing pages are a different matter, but even there the numbers below argue
for shipping a render rather than the mesh.

## tag/ — the printed tag

The one physical object the business makes: the card a shop ties to the stems.

| File | Size | What it is |
|---|---|---|
| `tag-ref.png` | 1.1 MB | The design render the mesh was built from. Keep it — it is the provenance, and the input to any regeneration |
| `tag.glb` | 6.9 MB | As generated. 104 514 triangles, JPEG textures. What the viewer page shows |
| `tag-lean.obj` + `.mtl` | 2.9 MB | After remeshing. **21 081 quads** — this is the one to edit |
| `tag-lean.blend` | 6.9 MB | The same, as a Blender scene |
| `tag-web.glb` | 2.1 MB | Remeshed and shrunk. Ready for a page |

`tag-lean.glb` is not kept. Remeshing halved the geometry but re-encoded the
textures from JPEG to PNG, so the file came out at 13 MB — larger than the
original it was meant to slim down, and worse on both counts than either file
that is here.

### How it was made

Meshy, 38 credits total. A generated design image first, then a mesh from that
image — **not** from a photograph. That distinction is the whole reason it
worked: reconstruction from a photo bakes the lighting into the texture and
delivers lumpy geometry, and the failure everyone means when they say
image-to-3D is bad. A purpose-built render on a flat ground, evenly lit, with a
blank face, has none of that to inherit.

1. `text_to_image`, nano-banana, 3 credits. Task `019ffa70-c530-7ebc-a282-229295eead3f`.
   > Product design reference of a single blank gift tag: a small portrait
   > rectangle of thick cream card stock with softly rounded corners, a round
   > metal eyelet punched at the top centre, and a short loop of twisted natural
   > jute cord threaded through it. The face is completely blank — no text, no
   > printing, no logo, no QR code. Isolated on a flat neutral grey background,
   > object centred and filling the frame, slight three-quarter angle, soft even
   > studio light, no cast shadow, no table, no other objects.
2. `image_to_3d`, meshy-6, PBR on, `remove_lighting` on, 30 credits.
   Task `019ffa72-a9b0-7f19-9efb-7db5d97ef396`.
3. `remesh` to 20 000 quads, glb + obj + blend, 5 credits.
   Task `019ffa88-d302-7f41-a7c8-e34f2eb8f4de`.

**The face is blank on purpose.** A model will turn lettering and a QR code into
noise, and the real tag prints a different code for every order anyway. Text and
QR belong in the render, composited onto the face — never in the mesh.

Ask for `obj` or `fbx` when you want quads. glTF stores triangles only, so
`topology: quad` alongside `target_formats: ["glb"]` is silently ignored — which
is exactly what happened on the first run here.

### Always run `glb-shrink` before anything sees a GLB

`node scripts/glb-shrink.mjs in.glb out.glb [maxEdge=1024] [quality=82]`

**Remesh re-exports textures as PNG.** That happened on both models, and it is
the single fact that decides whether any of this can be shipped: remeshing cuts
geometry honestly and then triples the file, because lossless pictures replace
lossy ones. The script decodes each embedded image, caps its longest edge and
re-encodes as JPEG, rebuilding the binary chunk with corrected offsets. Geometry
is copied through untouched.

| | Generated | Remeshed | Shrunk |
|---|---|---|---|
| Bouquet | 44.29 MB | 17.32 MB | **3.80 MB** |
| Tag | 6.87 MB | 13.04 MB | **2.05 MB** |

The bouquet's textures went 3.37 MB → 14.06 MB → 0.53 MB across those three
steps while its triangle count fell 1 413 730 → 60 682 and stayed there. Judge a
GLB by its textures first; the mesh is rarely what makes it heavy.

### concepts/ — four tag designs

Generated after the first tag turned out to be a blank white rectangle with a
QR pasted on, which is not a design. All four grow out of the mark the brand
already owns: the bowl of the *d* is a card with a turned corner, and the
favicon carries a five-petal blossom.

`tagdes-1-fold` is the one to beat — the logo made physical, with the corner
folded back over the brand's rose. `2-rose` reads from across a room but sets
the name in a script the brand does not use. `3-arch` is the most tactile and
the least scannable. `4-band` reverses the QR out of the rose band, and that is
a functional fault, not a taste one: **a QR must be dark on light.** It is read
in someone else's shop, in bad light, on the first try.

## bouquet/ — the wrapped bouquet

| File | Size | What it is |
|---|---|---|
| `bouquet-ref.png` | 1.0 MB | The design render it was built from |
| `bouquet-web.glb` | 4.0 MB | Remeshed to 60 682 triangles and shrunk. Ready for a page |

The 44 MB original is **not** kept — it is 1 413 730 triangles, reproducible
from the reference above, and nothing git should carry.

Worth recording because the prediction was wrong: thin organic geometry was
supposed to come out as a blob, and that belief talked the attempt out of
happening twice. It did not. The kraft cone has real creases, the jute bow has
loops and tails, the stems below the tie are separate, and the roses keep the
spiral of their petals. At 60 682 triangles — a 23× cut — the silhouette and
structure survive; only petal crispness goes.

### What is wrong with it

- **One mesh, one material.** Card, brass eyelet and jute cord are a single
  object with a single texture set, so the brass cannot be given a metal shader
  and the cord cannot be given fibre. The properties are painted in. This is the
  real limit and no setting fixes it; separating them means splitting the mesh
  by hand.
- **Tessellation is unrelated to form** — the flat face carries as many
  triangles as the cord, which needs them. A person would model this tag with
  about two hundred.
- **The corners are asymmetric**: the right pair reads as chamfered, the left as
  rounded.

### What is right about it

The card is perfectly flat and of even thickness, which is where reconstruction
usually fails. The cord survived as real twisted geometry, strands and the knot
gripping the eyelet included — thin free-floating geometry is normally the first
thing to collapse. The hole is modelled through, not painted on.
