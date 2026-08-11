import type { CSSProperties } from 'react';

/**
 * A card palette is the entire visual identity of a template, expressed as
 * data. Section components never hard-code a colour — they read these custom
 * properties off the `.card-scope` wrapper. Adding a template with a brand new
 * look therefore costs one palette object, not a stylesheet.
 */
export type CardPalette = {
  id: string;
  name: string;
  /** Drives whether overlays, canvases and browser UI go light or dark. */
  scheme: 'light' | 'dark';
  bg: string;
  /** Deeper companion surface used for cinematic full-bleed moments. */
  bgDeep: string;
  ink: string;
  inkSoft: string;
  inkMuted: string;
  accent: string;
  accentSoft: string;
  /** Radial atmosphere colour behind hero content and 3D scenes. */
  glow: string;
  line: string;
  /** Petal / particle colours handed to the 3D layer. */
  particles: [string, string, string];
  /** Shown in the template gallery as the palette chips. */
  swatches: string[];
};

export const palettes = {
  /** Romantic — dusk rose over deep wine. Candlelight, not Valentine's Day. */
  duskRose: {
    id: 'duskRose',
    name: 'Dusk Rose',
    scheme: 'dark',
    bg: '#17090f',
    bgDeep: '#0c0508',
    ink: '#f6ece9',
    inkSoft: '#d8bdb8',
    inkMuted: '#9c7d7a',
    accent: '#d97f7f',
    accentSoft: '#f0c9c2',
    glow: 'rgba(190, 92, 92, 0.34)',
    line: 'rgba(246, 236, 233, 0.14)',
    particles: ['#e79a9a', '#c96b74', '#f3cfc6'],
    swatches: ['#17090f', '#7d2833', '#d97f7f', '#f0c9c2'],
  },

  /** Birthday — warm champagne and ink. Celebratory without confetti clichés. */
  champagne: {
    id: 'champagne',
    name: 'Champagne',
    scheme: 'light',
    bg: '#f8f2e8',
    bgDeep: '#efe2cc',
    ink: '#20180f',
    inkSoft: '#584634',
    inkMuted: '#94806a',
    accent: '#c2833c',
    accentSoft: '#f0dcbd',
    glow: 'rgba(214, 165, 92, 0.3)',
    line: 'rgba(32, 24, 15, 0.12)',
    particles: ['#e7bd7c', '#c98f4b', '#f5e3c4'],
    swatches: ['#f8f2e8', '#c2833c', '#e7bd7c', '#20180f'],
  },

  /** For Mom — soft linen, sage and apricot. Calm, generous, homely. */
  linen: {
    id: 'linen',
    name: 'Warm Linen',
    scheme: 'light',
    bg: '#f7f4ee',
    bgDeep: '#e8e3d6',
    ink: '#1f1d18',
    inkSoft: '#524d42',
    inkMuted: '#8b8578',
    accent: '#b2724f',
    accentSoft: '#ecd9c8',
    glow: 'rgba(178, 114, 79, 0.22)',
    line: 'rgba(31, 29, 24, 0.11)',
    particles: ['#e3b894', '#c58f6a', '#f2e4d4'],
    swatches: ['#f7f4ee', '#b2724f', '#7f8b73', '#ecd9c8'],
  },

  /** Anniversary — midnight and brass. Formal, architectural, timeless. */
  midnightBrass: {
    id: 'midnightBrass',
    name: 'Midnight & Brass',
    scheme: 'dark',
    bg: '#0f1418',
    bgDeep: '#080b0e',
    ink: '#eef0ee',
    inkSoft: '#b9c0c0',
    inkMuted: '#7d8688',
    accent: '#c2a06a',
    accentSoft: '#e8d6b4',
    glow: 'rgba(194, 160, 106, 0.24)',
    line: 'rgba(238, 240, 238, 0.14)',
    particles: ['#d8bd8b', '#a8874f', '#f0e3c8'],
    swatches: ['#0f1418', '#c2a06a', '#e8d6b4', '#eef0ee'],
  },

  /** Memories — archival paper and faded photograph blues. */
  archive: {
    id: 'archive',
    name: 'Archive',
    scheme: 'light',
    bg: '#f4f2ed',
    bgDeep: '#e2ded4',
    ink: '#1b1a18',
    inkSoft: '#4e4b45',
    inkMuted: '#8a867d',
    accent: '#5b6d7a',
    accentSoft: '#d6dde1',
    glow: 'rgba(91, 109, 122, 0.2)',
    line: 'rgba(27, 26, 24, 0.1)',
    particles: ['#c2cdd4', '#8fa3ad', '#e6ebee'],
    swatches: ['#f4f2ed', '#5b6d7a', '#d6dde1', '#1b1a18'],
  },

  /** Sakura — washi paper, sumi ink, one branch of blossom. */
  washi: {
    id: 'washi',
    name: 'Washi & Sumi',
    scheme: 'light',
    bg: '#f5f2ee',
    bgDeep: '#e7e0d8',
    ink: '#1a1a1a',
    inkSoft: '#4d4a47',
    inkMuted: '#8e8983',
    accent: '#c98a97',
    accentSoft: '#f0dcdf',
    glow: 'rgba(201, 138, 151, 0.2)',
    line: 'rgba(26, 26, 26, 0.1)',
    particles: ['#f4cdd6', '#dda3b1', '#fdeef1'],
    swatches: ['#f5f2ee', '#c98a97', '#f0dcdf', '#1a1a1a'],
  },
} as const satisfies Record<string, CardPalette>;

export type PaletteId = keyof typeof palettes;

export function getPalette(id: string): CardPalette {
  return palettes[id as PaletteId] ?? palettes.duskRose;
}

/**
 * Colour sets for generated imagery.
 *
 * `photoColors` reads as a well-exposed photograph — mid-tones and highlights,
 * used wherever a real customer photo will eventually sit. `moodyColors` sits
 * a stop or two under, for the full-bleed cards that carry white type.
 */
export function photoColors(palette: CardPalette): string[] {
  return [palette.accent, palette.accentSoft, palette.particles[0], palette.particles[2]];
}

export function moodyColors(palette: CardPalette): string[] {
  return [palette.bgDeep, palette.accent, palette.accentSoft, palette.particles[0]];
}

/**
 * Turns a palette into the custom properties consumed by `.card-scope`.
 * Cast is required because React's CSSProperties does not model custom props.
 */
export function paletteVars(palette: CardPalette): CSSProperties {
  return {
    '--card-bg': palette.bg,
    '--card-bg-deep': palette.bgDeep,
    '--card-ink': palette.ink,
    '--card-ink-soft': palette.inkSoft,
    '--card-ink-muted': palette.inkMuted,
    '--card-accent': palette.accent,
    '--card-accent-soft': palette.accentSoft,
    '--card-glow': palette.glow,
    '--card-line': palette.line,
    // The 3D layer reads its colours back off the DOM rather than importing
    // the palette, so a scene never needs to know which template mounted it.
    '--card-particle-1': palette.particles[0],
    '--card-particle-2': palette.particles[1],
    '--card-particle-3': palette.particles[2],
  } as CSSProperties;
}
