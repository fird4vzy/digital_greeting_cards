'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Atmosphere } from '@/components/three/Atmosphere';
import { ArrowGlyph, ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { easing } from '@/lib/design/motion';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/** Warm brand particles — the marketing surface is not inside a card scope. */
const BRAND_PARTICLES = ['#e7c9c6', '#c1836a', '#efe7db'];

/**
 * The first screen.
 *
 * Asymmetric on purpose: the headline sits left of centre and the flower
 * occupies the right, so the composition reads as a spread rather than a
 * centred landing page. The only scroll-linked motion is a slow parallax
 * drift on the scene — enough to feel alive, not enough to notice.
 */
export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  // Deliberately not framer's `useReducedMotion`: it reads the media query
  // synchronously, so the server renders the animated tree and the client
  // renders the static one, and React throws a hydration mismatch. Ours starts
  // false everywhere and upgrades after mount.
  const { reduced } = useMotionPrefs();

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '14%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-6%']);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, reduced ? 1 : 0.2]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden pt-[4.5rem]"
    >
      {/* Ambient 3D. Right-weighted on desktop; on phones it sits behind the
          headline at low opacity, where it reads as a floral wash rather than
          as an object competing with the type. */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 right-0 w-full lg:w-[54%]"
        style={{ y: sceneY, opacity: fade }}
      >
        {/* Inner wrapper carries the responsive opacity — the motion value on
            the parent owns `opacity` and would overwrite a utility class. */}
        <div className="absolute inset-0 opacity-40 lg:opacity-100">
          <Atmosphere scene="bloom" colors={BRAND_PARTICLES} priority className="absolute inset-0" />
        </div>
      </motion.div>

      {/* Paper wash so type stays readable over the scene. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/70 via-paper/80 to-paper lg:bg-gradient-to-r lg:from-paper lg:via-paper/70 lg:to-transparent"
      />

      <motion.div
        style={{ y: contentY }}
        className="relative mx-auto grid w-full max-w-[86rem] grid-cols-1 items-center gap-16 px-[var(--spacing-gutter)] py-24 lg:grid-cols-[1.05fr_0.95fr]"
      >
        <div className="max-w-[36rem]">
          <Reveal preset="fade" immediate>
            <span className="eyebrow inline-flex items-center gap-2.5 text-ink-muted">
              <span aria-hidden="true" className="h-px w-7 bg-accent/60" />
              A digital card for a real bouquet
            </span>
          </Reveal>

          <h1 className="mt-8 font-display text-display leading-[0.96] tracking-[-0.03em] text-ink">
            <HeroLine text="Some feelings" delay={0.15} />
            <HeroLine text="deserve more" delay={0.28} />
            <HeroLine text="than a message." delay={0.41} italic />
          </h1>

          <Reveal preset="fade" immediate delay={0.75}>
            <p className="mt-8 max-w-[34ch] text-body-lg text-pretty text-ink-soft">
              Create a little digital world for someone special.
            </p>
          </Reveal>

          <Reveal preset="fade" immediate delay={0.9}>
            <div className="mt-11 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <ButtonLink href="/create" size="lg">
                Create something beautiful
                <ArrowGlyph />
              </ButtonLink>
              <ButtonLink href="/templates" variant="secondary" size="lg">
                Explore templates
              </ButtonLink>
            </div>
          </Reveal>
        </div>

        {/* Spacer column: the scene lives behind it. On mobile it collapses. */}
        <div aria-hidden="true" className="hidden lg:block lg:h-[32rem]" />
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-8 flex justify-center lg:justify-start lg:pl-[var(--spacing-gutter)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.6, duration: 1 }}
        style={{ opacity: fade }}
      >
        <span className="eyebrow flex items-center gap-3 text-ink-faint">
          <span aria-hidden="true" className="relative block h-8 w-px overflow-hidden bg-line-strong">
            {!reduced ? (
              <motion.span
                className="absolute inset-x-0 top-0 block h-3 bg-accent"
                animate={{ y: ['-100%', '300%'] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
              />
            ) : null}
          </span>
          Scroll
        </span>
      </motion.div>
    </section>
  );
}

/** One headline line, revealed from behind its own baseline. */
function HeroLine({ text, delay, italic }: { text: string; delay: number; italic?: boolean }) {
  const { reduced } = useMotionPrefs();

  return (
    <span className="block overflow-hidden">
      <motion.span
        className={italic ? 'block italic' : 'block'}
        initial={{ y: reduced ? 0 : '105%', opacity: reduced ? 0 : 1 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: reduced ? 0.3 : 1.15, delay: reduced ? 0 : delay, ease: easing.out }}
      >
        {text}
      </motion.span>
    </span>
  );
}
