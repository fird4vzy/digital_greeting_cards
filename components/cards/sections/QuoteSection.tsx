'use client';

import { Beat } from '@/components/cards/primitives/Beat';
import { Reveal, WordReveal } from '@/components/ui/Reveal';
import type { SectionOfKind } from '@/lib/card/schema';
import { cn } from '@/lib/utils/cn';

/** A pull quote. One line, set big, given a whole screen to itself. */
export function QuoteSection({ section }: { section: SectionOfKind<'quote'> }) {
  const variant = section.variant ?? 'centered';

  return (
    <Beat full center={variant === 'centered'} innerClassName="max-w-[36rem]">
      {variant === 'rule' ? (
        <Reveal preset="fade">
          <span aria-hidden="true" className="mb-10 block h-px w-24 bg-[var(--card-accent)]" />
        </Reveal>
      ) : null}

      <blockquote>
        <WordReveal
          as="p"
          text={`“${section.text}”`}
          step={0.05}
          className={cn(
            'card-display italic leading-[1.28] tracking-[-0.015em] text-[var(--card-ink)]',
            'text-[clamp(1.65rem,1.15rem+2.2vw,2.6rem)]',
          )}
        />
        {section.attribution ? (
          <Reveal preset="fade" delay={0.2}>
            <footer
              className={cn(
                'eyebrow mt-8 text-[var(--card-ink-muted)]',
                variant === 'centered' && 'flex justify-center',
              )}
            >
              {section.attribution}
            </footer>
          </Reveal>
        ) : null}
      </blockquote>
    </Beat>
  );
}
