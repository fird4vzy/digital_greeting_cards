'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ArrowGlyph, Button } from '@/components/ui/Button';
import { easing } from '@/lib/design/motion';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { cn } from '@/lib/utils/cn';

/**
 * The frame every step of the creation flow renders inside.
 *
 * One question per screen, set large, with the controls at the bottom — the
 * shape of a conversation rather than a form. The step number is small and the
 * question is enormous, which is the whole difference between "filling in a
 * builder" and "being asked something".
 */
export function StepShell({
  index,
  total,
  eyebrow,
  question,
  hint,
  children,
  onBack,
  onNext,
  nextLabel = 'Continue',
  canContinue = true,
  skip,
}: {
  index: number;
  total: number;
  eyebrow: string;
  question: string;
  hint?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  canContinue?: boolean;
  skip?: { label: string; onSkip: () => void };
}) {
  const { reduced } = useMotionPrefs();

  return (
    <motion.section
      className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col px-[var(--spacing-gutter)] pb-32 pt-28 sm:pt-32"
      initial={{ opacity: 0, y: reduced ? 0 : 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: reduced ? 0 : -12 }}
      transition={{ duration: reduced ? 0.2 : 0.55, ease: easing.out }}
    >
      <span className="eyebrow flex items-center gap-3 text-ink-muted">
        <span aria-hidden="true" className="h-px w-7 bg-accent/60" />
        {eyebrow}
      </span>

      <h1 className="mt-6 font-display text-[clamp(2rem,1.5rem+2.4vw,3.15rem)] leading-[1.04] tracking-[-0.03em] text-ink">
        {question}
      </h1>

      {hint ? <p className="mt-4 max-w-[46ch] text-body text-ink-soft">{hint}</p> : null}

      <div className="mt-12 flex-1">{children}</div>

      <div className="mt-14 flex flex-wrap items-center gap-3">
        {onBack ? (
          <Button variant="ghost" onClick={onBack} className="-ml-2">
            Back
          </Button>
        ) : null}

        <div className="ml-auto flex items-center gap-3">
          {skip ? (
            <Button variant="ghost" onClick={skip.onSkip}>
              {skip.label}
            </Button>
          ) : null}
          {onNext ? (
            <Button onClick={onNext} disabled={!canContinue} size="lg">
              {nextLabel}
              <ArrowGlyph />
            </Button>
          ) : null}
        </div>
      </div>

      <p className="mt-6 text-caption text-ink-faint">
        Step {index + 1} of {total}
      </p>
    </motion.section>
  );
}

/** The progress rail pinned under the header. */
export function StepProgress({ index, total }: { index: number; total: number }) {
  return (
    <div
      className="fixed inset-x-0 top-[4.5rem] z-40 flex h-[2px] bg-line"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={index + 1}
    >
      <motion.span
        className="block h-full bg-accent"
        animate={{ width: `${((index + 1) / total) * 100}%` }}
        transition={{ duration: 0.6, ease: easing.out }}
      />
    </div>
  );
}

/** A selectable option. Used for recipients, occasions, moods and templates. */
export function Choice({
  selected,
  onSelect,
  title,
  line,
  className,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  line?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'group relative rounded-[1rem] border p-5 text-left transition-all duration-500 ease-[var(--ease-out-expo)]',
        selected
          ? 'border-ink bg-ink text-paper shadow-[var(--shadow-float)]'
          : 'border-line-strong bg-white/50 text-ink hover:border-ink hover:bg-white',
        className,
      )}
    >
      <span className="block font-display text-[1.3rem] leading-none">{title}</span>
      {line ? (
        <span
          className={cn(
            'mt-2.5 block text-caption leading-snug',
            selected ? 'text-paper/60' : 'text-ink-muted',
          )}
        >
          {line}
        </span>
      ) : null}
    </button>
  );
}
