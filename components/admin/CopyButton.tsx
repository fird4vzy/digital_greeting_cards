'use client';

import { useEffect, useState } from 'react';

/**
 * A client component, so its two strings arrive as props: the dictionary is
 * server-side, and shipping one to the browser to translate a button would be
 * a poor trade.
 */
export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
      className="block w-full rounded-[0.5rem] border border-line-strong px-4 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
