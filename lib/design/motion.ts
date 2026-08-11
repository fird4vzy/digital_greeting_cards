import type { Transition, Variants } from 'framer-motion';

/**
 * Animation principles
 * --------------------
 * 1. Motion explains the story, it never decorates. If a movement does not
 *    make the emotional beat land harder, it does not ship.
 * 2. Entrances rise and settle. Nothing bounces, nothing springs back.
 * 3. One easing family across the product: a long expo-out tail. Elements
 *    arrive fast and decelerate slowly — that's what reads as "expensive".
 * 4. Stagger is small (60–110ms). Big staggers feel like a slideshow.
 * 5. Reduced motion collapses distance and rotation to zero but keeps
 *    opacity, so the storytelling still sequences without vestibular load.
 */

export const easing = {
  /** Default entrance. Long, cinematic deceleration. */
  out: [0.16, 1, 0.3, 1],
  /** Camera-like moves, scroll-linked parallax. */
  cinematic: [0.22, 1, 0.36, 1],
  /** Bidirectional transitions (open/close, toggles). */
  soft: [0.65, 0, 0.35, 1],
  /** Rare, for weighted objects like an envelope flap. */
  weighted: [0.34, 1.2, 0.4, 1],
} as const;

export const duration = {
  quick: 0.35,
  base: 0.7,
  slow: 1.1,
  cinematic: 1.6,
} as const;

export const transitions = {
  base: { duration: duration.base, ease: easing.out },
  slow: { duration: duration.slow, ease: easing.out },
  cinematic: { duration: duration.cinematic, ease: easing.cinematic },
  quick: { duration: duration.quick, ease: easing.soft },
} satisfies Record<string, Transition>;

/** Viewport config shared by every scroll reveal — reveal once, slightly early. */
export const viewportOnce = { once: true, amount: 0.25, margin: '0px 0px -8% 0px' } as const;

type VariantFactory = (reduced?: boolean) => Variants;

/** The workhorse: content rises into place as it enters the viewport. */
export const fadeUp: VariantFactory = (reduced = false) => ({
  hidden: { opacity: 0, y: reduced ? 0 : 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0.3 : duration.base, ease: easing.out },
  },
});

/** For headlines: slower, longer travel, feels like a camera settling. */
export const riseIn: VariantFactory = (reduced = false) => ({
  hidden: { opacity: 0, y: reduced ? 0 : 42, filter: reduced ? 'none' : 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: reduced ? 0.3 : duration.slow, ease: easing.out },
  },
});

export const fadeIn: VariantFactory = (reduced = false) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: reduced ? 0.3 : duration.slow, ease: easing.out } },
});

/** Images: a slow scale-down settle reads as film, not as a CSS hover. */
export const settleImage: VariantFactory = (reduced = false) => ({
  hidden: { opacity: 0, scale: reduced ? 1 : 1.08 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: reduced ? 0.3 : duration.cinematic, ease: easing.cinematic },
  },
});

/** Editorial mask reveal — the line is uncovered rather than moved. */
export const maskReveal: VariantFactory = (reduced = false) => ({
  hidden: {
    opacity: reduced ? 0 : 1,
    clipPath: reduced ? 'inset(0 0 0% 0)' : 'inset(0 0 100% 0)',
  },
  show: {
    opacity: 1,
    clipPath: 'inset(0 0 -10% 0)',
    transition: { duration: reduced ? 0.3 : duration.slow, ease: easing.out },
  },
});

export const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Word-by-word headline reveal. Pair with `splitWords`. */
export const wordReveal: VariantFactory = (reduced = false) => ({
  hidden: { opacity: 0, y: reduced ? 0 : '0.6em' },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0.3 : 0.9, ease: easing.out },
  },
});

export function splitWords(text: string): string[] {
  return text.split(/(\s+)/).filter((chunk) => chunk.trim().length > 0);
}

/** Full-screen scene changes inside a published card. */
export const sceneTransition: VariantFactory = (reduced = false) => ({
  hidden: { opacity: 0, scale: reduced ? 1 : 1.02 },
  show: { opacity: 1, scale: 1, transition: { duration: reduced ? 0.3 : 1.0, ease: easing.cinematic } },
  exit: {
    opacity: 0,
    scale: reduced ? 1 : 0.99,
    transition: { duration: reduced ? 0.2 : 0.6, ease: easing.soft },
  },
});
