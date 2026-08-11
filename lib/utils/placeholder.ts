/**
 * Deterministic image placeholders.
 *
 * Demo cards, template previews and the creation flow all need to look
 * composed before a single real photograph exists. Rather than shipping stock
 * imagery (which would make the product look like a template site), we
 * generate soft out-of-focus abstractions as inline SVG: zero requests, zero
 * bytes over the wire beyond the markup, and they inherit the card palette.
 *
 * Real uploads replace these transparently — `CardPhoto` does not care which
 * kind of URL it is handed.
 */

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 10000) / 10000;
  };
}

export type PlaceholderOptions = {
  /** Two or three hex colours pulled from the active card palette. */
  colors?: string[];
  width?: number;
  height?: number;
};

/**
 * Builds a blurred, multi-blob composition that reads as a photograph shot at
 * f/1.4 — enough to carry layout and mood without pretending to be a picture.
 */
export function photoPlaceholder(seed: string, options: PlaceholderOptions = {}): string {
  const { colors = ['#c9a7a0', '#7d5c5f', '#f0dcd6'], width = 1200, height = 1500 } = options;

  const random = rng(hash(seed));
  const short = Math.min(width, height);

  // Many small overlapping shapes under a modest blur read as a photograph at
  // a shallow depth of field. Few large ones under a heavy blur read as a CSS
  // gradient — which is the thing this exists to avoid.
  const blobs = Array.from({ length: 9 }, (_, index) => {
    const cx = Math.round(random() * width);
    const cy = Math.round(random() * height);
    const r = Math.round((0.1 + random() * 0.26) * short);
    const fill = colors[Math.floor(random() * colors.length)] ?? colors[0];
    const opacity = (0.35 + random() * 0.5).toFixed(2);
    const squash = (0.7 + random() * 0.7).toFixed(2);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${Math.round(r * Number(squash))}" fill="${fill}" opacity="${opacity}"/>`;
  }).join('');

  // A few small, bright, less-blurred accents give the highlight sparkle that
  // makes an out-of-focus photograph feel like one.
  const highlight = colors[colors.length - 1] ?? '#ffffff';
  const sparkles = Array.from({ length: 4 }, () => {
    const cx = Math.round(random() * width);
    const cy = Math.round(random() * height);
    const r = Math.round((0.03 + random() * 0.07) * short);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${highlight}" opacity="${(0.25 + random() * 0.3).toFixed(2)}"/>`;
  }).join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<defs>` +
    `<filter id="b" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feGaussianBlur stdDeviation="${Math.round(short * 0.055)}"/></filter>` +
    `<filter id="s" x="-25%" y="-25%" width="150%" height="150%">` +
    `<feGaussianBlur stdDeviation="${Math.round(short * 0.025)}"/></filter>` +
    `<linearGradient id="v" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="#000" stop-opacity="0.04"/>` +
    `<stop offset="55%" stop-color="#000" stop-opacity="0.1"/>` +
    `<stop offset="100%" stop-color="#000" stop-opacity="0.34"/></linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="${colors[0]}"/>` +
    `<g filter="url(#b)">${blobs}</g>` +
    `<g filter="url(#s)">${sparkles}</g>` +
    `<rect width="100%" height="100%" fill="url(#v)"/>` +
    `</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function isGeneratedPlaceholder(url: string): boolean {
  return url.startsWith('data:image/svg+xml');
}

/** Builds a set of demo photos for previews and seeded demo cards. */
export function demoPhotos(seed: string, count: number, colors: string[]) {
  return Array.from({ length: count }, (_, index) => ({
    id: `${seed}-${index + 1}`,
    url: photoPlaceholder(`${seed}-${index}`, {
      colors,
      width: index % 3 === 0 ? 1400 : 1100,
      height: index % 3 === 0 ? 1000 : 1400,
    }),
    width: index % 3 === 0 ? 1400 : 1100,
    height: index % 3 === 0 ? 1000 : 1400,
  }));
}
