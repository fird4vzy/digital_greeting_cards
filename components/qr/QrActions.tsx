'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Print and copy, the two things a shop actually does on this page.
 *
 * A client component, so its labels arrive as props rather than pulling the
 * server-side dictionary into the bundle.
 */
export function QrActions({
  url,
  labels,
}: {
  url: string;
  labels: { print: string; copyLink: string; copied: string };
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard permission denied — the URL is printed below the tag anyway.
      setCopied(false);
    }
  };

  return (
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Button onClick={() => window.print()}>{labels.print}</Button>
      <Button variant="secondary" onClick={copy}>
        {copied ? labels.copied : labels.copyLink}
      </Button>
    </div>
  );
}
