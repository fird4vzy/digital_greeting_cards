'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/**
 * A "beat" is one storytelling moment inside a card. Every section renders
 * exactly one, which is what gives cards a consistent rhythm regardless of
 * which template composed them.
 *
 * `full` beats occupy the viewport (svh, not vh — iOS Safari's collapsing
 * address bar makes vh jump mid-scroll and it is very visible on a card).
 */
export function Beat({
  children,
  className,
  innerClassName,
  full = false,
  tight = false,
  center = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  full?: boolean;
  tight?: boolean;
  center?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        'relative w-full px-[var(--spacing-gutter)]',
        full ? 'flex min-h-[100svh] flex-col justify-center py-20' : tight ? 'py-14 sm:py-20' : 'py-24 sm:py-32',
        className,
      )}
    >
      <div
        className={cn(
          'mx-auto w-full max-w-[42rem]',
          center && 'text-center',
          innerClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Thin animated line that tells the reader the story continues below. */
export function ScrollHint({ label = 'Scroll', className }: { label?: string; className?: string }) {
  const { reduced } = useMotionPrefs();

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <span className="eyebrow text-[var(--card-ink-muted)]">{label}</span>
      <span className="relative block h-12 w-px overflow-hidden bg-[var(--card-line)]">
        {!reduced ? (
          <motion.span
            className="absolute inset-x-0 top-0 block h-4 bg-[var(--card-accent)]"
            animate={{ y: ['-100%', '300%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.4 }}
          />
        ) : null}
      </span>
    </div>
  );
}

/** Section label used above titles inside a card. */
export function BeatLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'eyebrow mb-6 flex items-center gap-3 text-[var(--card-ink-muted)]',
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-[var(--card-line)]" />
      {children}
    </span>
  );
}
