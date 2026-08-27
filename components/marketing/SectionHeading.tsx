import type { ReactNode } from 'react';
import { Eyebrow, Reveal, WordReveal } from '@/components/ui/Reveal';
import { cn } from '@/lib/utils/cn';

export function SectionHeading({
  counter,
  eyebrow,
  title,
  lead,
  align = 'left',
  tone = 'ink',
  className,
  children,
}: {
  /**
   * Номер секции в актах лендинга — «01», «02». Формат «01 — Шаг первый»
   * собирает компонент, а не словарь: тире и порядок — оформление, а не текст.
   * Необязателен: светлые страницы его не передают и не меняются.
   */
  counter?: string;
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
          {counter ? (
            <span
              className={cn(
                'flex items-baseline gap-3',
                align === 'center' && 'justify-center',
              )}
            >
              <span className="counter-mark">{counter}</span>
              <Eyebrow tone={tone === 'paper' ? 'inverse' : 'muted'}>{eyebrow}</Eyebrow>
            </span>
          ) : (
            <Eyebrow
              tone={tone === 'paper' ? 'inverse' : 'muted'}
              className={cn(align === 'center' && 'justify-center')}
            >
              {eyebrow}
            </Eyebrow>
          )}
        </Reveal>
      ) : null}

      <WordReveal
        as="h2"
        text={title}
        className={cn(
          'mt-6 font-display text-display-sm leading-[1.02] tracking-[-0.025em]',
          tone === 'paper' ? 'text-paper' : 'text-on-surface',
        )}
      />

      {lead ? (
        <Reveal preset="fade" delay={0.15}>
          <p
            className={cn(
              'mt-6 max-w-[46ch] text-body-lg text-pretty',
              align === 'center' && 'mx-auto',
              tone === 'paper' ? 'text-paper/65' : 'text-on-surface-soft',
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
