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

  /**
   * `lines` reveals one *line* at a time, not one paragraph.
   *
   * Ported from the hand-written card, where it is thirty-six `nth-child`
   * rules each nudging the delay along — which works exactly once, for a letter
   * of exactly that length. Here the stagger is an index on a custom property,
   * so it fits a letter of any length and a letter nobody has written yet.
   *
   * Each line resolves out of a blur rather than merely fading. That is the
   * detail that makes the beat feel like remembering rather than loading, and
   * it is the one thing worth keeping from the original's timing.
   */
  if (variant === 'lines') {
    const lines = section.body
      .split('\n')
      .map((line) => line.trim())
      .filter((line, index, all) => line.length > 0 || all[index - 1]?.length > 0);

    return (
      <Beat innerClassName="max-w-[34rem]">
        <RevealGroup step={0} className="text-[var(--card-ink-soft)]">
          {lines.map((line, index) =>
            line.length === 0 ? (
              <span key={index} aria-hidden="true" className="block h-[0.9em]" />
            ) : (
              <Reveal
                key={index}
                preset="focus"
                as="p"
                delay={index * 0.14}
                className="card-display mb-[0.28em] text-[clamp(1.375rem,1rem+1.6vw,1.95rem)] leading-[1.5]"
              >
                {line}
              </Reveal>
            ),
          )}
        </RevealGroup>

        {section.signature ? (
          <Reveal preset="fade" delay={lines.length * 0.14 + 0.2}>
            <p className="card-display mt-12 text-title italic text-[var(--card-ink)]">
              {section.signature}
            </p>
          </Reveal>
        ) : null}
      </Beat>
    );
  }

  // A drop cap needs a paragraph deep enough for the text to wrap around it.
  // Letters routinely open on a bare salutation ("Alina,"), where a drop cap
  // leaves a stranded capital and a hole in the column.
  const dropCap = variant === 'serif' && (blocks[0]?.length ?? 0) >= 90;

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
            {dropCap && index === 0 ? (
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
