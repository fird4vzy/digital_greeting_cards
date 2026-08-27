import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n/types';
import { SITE } from '@/lib/site';
import { Wordmark } from './Wordmark';

export function Footer({ strings }: { strings: Dictionary['ui']['footer'] }) {
  const columns = [
    {
      title: strings.product,
      links: [
        { href: '/templates', label: strings.links.templates },
        { href: '/works', label: strings.links.works },
        { href: '/create', label: strings.links.create },
        { href: '/c/8FJ29K', label: strings.links.seeCard },
      ],
    },
    {
      title: strings.forShops,
      links: [
        // The pitch goes first: a florist who found the site has no other way
        // in, and the dashboard below it is only useful once they have signed up.
        { href: '/shops', label: strings.links.shops },
        { href: '/admin', label: strings.links.dashboard },
        { href: '/admin/orders', label: strings.links.orders },
        { href: '/c/8FJ29K/qr', label: strings.links.printable },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-edge bg-surface px-[var(--spacing-gutter)] py-16">
      <div className="mx-auto grid w-full max-w-[86rem] gap-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-6 max-w-[26ch] text-caption leading-relaxed text-on-surface-muted">
            {strings.promise}
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h3 className="eyebrow mb-5 text-on-surface-muted">{column.title}</h3>
            <ul className="space-y-3">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-caption text-on-surface-soft transition-colors duration-300 hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-14 flex w-full max-w-[86rem] flex-col gap-3 border-t border-edge pt-7 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-on-surface-faint">© {new Date().getFullYear()} {SITE.name}</p>
        <p className="font-display text-caption italic text-on-surface-muted">{strings.tagline}</p>
      </div>
    </footer>
  );
}
