/**
 * Re-encodes the textures inside a .glb, which is almost always what makes one
 * too heavy to ship.
 *
 * Meshy's remesh step re-exports textures as PNG. That is lossless and correct
 * for an archive, and ruinous for the web: remeshing the bouquet cut its
 * geometry 23× — 1 413 730 triangles down to 60 682 — and the file still grew
 * from what the geometry alone would be, because 3.4 MB of JPEG came back as
 * 14 MB of PNG. Every measurement taken here has had the same shape: the mesh
 * is not the problem, the pictures on it are.
 *
 * This decodes each embedded image, caps its longest edge, re-encodes it as
 * JPEG, and rebuilds the binary chunk with corrected offsets. Geometry is
 * copied through untouched — nothing here changes a single vertex.
 *
 *   node scripts/glb-shrink.mjs in.glb out.glb [maxEdge=1024] [quality=82]
 *
 * `sharp` comes in with Next, so there is nothing to install.
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const [input, output, maxEdge = '1024', quality = '82'] = process.argv.slice(2);

if (!input || !output) {
  console.error('usage: node scripts/glb-shrink.mjs in.glb out.glb [maxEdge] [quality]');
  process.exit(1);
}

const MAGIC = 0x46546c67; // "glTF"
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function parse(buffer) {
  if (buffer.readUInt32LE(0) !== MAGIC) throw new Error(`${input} is not a .glb`);

  let offset = 12;
  let json = null;
  let bin = null;

  // Chunks are ordered JSON then BIN in practice, but the spec only requires
  // JSON first — so dispatch on the type rather than assuming positions.
  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const body = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === JSON_CHUNK) json = JSON.parse(body.toString('utf8'));
    else if (type === BIN_CHUNK) bin = body;

    offset += 8 + length + ((4 - (length % 4)) % 4);
  }

  if (!json || !bin) throw new Error('missing JSON or BIN chunk');
  return { json, bin };
}

/** GLB requires every chunk to start on a four-byte boundary. */
function pad(length) {
  return (4 - (length % 4)) % 4;
}

const source = await readFile(input);
const { json, bin } = parse(source);

const views = (json.bufferViews ?? []).map((view) =>
  bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength),
);

const imageViews = new Map();
for (const image of json.images ?? []) {
  if (image.bufferView != null) imageViews.set(image.bufferView, image);
}

let before = 0;
let after = 0;

for (const [index, image] of imageViews) {
  const original = views[index];
  before += original.length;

  const pipeline = sharp(original).resize({
    width: Number(maxEdge),
    height: Number(maxEdge),
    fit: 'inside',
    withoutEnlargement: true,
  });

  const encoded = await pipeline.jpeg({ quality: Number(quality), mozjpeg: true }).toBuffer();
  const meta = await sharp(encoded).metadata();

  views[index] = encoded;
  image.mimeType = 'image/jpeg';
  after += encoded.length;

  console.log(
    `  image ${index}: ${(original.length / 1048576).toFixed(2)} MB → ` +
      `${(encoded.length / 1048576).toFixed(2)} MB  (${meta.width}×${meta.height} jpeg)`,
  );
}

if (imageViews.size === 0) console.log('  no embedded images — nothing to do');

// Re-pack the binary chunk. Offsets shift as soon as one image changes size, so
// every bufferView is rewritten rather than only the image ones.
const packed = [];
let cursor = 0;

json.bufferViews.forEach((view, index) => {
  const data = views[index];
  packed.push(data);
  view.byteOffset = cursor;
  view.byteLength = data.length;
  cursor += data.length;

  const padding = pad(data.length);
  if (padding) {
    packed.push(Buffer.alloc(padding));
    cursor += padding;
  }
});

const binChunk = Buffer.concat(packed);
json.buffers = [{ byteLength: binChunk.length }];

const jsonChunk = Buffer.from(JSON.stringify(json), 'utf8');
const jsonPadding = Buffer.alloc(pad(jsonChunk.length), 0x20); // spaces, per spec
const binPadding = Buffer.alloc(pad(binChunk.length), 0);

const header = Buffer.alloc(12);
header.writeUInt32LE(MAGIC, 0);
header.writeUInt32LE(2, 4);

const chunks = [
  header,
  Buffer.alloc(8),
  jsonChunk,
  jsonPadding,
  Buffer.alloc(8),
  binChunk,
  binPadding,
];

chunks[1].writeUInt32LE(jsonChunk.length + jsonPadding.length, 0);
chunks[1].writeUInt32LE(JSON_CHUNK, 4);
chunks[4].writeUInt32LE(binChunk.length + binPadding.length, 0);
chunks[4].writeUInt32LE(BIN_CHUNK, 4);

const result = Buffer.concat(chunks);
result.writeUInt32LE(result.length, 8);

await writeFile(output, result);

console.log(
  `${input} → ${output}\n` +
    `  textures ${(before / 1048576).toFixed(2)} MB → ${(after / 1048576).toFixed(2)} MB\n` +
    `  file     ${(source.length / 1048576).toFixed(2)} MB → ${(result.length / 1048576).toFixed(2)} MB`,
);
