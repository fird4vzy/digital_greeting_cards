import type { OrderStatus } from '@/lib/db/types';
import { localisedStatus } from '@/lib/i18n/localise';
import { getI18n } from '@/lib/i18n/server';
import { cn } from '@/lib/utils/cn';

/**
 * Reads the dictionary itself rather than taking one as a prop: the pill is
 * dropped into rows and headers all over the admin, and threading a dictionary
 * through every one of those call sites would be noise.
 */
export async function StatusPill({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  const { dict } = await getI18n();
  const meta = localisedStatus(status, dict);

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
