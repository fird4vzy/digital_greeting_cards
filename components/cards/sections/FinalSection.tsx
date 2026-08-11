'use client';

import { Reveal, WordReveal } from '@/components/ui/Reveal';
import { Atmosphere } from '@/components/three/Atmosphere';
import type { SectionOfKind } from '@/lib/card/schema';
import type { SceneId } from '@/lib/card/template';

/**
 * The last full message. Everything before this has been building to one
 * sentence, so it gets the whole screen, the atmosphere returns, and nothing
 * else competes with it.
 */
export function FinalSection({
  section,
  scene,
}: {
  section: SectionOfKind<'final'>;
  scene: SceneId;
}) {
  const variant = section.variant ?? 'fade';

  return (
    <section className="relative flex min-h-[100svh] w-full flex-col items-center justify-center overflow-hidden px-[var(--spacing-gutter)] py-24 text-center">
      {variant === 'bloom' ? (
        <>
          <Atmosphere scene={scene} className="absolute inset-0" intensity="soft" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[110vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle, var(--card-glow) 0%, transparent 60%)' }}
          />
        </>
      ) : null}

      <div className="relative mx-auto w-full max-w-[34rem]">
        <WordReveal
          as="h2"
          text={section.headline}
          step={0.06}
          className="card-display text-[clamp(1.9rem,1.2rem+3vw,3.25rem)] leading-[1.14] tracking-[-0.025em] text-[var(--card-ink)]"
        />

        {section.text ? (
          <Reveal preset="fade" delay={0.35}>
            <p className="mt-7 text-body-lg text-[var(--card-ink-soft)]">{section.text}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
