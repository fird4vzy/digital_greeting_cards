import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'inverse';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex items-center justify-center gap-2.5 rounded-full font-sans font-medium ' +
  'transition-[background-color,color,border-color,transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] ' +
  'active:scale-[0.985] disabled:pointer-events-none disabled:opacity-40 select-none';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-accent-deep shadow-[var(--shadow-lift)] hover:shadow-[var(--shadow-float)]',
  secondary: 'border border-line-strong text-ink hover:border-ink hover:bg-ink/[0.03]',
  ghost: 'text-ink-soft hover:text-ink',
  inverse: 'bg-paper text-ink hover:bg-white shadow-[var(--shadow-float)]',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[0.8125rem]',
  md: 'h-11 px-6 text-[0.875rem]',
  lg: 'h-[3.25rem] px-8 text-[0.9375rem]',
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: BaseProps & ComponentPropsWithoutRef<'button'>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  children,
  href,
  ...rest
}: BaseProps & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}

/** The small arrow that slides on hover. Used on primary CTAs only. */
export function ArrowGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn(
        'h-3.5 w-3.5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1',
        className,
      )}
    >
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
