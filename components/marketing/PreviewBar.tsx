'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowGlyph } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

/**
 * The only chrome over a template preview.
 *
 * It hides while the reader is scrolling down — a preview is meant to be read
 * as a card, and a persistent toolbar breaks that — and comes back the moment
 * they scroll up or stop.
 */
export function PreviewBar({
  templateId,
  templateName,
  tagline,
  strings,
}: {
  templateId: string;
  templateName: string;
  tagline: string;
  strings: { back: string; preview: string; useThis: string };
}) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [last, setLast] = useState(0);

  useMotionValueEvent(scrollY, 'change', (value) => {
    setHidden(value > last && value > 220);
    setLast(value);
  });

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3"
      animate={{ y: hidden ? '-140%' : '0%', opacity: hidden ? 0 : 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={cn(
          'flex w-full max-w-[42rem] items-center gap-3 rounded-full border border-white/10',
          'bg-noir/80 px-3 py-2 pl-5 text-paper shadow-[var(--shadow-float)] backdrop-blur-xl sm:gap-5',
        )}
      >
        <Link
          href="/templates"
          className="shrink-0 text-paper/50 transition-colors hover:text-paper"
          aria-label={strings.back}
        >
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4">
            <path
              d="M14 8H3M7 4L3 8l4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[1.05rem] leading-tight">{templateName}</p>
          <p className="hidden truncate text-[0.75rem] text-paper/50 sm:block">{tagline}</p>
        </div>

        <span className="eyebrow hidden shrink-0 text-paper/35 md:block">{strings.preview}</span>

        <Link
          href={`/create?template=${templateId}`}
          className="group inline-flex h-9 shrink-0 items-center gap-2 rounded-full bg-paper px-4 text-[0.8125rem] font-medium text-ink transition-colors duration-400 hover:bg-white"
        >
          {strings.useThis}
          <ArrowGlyph />
        </Link>
      </div>
    </motion.div>
  );
}
