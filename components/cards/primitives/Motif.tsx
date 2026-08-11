import type { MotifId } from '@/lib/card/template';
import { cn } from '@/lib/utils/cn';

/**
 * Quiet 2D decoration, drawn as inline SVG in `currentColor`.
 *
 * Motifs carry the template's personality on devices that never load the 3D
 * layer — and on the ones that do, they add a second, cheaper layer of detail.
 * They are strokes, never fills, so they read as printing rather than clip-art.
 */
export function Motif({
  id,
  className,
  strokeWidth = 1,
}: {
  id: MotifId;
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <svg
      viewBox="0 0 120 120"
      aria-hidden="true"
      className={cn('pointer-events-none select-none', className)}
    >
      {id === 'petals' && (
        <g {...common}>
          <path d="M60 20c14 12 22 26 22 40s-9 26-22 32c-13-6-22-18-22-32s8-28 22-40z" />
          <path d="M60 44c6 8 9 16 9 24s-3 15-9 20" opacity="0.55" />
          <path d="M60 92v16" opacity="0.5" />
        </g>
      )}

      {id === 'sparks' && (
        <g {...common}>
          <path d="M60 14v22M60 84v22M14 60h22M84 60h22" />
          <path d="M28 28l14 14M78 78l14 14M92 28L78 42M42 78l-14 14" opacity="0.5" />
          <circle cx="60" cy="60" r="9" />
        </g>
      )}

      {id === 'linen' && (
        <g {...common} opacity="0.8">
          <path d="M16 34h88M16 52h88M16 70h88M16 88h88" />
          <path d="M34 20v80M60 20v80M86 20v80" opacity="0.45" />
        </g>
      )}

      {id === 'arch' && (
        <g {...common}>
          <path d="M28 104V60a32 32 0 0 1 64 0v44" />
          <path d="M42 104V62a18 18 0 0 1 36 0v42" opacity="0.5" />
          <path d="M18 104h84" />
        </g>
      )}

      {id === 'sun' && (
        <g {...common}>
          <circle cx="60" cy="60" r="22" />
          <path d="M60 12v14M60 94v14M12 60h14M94 60h14M26 26l10 10M84 84l10 10M94 26L84 36M36 84l-10 10" opacity="0.6" />
        </g>
      )}

      {id === 'branch' && (
        <g {...common}>
          <path d="M12 104C40 92 62 70 78 40" />
          <path d="M50 66c-4-10-2-18 4-24M64 50c8-2 14 2 17 9M40 82c-8 0-13-4-15-11" opacity="0.6" />
          <circle cx="78" cy="40" r="5" />
          <circle cx="88" cy="28" r="3.5" opacity="0.7" />
          <circle cx="66" cy="34" r="3" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}

/** A single blossom used as an ornamental full stop at the end of a card. */
export function Blossom({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className={cn('pointer-events-none', className)}>
      <g fill="currentColor">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="24"
            cy="14"
            rx="6.4"
            ry="9.6"
            opacity="0.85"
            transform={`rotate(${angle} 24 24)`}
          />
        ))}
        <circle cx="24" cy="24" r="3.2" opacity="0.5" />
      </g>
    </svg>
  );
}
