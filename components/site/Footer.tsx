import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n/types';
import { Wordmark } from './Wordmark';

export function Footer({ strings }: { strings: Dictionary['ui']['footer'] }) {
  const columns = [
    {
      title: strings.product,
      links: [
        { href: '/templates', label: strings.links.templates },
        { href: '/create', label: strings.links.create },
        { href: '/c/8FJ29K', label: strings.links.seeCard },
      ],
    },
    {
      title: strings.forShops,
      links: [
        { href: '/admin', label: strings.links.dashboard },
        { href: '/admin/orders', label: strings.links.orders },
        { href: '/c/8FJ29K/qr', label: strings.links.printable },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-line bg-paper px-[var(--spacing-gutter)] py-16">
      <div className="mx-auto grid w-full max-w-[86rem] gap-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-6 max-w-[26ch] text-caption leading-relaxed text-ink-muted">
            {strings.promise}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="eyebrow mb-5 text-ink-muted">{column.title}</h3>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-caption text-ink-soft transition-colors duration-300 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex w-full max-w-[86rem] flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-ink-faint">© {new Date().getFullYear()} More than a bouquet</p>
        <p className="font-display text-caption italic text-ink-muted">{strings.tagline}</p>
      </div>
    </footer>
  );
}
