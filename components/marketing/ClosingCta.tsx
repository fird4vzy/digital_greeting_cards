'use client';

import { Atmosphere } from '@/components/three/Atmosphere';
import { ArrowGlyph, ButtonLink } from '@/components/ui/Button';
import { Reveal, WordReveal } from '@/components/ui/Reveal';
import type { Dictionary } from '@/lib/i18n/types';

const NIGHT_PARTICLES = ['#e7c9c6', '#a33b48', '#c1836a'];

/**
 * The last screen. One line, one action, and the petals that opened the page
 * drifting back through — the visual rhyme that closes the story.
 */
export function ClosingCta({ strings }: { strings: Dictionary['ui']['closing'] }) {
  return (
    <section className="grain grain-invert relative flex min-h-[88svh] items-center justify-center overflow-hidden bg-noir px-[var(--spacing-gutter)] py-[var(--spacing-section)] text-center">
      <Atmosphere scene="petals" colors={NIGHT_PARTICLES} className="absolute inset-0" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[100vmin] w-[100vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(163,59,72,0.3) 0%, transparent 62%)' }}
      />

      <div className="relative mx-auto max-w-[46rem]">
        <WordReveal
          as="h2"
          text={strings.title}
          step={0.07}
          className="font-display text-display leading-[0.98] tracking-[-0.035em] text-paper"
        />

        <Reveal preset="fade" delay={0.3}>
          <p className="mx-auto mt-8 max-w-[38ch] text-body-lg text-pretty text-paper/60">
            {strings.promise}
          </p>
        </Reveal>

        <Reveal preset="fade" delay={0.45}>
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <ButtonLink href="/create" variant="inverse" size="lg">
              {strings.ctaPrimary}
              <ArrowGlyph />
            </ButtonLink>
            <ButtonLink
              href="/c/8FJ29K"
              variant="ghost"
              size="lg"
              className="text-paper/70 hover:text-paper"
            >
              {strings.ctaSecondary}
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
