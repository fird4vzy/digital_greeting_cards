'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Beat } from '@/components/cards/primitives/Beat';
import { Reveal } from '@/components/ui/Reveal';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import type { SectionOfKind } from '@/lib/card/schema';

/**
 * The one beat that asks instead of telling.
 *
 * Ported from a hand-written card whose whole joke is that "no" runs away from
 * the cursor. That is a real design decision and not a gimmick: the card is not
 * requesting a decision, it is performing one, and the running button says so
 * more plainly than any amount of copy could.
 *
 * **There is deliberately no path where they say no.** The `no` button cannot
 * be pressed on a pointer device, and where it can be pressed — a touchscreen,
 * where there is no hover to flee from — it simply moves on the first tap and
 * yields on the second. Nobody is trapped; the card just makes its preference
 * obvious.
 *
 * `plain` exists for a template that means the question sincerely.
 */
export function QuestionSection({ section }: { section: SectionOfKind<'question'> }) {
  const variant = section.variant ?? 'chase';
  const { reduced } = useMotionPrefs();
  const [answered, setAnswered] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dodges = useRef(0);

  const chase = variant === 'chase' && !reduced;

  const dodge = useCallback(() => {
    if (!chase) return;
    dodges.current += 1;

    // Bounded to its own beat rather than the window: a button that escapes to
    // the far corner of a long card is lost rather than playful, and on a
    // phone it would scroll the page chasing it.
    setOffset({
      x: (Math.random() - 0.5) * 260,
      y: (Math.random() - 0.5) * 120,
    });
  }, [chase]);

  /** Touch has no hover to flee from, so the second tap is allowed to land. */
  const handleNo = useCallback(() => {
    if (!chase || dodges.current >= 1) {
      setAnswered(true);
      return;
    }
    dodge();
  }, [chase, dodge]);

  return (
    <Beat innerClassName="max-w-[34rem] text-center">
      <Reveal preset="rise" as="h2" className="block">
        <span className="card-display block text-[clamp(2rem,1.4rem+2.6vw,3.25rem)] leading-[1.1] text-[var(--card-ink)]">
          {answered ? section.reply : section.question}
        </span>
      </Reveal>

      {!answered ? (
        <Reveal preset="fade" delay={0.3} className="mt-12 block">
          <div className="relative flex flex-wrap items-center justify-center gap-5">
            <button
              type="button"
              onClick={() => setAnswered(true)}
              className="rounded-full bg-[var(--card-accent)] px-9 py-3 text-body text-[var(--card-bg)] transition-transform duration-300 hover:scale-105"
            >
              {section.yes}
            </button>

            <motion.button
              type="button"
              onMouseEnter={dodge}
              onFocus={dodge}
              onClick={handleNo}
              animate={offset}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="rounded-full border border-[var(--card-line)] px-9 py-3 text-body text-[var(--card-ink-muted)]"
            >
              {section.no}
            </motion.button>
          </div>
        </Reveal>
      ) : null}
    </Beat>
  );
}
