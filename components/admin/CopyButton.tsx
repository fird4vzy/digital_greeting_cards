'use client';

import { useEffect, useState } from 'react';

export function CopyButton({ value, label = 'Copy URL' }: { value: string; label?: string }) {
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
      {copied ? 'Copied' : label}
    </button>
  );
}
