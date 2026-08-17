'use client';

import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Beat } from '@/components/cards/primitives/Beat';
import { Reveal } from '@/components/ui/Reveal';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import type { SectionOfKind } from '@/lib/card/schema';

/**
 * A cake with candles that are still lit.
 *
 * The only beat with something to *do*. Everything before it in the card that
 * uses it is the run-up to this, and the payoff is small on purpose: the
 * flames go out one after another rather than together, because blowing out
 * candles is a thing that takes a breath and not a click.
 *
 * **Drawn, not loaded.** Cake, candles and flames are a few dozen SVG shapes
 * on the palette's own variables, so the beat costs nothing to download and
 * recolours with the template. An illustration would have been faster to make
 * and would have locked one cake into every card that ever used it.
 *
 * Reduced motion puts them out at once and skips the flicker. The wish still
 * happens; it just does not perform.
 */
export function CakeSection({ section }: { section: SectionOfKind<'cake'> }) {
  const { reduced } = useMotionPrefs();
  const [out, setOut] = useState<number>(0);
  const total = section.candles ?? 5;
  const done = out >= total;

  const blow = useCallback(() => {
    if (done) return;

    if (reduced) {
      setOut(total);
      return;
    }

    // One at a time, left to right, on a rhythm close to a real breath.
    for (let index = 1; index <= total; index += 1) {
      window.setTimeout(() => setOut(index), index * 180);
    }
  }, [done, reduced, total]);

  const positions = Array.from({ length: total }, (_, index) =>
    total === 1 ? 50 : 22 + (index * 56) / (total - 1),
  );

  return (
    <Beat innerClassName="max-w-[32rem] text-center">
      <Reveal preset="rise" as="h2" className="block">
        <span className="card-display block text-[clamp(1.75rem,1.3rem+2vw,2.75rem)] leading-[1.15] text-[var(--card-ink)]">
          {done ? section.reply : section.prompt}
        </span>
      </Reveal>

      <Reveal preset="fade" delay={0.25} className="mt-10 block">
        <button
          type="button"
          onClick={blow}
          disabled={done}
          aria-label={done ? section.reply : section.hint}
          className="mx-auto block w-full max-w-[19rem] cursor-pointer disabled:cursor-default"
        >
          <svg viewBox="0 0 100 92" className="w-full" role="img" aria-hidden="true">
            {positions.map((x, index) => {
              const lit = index >= out;
              return (
                <g key={index}>
                  {/* candle */}
                  <rect
                    x={x - 1.4}
                    y={30}
                    width={2.8}
                    height={16}
                    rx={1.2}
                    fill="var(--card-bg)"
                    stroke="var(--card-line)"
                    strokeWidth={0.6}
                  />
                  <line
                    x1={x}
                    y1={27}
                    x2={x}
                    y2={30}
                    stroke="var(--card-ink-muted)"
                    strokeWidth={0.7}
                  />

                  {/* flame — a teardrop, brightest at its base */}
                  <motion.ellipse
                    cx={x}
                    cy={23.5}
                    rx={2.1}
                    ry={3.6}
                    fill="var(--card-accent)"
                    initial={false}
                    animate={
                      lit
                        ? { opacity: 1, scaleY: reduced ? 1 : [1, 1.14, 0.95, 1] }
                        : { opacity: 0, scaleY: 0.4 }
                    }
                    transition={
                      lit && !reduced
                        ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }
                        : { duration: 0.35 }
                    }
                    style={{ transformOrigin: `${x}px 27px` }}
                  />

                  {/* the thread of smoke that replaces it */}
                  {!lit ? (
                    <motion.path
                      d={`M${x} 26 q -2.4 -4 0 -7.5 q 2.4 -3.5 0 -7`}
                      fill="none"
                      stroke="var(--card-ink-muted)"
                      strokeWidth={0.7}
                      strokeLinecap="round"
                      initial={{ opacity: 0, y: 2 }}
                      animate={{ opacity: [0, 0.55, 0], y: -10 }}
                      transition={{ duration: 2.2, ease: 'easeOut' }}
                    />
                  ) : null}
                </g>
              );
            })}

            {/* two tiers and a plate */}
            <rect x={18} y={46} width={64} height={18} rx={4} fill="var(--card-accent-soft)" />
            <rect x={12} y={62} width={76} height={20} rx={4} fill="var(--card-accent)" />
            <path
              d="M12 68 q 9 6 19 0 q 9 6 19 0 q 9 6 19 0 q 9 6 19 0"
              fill="none"
              stroke="var(--card-bg)"
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={0.75}
            />
            <rect x={6} y={82} width={88} height={3} rx={1.5} fill="var(--card-line)" />
          </svg>
        </button>
      </Reveal>

      {!done ? (
        <Reveal preset="fade" delay={0.5} className="block">
          <p className="mt-7 text-caption uppercase tracking-[0.2em] text-[var(--card-ink-muted)]">
            {section.hint}
          </p>
        </Reveal>
      ) : null}
    </Beat>
  );
}
