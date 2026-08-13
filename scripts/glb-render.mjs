/**
 * Renders a .glb to PNGs without a browser, so a model can be checked before
 * anyone sees it.
 *
 *   node scripts/glb-render.mjs model.glb out-prefix [flip]
 *
 * This exists because a texture bug shipped twice. A viewer was built, looked
 * wrong, and the wrongness was blamed on the model — the atlas was called
 * fragmented and the mesh was called at fault. Both were innocent. The viewer
 * was sampling the texture upside down, which painted the tag's lower half with
 * the atlas's empty black margin and turned the bouquet into a mush of pink and
 * green. Re-rendering here, both ways, settled it in one comparison.
 *
 * **glTF puts UV (0,0) at the image's top-left**, and that already matches the
 * row order of a decoded bitmap — so nothing needs flipping. Three.js sets
 * `texture.flipY = false` on glTF loads for exactly this reason; hand-written
 * WebGL has to make the same choice deliberately. Pass `flip` to sample with v
 * inverted and see the failure, which is more convincing than the rule.
 *
 * A second trap sits beside it: the base colour map is sRGB. Lighting it
 * without linearising first and then applying gamma at the end washes every
 * colour toward white — it looks like weak lighting and is not.
 *
 * Software rasteriser on purpose: no WebGL, no headless browser, no GPU. It
 * runs anywhere node does, including CI.
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import sharp from 'sharp';

const COMPONENT = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const COUNT = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function parseGlb(path) {
  const buf = fs.readFileSync(path);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.toString('utf8', 20, 20 + jsonLen));
  const binHeader = 20 + jsonLen;
  const bin = buf.subarray(binHeader + 8, binHeader + 8 + buf.readUInt32LE(binHeader));
  return { json, bin };
}

function readAccessor(json, bin, index) {
  const acc = json.accessors[index];
  const view = json.bufferViews[acc.bufferView];
  const Type = COMPONENT[acc.componentType];
  const n = COUNT[acc.type];
  const start = bin.byteOffset + (view.byteOffset || 0) + (acc.byteOffset || 0);
  return new Type(bin.buffer.slice(start, start + acc.count * n * Type.BYTES_PER_ELEMENT));
}

let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

function encodePng(width, height, rgb) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (width * 3 + 1)] = 0;
    rgb.copy(raw, y * (width * 3 + 1) + 1, y * width * 3, (y + 1) * width * 3);
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

async function main() {
  const [modelPath, prefix, flipArg] = process.argv.slice(2);
  const flip = flipArg === 'flip';
  const { json, bin } = parseGlb(modelPath);
  const prim = json.meshes[0].primitives[0];

  const positions = readAccessor(json, bin, prim.attributes.POSITION);
  const normals = prim.attributes.NORMAL != null ? readAccessor(json, bin, prim.attributes.NORMAL) : null;
  const uvs = prim.attributes.TEXCOORD_0 != null ? readAccessor(json, bin, prim.attributes.TEXCOORD_0) : null;
  const indices = readAccessor(json, bin, prim.indices);

  // Decode the base colour map to raw RGB so it can be point-sampled.
  const material = json.materials[prim.material ?? 0];
  const texIndex = material.pbrMetallicRoughness.baseColorTexture.index;
  const image = json.images[json.textures[texIndex].source];
  const bv = json.bufferViews[image.bufferView];
  const encoded = bin.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  const { data: texels, info } = await sharp(encoded).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const texW = info.width, texH = info.height, channels = info.channels;

  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let a = 0; a < 3; a += 1) {
      lo[a] = Math.min(lo[a], positions[i + a]);
      hi[a] = Math.max(hi[a], positions[i + a]);
    }
  }
  const centre = [0, 1, 2].map((a) => (lo[a] + hi[a]) / 2);
  const extent = Math.max(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1;

  const SIZE = 560;
  const VIEWS = [
    { name: 'front', yaw: 0, pitch: 0 },
    { name: 'three-quarter', yaw: -0.65, pitch: 0.15 },
  ];

  for (const view of VIEWS) {
    const scale = (SIZE * 0.82) / extent;
    const cy = Math.cos(view.yaw), sy = Math.sin(view.yaw);
    const cp = Math.cos(view.pitch), sp = Math.sin(view.pitch);
    const project = (x, y, z) => {
      const px = x - centre[0], py = y - centre[1], pz = z - centre[2];
      const rx = px * cy + pz * sy;
      let rz = -px * sy + pz * cy;
      const ry = py * cp - rz * sp;
      rz = py * sp + rz * cp;
      return [rx, ry, rz];
    };

    const colour = Buffer.alloc(SIZE * SIZE * 3, 20);
    const depth = new Float64Array(SIZE * SIZE).fill(-Infinity);
    const P = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const N = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    const T = [[0, 0], [0, 0], [0, 0]];

    for (let t = 0; t < indices.length; t += 3) {
      for (let v = 0; v < 3; v += 1) {
        const idx = indices[t + v];
        const p = project(positions[idx * 3], positions[idx * 3 + 1], positions[idx * 3 + 2]);
        P[v][0] = SIZE / 2 + p[0] * scale;
        P[v][1] = SIZE / 2 - p[1] * scale;
        P[v][2] = p[2];
        if (normals) {
          const n = project(normals[idx * 3] + centre[0], normals[idx * 3 + 1] + centre[1], normals[idx * 3 + 2] + centre[2]);
          N[v][0] = n[0]; N[v][1] = n[1]; N[v][2] = n[2];
        }
        if (uvs) { T[v][0] = uvs[idx * 2]; T[v][1] = uvs[idx * 2 + 1]; }
      }

      const minX = Math.max(0, Math.floor(Math.min(P[0][0], P[1][0], P[2][0])));
      const maxX = Math.min(SIZE - 1, Math.ceil(Math.max(P[0][0], P[1][0], P[2][0])));
      const minY = Math.max(0, Math.floor(Math.min(P[0][1], P[1][1], P[2][1])));
      const maxY = Math.min(SIZE - 1, Math.ceil(Math.max(P[0][1], P[1][1], P[2][1])));
      if (minX > maxX || minY > maxY) continue;

      const area = (P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1]);
      if (Math.abs(area) < 1e-12) continue;

      for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((P[1][0] - P[0][0]) * (py - P[0][1]) - (px - P[0][0]) * (P[1][1] - P[0][1])) / area;
          const w1 = ((px - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (py - P[0][1])) / area;
          const w2 = 1 - w0 - w1;
          if (w0 < 0 || w1 < 0 || w2 < 0) continue;
          const z = P[0][2] * w2 + P[1][2] * w1 + P[2][2] * w0;
          const at = y * SIZE + x;
          if (z <= depth[at]) continue;
          depth[at] = z;

          let nx = N[0][0] * w2 + N[1][0] * w1 + N[2][0] * w0;
          let ny = N[0][1] * w2 + N[1][1] * w1 + N[2][1] * w0;
          let nz = N[0][2] * w2 + N[1][2] * w1 + N[2][2] * w0;
          const len = Math.hypot(nx, ny, nz) || 1;
          nx /= len; ny /= len; nz /= len;

          const u = T[0][0] * w2 + T[1][0] * w1 + T[2][0] * w0;
          let vv = T[0][1] * w2 + T[1][1] * w1 + T[2][1] * w0;
          if (flip) vv = 1 - vv;

          const sx = Math.max(0, Math.min(texW - 1, Math.floor(u * texW)));
          const sy2 = Math.max(0, Math.min(texH - 1, Math.floor(vv * texH)));
          const off = (sy2 * texW + sx) * channels;

          const lambert = Math.abs(nx * 0.35 + ny * 0.55 + nz * 0.76);
          const shade = 0.28 + 0.78 * lambert;
          for (let c = 0; c < 3; c += 1) {
            colour[at * 3 + c] = Math.max(0, Math.min(255, Math.round(texels[off + c] * shade)));
          }
        }
      }
    }

    const name = `${prefix}-${view.name}${flip ? '-flipped' : ''}.png`;
    fs.writeFileSync(name, encodePng(SIZE, SIZE, colour));
    console.log('wrote', name);
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
