import { STATUS_META, type OrderStatus } from '@/lib/db/types';
import { cn } from '@/lib/utils/cn';

export function StatusPill({ status, className }: { status: OrderStatus; className?: string }) {
  const meta = STATUS_META[status];

  return (
    <span
      title={meta.hint}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-line-strong px-3 py-1',
        'text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-soft',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="block h-1.5 w-1.5 rounded-full"
        style={{ background: meta.tone }}
      />
      {meta.label}
    </span>
  );
}
