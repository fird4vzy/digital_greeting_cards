'use client';

import { Beat } from '@/components/cards/primitives/Beat';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { paragraphs, type SectionOfKind } from '@/lib/card/schema';
import { cn } from '@/lib/utils/cn';

/**
 * The letter — the reason the product exists.
 *
 * Paragraphs are revealed individually as the reader scrolls, which turns a
 * wall of text into a paced reading experience. The measure is held under
 * ~40 characters on mobile: long lines are the fastest way to make writing
 * feel like a terms-of-service page.
 */
export function LetterSection({ section }: { section: SectionOfKind<'letter'> }) {
  const variant = section.variant ?? 'serif';
  const blocks = paragraphs(section.body);

  const bodyClass = cn(
    'text-pretty',
    variant === 'handwritten'
      ? 'card-display text-[clamp(1.35rem,1.05rem+1.2vw,1.75rem)] leading-[1.62] tracking-[-0.01em]'
      : 'font-sans text-body-lg leading-[1.85]',
    variant === 'washi' && 'text-[0.98rem] leading-[2.05] tracking-[0.01em]',
  );

  return (
    <Beat
      innerClassName={cn(
        'max-w-[36rem]',
        variant === 'washi' && 'max-w-[32rem] sm:ml-[10%] border-l border-[var(--card-line)] pl-7 sm:pl-10',
      )}
    >
      {section.salutation ? (
        <Reveal preset="fade">
          <p className="card-display mb-8 text-title text-[var(--card-ink)]">{section.salutation}</p>
        </Reveal>
      ) : null}

      <RevealGroup step={0.14} className="space-y-7 text-[var(--card-ink-soft)]">
        {blocks.map((block, index) => (
          <Reveal key={index} preset="fade" as="p" className={bodyClass}>
            {/* A drop cap on the opening paragraph, but only when the letter
                is long enough to carry one — otherwise it looks affected. */}
            {variant === 'serif' && index === 0 && blocks.length > 1 ? (
              <>
                <span
                  aria-hidden="true"
                  className="card-display float-left mr-3 mt-[0.14em] text-[3.4em] leading-[0.78] text-[var(--card-accent)]"
                >
                  {block.charAt(0)}
                </span>
                {block.slice(1)}
              </>
            ) : (
              block
            )}
          </Reveal>
        ))}
      </RevealGroup>

      {section.signature ? (
        <Reveal preset="fade" delay={0.15}>
          <p className="card-display mt-12 text-title italic text-[var(--card-ink)]">
            {section.signature}
          </p>
        </Reveal>
      ) : null}
    </Beat>
  );
}
