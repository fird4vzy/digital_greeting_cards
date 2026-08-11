'use client';

import { Beat, BeatLabel } from '@/components/cards/primitives/Beat';
import { Reveal, WordReveal } from '@/components/ui/Reveal';
import type { SectionOfKind } from '@/lib/card/schema';
import { cn } from '@/lib/utils/cn';

/**
 * A single framing sentence between the cover and the letter. Its only job is
 * to slow the reader down before the personal writing starts.
 */
export function IntroSection({ section }: { section: SectionOfKind<'intro'> }) {
  const variant = section.variant ?? 'centered';

  return (
    <Beat
      full
      center={variant === 'centered'}
      innerClassName={cn(variant === 'offset' && 'max-w-[34rem] sm:ml-[8%]')}
    >
      {section.eyebrow ? (
        <Reveal preset="fade">
          <BeatLabel className={cn(variant === 'centered' && 'justify-center')}>
            {section.eyebrow}
          </BeatLabel>
        </Reveal>
      ) : null}

      <WordReveal
        as="p"
        text={section.text}
        className="card-display text-display-sm leading-[1.18] tracking-[-0.02em] text-[var(--card-ink)]"
      />
    </Beat>
  );
}
