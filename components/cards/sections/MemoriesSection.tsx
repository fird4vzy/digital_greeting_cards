'use client';

import { Beat, BeatLabel } from '@/components/cards/primitives/Beat';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import type { SectionOfKind } from '@/lib/card/schema';

/**
 * The small, specific things — the details that prove the card was written by
 * a person who was paying attention. Deliberately short-form: a label and a
 * line, never a paragraph.
 */
export function MemoriesSection({ section }: { section: SectionOfKind<'memories'> }) {
  const variant = section.variant ?? 'notes';
  const items = section.items ?? [];
  if (items.length === 0) return null;

  return (
    <Beat innerClassName={variant === 'chips' ? 'max-w-[44rem]' : 'max-w-[38rem]'}>
      {section.title ? (
        <Reveal preset="fade">
          <BeatLabel>{section.title}</BeatLabel>
        </Reveal>
      ) : null}

      {variant === 'chips' ? (
        <RevealGroup step={0.06} className="mt-8 flex flex-wrap gap-2.5">
          {items.map((item) => (
            <Reveal key={item.id} preset="fade">
              <span className="inline-flex flex-col gap-1 rounded-full border border-[var(--card-line)] px-5 py-3">
                <span className="eyebrow text-[var(--card-ink-muted)]">{item.label}</span>
                <span className="text-caption text-[var(--card-ink)]">{item.text}</span>
              </span>
            </Reveal>
          ))}
        </RevealGroup>
      ) : (
        <RevealGroup step={0.09} className="mt-8 grid gap-px overflow-hidden bg-[var(--card-line)] sm:grid-cols-2">
          {items.map((item) => (
            <Reveal
              key={item.id}
              preset="fade"
              className="bg-[var(--card-bg)] p-6 sm:p-7"
            >
              <span className="eyebrow block text-[var(--card-accent)]">{item.label}</span>
              <p className="card-display mt-3 text-[1.2rem] leading-snug text-[var(--card-ink)]">
                {item.text}
              </p>
            </Reveal>
          ))}
        </RevealGroup>
      )}
    </Beat>
  );
}
