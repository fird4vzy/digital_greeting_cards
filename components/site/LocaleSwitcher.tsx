'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { LOCALES, LOCALE_COOKIE, LOCALE_META, type Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils/cn';

/**
 * Language switcher.
 *
 * Writes the cookie the middleware reads, then asks the router to re-render on
 * the server. No page reload, no client-side dictionary — the server sends
 * back the same page in the new language.
 */
export function LocaleSwitcher({
  locale,
  label,
  tone = 'ink',
}: {
  locale: Locale;
  label: string;
  tone?: 'ink' | 'paper';
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const choose = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
    startTransition(() => router.refresh());
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-caption transition-colors duration-300',
          tone === 'paper'
            ? 'text-paper/70 hover:text-paper'
            : 'text-ink-soft hover:text-ink',
          pending && 'opacity-50',
        )}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
          <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M2 8h12M8 2c1.8 2 1.8 10 0 12M8 2C6.2 4 6.2 12 8 14"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </svg>
        {locale.toUpperCase()}
      </button>

      {open ? (
        <>
          {/* Click-away. A transparent sibling rather than a document listener
              so it cannot outlive the component. */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <ul
            role="listbox"
            className="absolute right-0 top-11 z-50 min-w-[9rem] overflow-hidden rounded-[0.75rem] border border-line bg-paper py-1 shadow-[var(--shadow-float)]"
          >
            {LOCALES.map((candidate) => (
              <li key={candidate}>
                <button
                  type="button"
                  role="option"
                  aria-selected={candidate === locale}
                  onClick={() => choose(candidate)}
                  className={cn(
                    'block w-full px-4 py-2 text-left text-caption transition-colors',
                    candidate === locale
                      ? 'bg-ink/[0.06] text-ink'
                      : 'text-ink-soft hover:bg-ink/[0.04] hover:text-ink',
                  )}
                >
                  {LOCALE_META[candidate].native}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
