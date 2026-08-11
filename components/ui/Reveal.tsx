'use client';

import { motion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { fadeUp, maskReveal, riseIn, settleImage, splitWords, stagger, viewportOnce, wordReveal } from '@/lib/design/motion';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { cn } from '@/lib/utils/cn';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** `rise` is the slower headline treatment; `fade` is for body content. */
  preset?: 'fade' | 'rise' | 'mask' | 'image';
  delay?: number;
  as?: ElementType;
  /** Opt out of scroll triggering — animate as soon as it mounts. */
  immediate?: boolean;
};

const presets = { fade: fadeUp, rise: riseIn, mask: maskReveal, image: settleImage };

export function Reveal({
  children,
  className,
  preset = 'fade',
  delay = 0,
  as = 'div',
  immediate = false,
}: RevealProps) {
  const { reduced } = useMotionPrefs();
  const MotionTag = motion[as as 'div'] ?? motion.div;
  const variants = presets[preset](reduced);

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      {...(immediate
        ? { animate: 'show' }
        : { whileInView: 'show', viewport: viewportOnce })}
      transition={{ delay: reduced ? 0 : delay }}
    >
      {children}
    </MotionTag>
  );
}

/** Wraps a set of `<Reveal>` children so they arrive in sequence. */
export function RevealGroup({
  children,
  className,
  delay = 0,
  step = 0.08,
  immediate = false,
  as = 'div',
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  step?: number;
  immediate?: boolean;
  as?: ElementType;
}) {
  const { reduced } = useMotionPrefs();
  const MotionTag = motion[as as 'div'] ?? motion.div;

  return (
    <MotionTag
      className={className}
      variants={stagger(reduced ? 0 : delay, reduced ? 0.03 : step)}
      initial="hidden"
      {...(immediate ? { animate: 'show' } : { whileInView: 'show', viewport: viewportOnce })}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Headline reveal, word by word. Words animate inside an overflow-hidden line
 * box so they appear to rise from behind the baseline rather than fade in.
 */
export function WordReveal({
  text,
  className,
  delay = 0,
  step = 0.055,
  as: Tag = 'h2',
  immediate = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  step?: number;
  as?: ElementType;
  immediate?: boolean;
}) {
  const { reduced } = useMotionPrefs();
  const words = splitWords(text);
  const variants = wordReveal(reduced);
  // `ElementType` widens to a union whose props collapse to `never`; the cast
  // narrows it back to a plain intrinsic element for the JSX call.
  const Element = Tag as 'h2';

  return (
    <Element className={className}>
      <motion.span
        className="inline"
        variants={stagger(reduced ? 0 : delay, reduced ? 0.02 : step)}
        initial="hidden"
        {...(immediate ? { animate: 'show' } : { whileInView: 'show', viewport: viewportOnce })}
        aria-label={text}
      >
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="inline-block overflow-hidden align-bottom"
            aria-hidden="true"
          >
            <motion.span className="inline-block" variants={variants}>
              {word}
            </motion.span>
            {index < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
          </span>
        ))}
      </motion.span>
    </Element>
  );
}

/** Small uppercase label that sits above section headlines. */
export function Eyebrow({
  children,
  className,
  tone = 'muted',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'muted' | 'accent' | 'inverse';
}) {
  return (
    <span
      className={cn(
        'eyebrow inline-flex items-center gap-2.5',
        tone === 'muted' && 'text-ink-muted',
        tone === 'accent' && 'text-accent',
        tone === 'inverse' && 'text-paper/55',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-px w-6',
          tone === 'inverse' ? 'bg-paper/30' : 'bg-current opacity-40',
        )}
      />
      {children}
    </span>
  );
}
