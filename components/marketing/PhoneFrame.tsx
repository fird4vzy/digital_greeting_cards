import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

/**
 * A phone, drawn rather than photographed.
 *
 * Cards are read on a phone, so the marketing site shows them on one. Kept
 * deliberately plain — no glossy bezel highlights, no drop shadow theatre —
 * because the content inside is what should draw the eye.
 */
/**
 * Соотношение экрана — высота к ширине.
 *
 * Экспортируется, потому что живое превью работы должно отрисовать чужой
 * документ ровно в эту пропорцию: разъедься эти два числа, и работа окажется
 * обрезанной внутри собственной рамки.
 */
export const PHONE_SCREEN_RATIO = 19.5 / 9;

export function PhoneFrame({
  children,
  className,
  screenClassName,
  label,
}: {
  children: ReactNode;
  className?: string;
  screenClassName?: string;
  label?: string;
}) {
  return (
    <div className={cn('relative mx-auto w-full max-w-[19rem]', className)}>
      <div
        className="relative rounded-[2.75rem] border border-line-strong bg-ink p-[0.4rem] shadow-[var(--shadow-deep)]"
        role={label ? 'img' : undefined}
        aria-label={label}
      >
        <div
          className={cn(
            'relative isolate overflow-hidden rounded-[2.4rem] bg-paper',
            screenClassName,
          )}
          style={{ aspectRatio: `1 / ${PHONE_SCREEN_RATIO}` }}
        >
          {children}

          {/* Dynamic island */}
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-2.5 z-20 h-[1.15rem] w-[4.5rem] -translate-x-1/2 rounded-full bg-ink"
          />
          {/* Home indicator */}
          <span
            aria-hidden="true"
            className="absolute bottom-2 left-1/2 z-20 h-[0.2rem] w-[6.5rem] -translate-x-1/2 rounded-full bg-current opacity-25"
          />
        </div>
      </div>
    </div>
  );
}
