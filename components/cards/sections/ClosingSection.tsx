'use client';

import { motion } from 'framer-motion';
import { Blossom } from '@/components/cards/primitives/Motif';
import { Reveal } from '@/components/ui/Reveal';
import { easing, viewportOnce } from '@/lib/design/motion';
import type { SectionOfKind } from '@/lib/card/schema';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/**
 * The signature, and the closing animation.
 *
 * The seal variant stamps: a blossom scales down and settles, the way a wax
 * seal is pressed. It is the last thing that moves in the entire card, so it
 * is allowed to be a little theatrical.
 */
export function ClosingSection({ section }: { section: SectionOfKind<'closing'> }) {
  const variant = section.variant ?? 'signature';
  const { reduced } = useMotionPrefs();

  return (
    <section className="relative flex min-h-[86svh] w-full flex-col items-center justify-center gap-10 px-[var(--spacing-gutter)] py-24 text-center">
      <Reveal preset="fade">
        <p className="eyebrow text-[var(--card-ink-muted)]">{section.signOff}</p>
      </Reveal>

      <Reveal preset="rise" delay={0.15}>
        <p className="card-display text-[clamp(2.4rem,1.6rem+3.6vw,4rem)] leading-none tracking-[-0.03em] text-[var(--card-ink)]">
          {section.from}
        </p>
      </Reveal>

      <motion.div
        aria-hidden="true"
        className="text-[var(--card-accent)]"
        initial={
          reduced
            ? { opacity: 0 }
            : { opacity: 0, scale: variant === 'seal' ? 2.6 : 0.6, rotate: variant === 'seal' ? -30 : 0 }
        }
        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
        viewport={viewportOnce}
        transition={{
          duration: reduced ? 0.3 : variant === 'seal' ? 0.85 : 1.1,
          delay: reduced ? 0 : 0.45,
          ease: variant === 'seal' ? easing.weighted : easing.out,
        }}
      >
        <Blossom className="h-8 w-8" />
      </motion.div>

      {section.note ? (
        <Reveal preset="fade" delay={0.6}>
          <p className="max-w-[26ch] text-caption text-[var(--card-ink-muted)]">{section.note}</p>
        </Reveal>
      ) : null}
    </section>
  );
}
