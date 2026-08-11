import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * The mark: a five-petal blossom drawn as a single stroke set, paired with a
 * two-line wordmark. Deliberately not a QR glyph — QR is the bridge, not the
 * brand.
 */
export function Wordmark({
  className,
  tone = 'ink',
  href = '/',
}: {
  className?: string;
  tone?: 'ink' | 'paper';
  href?: string | null;
}) {
  const content = (
    <span className={cn('group inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 40 40"
        aria-hidden="true"
        className={cn(
          'h-7 w-7 shrink-0 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-[72deg]',
          tone === 'paper' ? 'text-paper' : 'text-accent',
        )}
      >
        <g fill="currentColor">
          {[0, 72, 144, 216, 288].map((angle) => (
            <ellipse
              key={angle}
              cx="20"
              cy="11.5"
              rx="5.2"
              ry="8"
              opacity="0.9"
              transform={`rotate(${angle} 20 20)`}
            />
          ))}
        </g>
        <circle cx="20" cy="20" r="2.6" className="fill-paper" opacity="0.7" />
      </svg>

      <span
        className={cn(
          'font-display text-[1.0625rem] leading-[1.05] tracking-[-0.01em]',
          tone === 'paper' ? 'text-paper' : 'text-ink',
        )}
      >
        More than
        <br />
        <span className="italic">a bouquet</span>
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} aria-label="More than a bouquet — home">
      {content}
    </Link>
  );
}
