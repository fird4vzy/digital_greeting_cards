import type { ReactNode } from 'react';
import { Eyebrow, Reveal, WordReveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils/cn';

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'ink',
  className,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  align?: 'left' | 'center';
  tone?: 'ink' | 'paper';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        'max-w-[42rem]',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <Reveal preset="fade">
          <Eyebrow
            tone={tone === 'paper' ? 'inverse' : 'muted'}
            className={cn(align === 'center' && 'justify-center')}
          >
            {eyebrow}
          </Eyebrow>
        </Reveal>
      ) : null}

      <WordReveal
        as="h2"
        text={title}
        className={cn(
          'mt-6 font-display text-display-sm leading-[1.02] tracking-[-0.025em]',
          tone === 'paper' ? 'text-paper' : 'text-ink',
        )}
      />

      {lead ? (
        <Reveal preset="fade" delay={0.15}>
          <p
            className={cn(
              'mt-6 max-w-[46ch] text-body-lg text-pretty',
              align === 'center' && 'mx-auto',
              tone === 'paper' ? 'text-paper/65' : 'text-ink-soft',
            )}
          >
            {lead}
          </p>
        </Reveal>
      ) : null}

      {children}
    </div>
  );
}
