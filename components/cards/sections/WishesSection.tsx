'use client';

import { Beat, BeatLabel } from '@/components/cards/primitives/Beat';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import type { SectionOfKind } from '@/lib/card/schema';

/**
 * A wish list, revealed one line at a time. Numbered in a hairline column so
 * it reads like a printed programme rather than a bulleted list.
 */
export function WishesSection({ section }: { section: SectionOfKind<'wishes'> }) {
  const items = section.items ?? [];
  if (items.length === 0) return null;

  return (
    <Beat innerClassName="max-w-[34rem]">
      {section.title ? (
        <Reveal preset="fade">
          <BeatLabel>{section.title}</BeatLabel>
        </Reveal>
      ) : null}

      <RevealGroup step={0.13} className="mt-8">
        <ol className="divide-y divide-[var(--card-line)]">
          {items.map((item, index) => (
            <Reveal key={index} preset="fade" as="li" className="flex items-baseline gap-6 py-5">
              <span className="eyebrow shrink-0 text-[var(--card-accent)] tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="card-display text-[1.35rem] leading-snug text-[var(--card-ink)]">
                {item}
              </span>
            </Reveal>
          ))}
        </ol>
      </RevealGroup>
    </Beat>
  );
}
