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
  const blobs = Array.from({ length: 5 }, (_, index) => {
    const cx = Math.round(random() * width);
    const cy = Math.round(random() * height);
    const r = Math.round((0.28 + random() * 0.42) * Math.min(width, height));
    const fill = colors[index % colors.length];
    const opacity = (0.45 + random() * 0.45).toFixed(2);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`;
  }).join('');

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
    `<defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%">` +
    `<feGaussianBlur stdDeviation="${Math.round(Math.min(width, height) * 0.11)}"/></filter>` +
    `<linearGradient id="v" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0%" stop-color="#000" stop-opacity="0.06"/>` +
    `<stop offset="100%" stop-color="#000" stop-opacity="0.28"/></linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="${colors[0]}"/>` +
    `<g filter="url(#b)">${blobs}</g>` +
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
