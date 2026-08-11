'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

/** Print and copy, the two things a shop actually does on this page. */
export function QrActions({ url }: { url: string }) {
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
      <Button onClick={() => window.print()}>Print the card</Button>
      <Button variant="secondary" onClick={copy}>
        {copied ? 'Copied' : 'Copy card link'}
      </Button>
    </div>
  );
}
