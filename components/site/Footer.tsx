import Link from 'next/link';
import { SITE } from '@/lib/site';
import { Wordmark } from './Wordmark';

const columns = [
  {
    title: 'Product',
    links: [
      { href: '/templates', label: 'Templates' },
      { href: '/create', label: 'Create a card' },
      { href: '/c/8FJ29K', label: 'See a real card' },
    ],
  },
  {
    title: 'For flower shops',
    links: [
      { href: '/admin', label: 'Shop dashboard' },
      { href: '/admin/orders', label: 'Orders' },
      { href: '/c/8FJ29K/qr', label: 'Printable QR card' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative border-t border-line bg-paper px-[var(--spacing-gutter)] py-16">
      <div className="mx-auto grid w-full max-w-[86rem] gap-12 sm:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-6 max-w-[26ch] text-caption leading-relaxed text-ink-muted">
            {SITE.promise}
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
        <p className="text-caption text-ink-faint">
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <p className="font-display text-caption italic text-ink-muted">{SITE.tagline}</p>
      </div>
    </footer>
  );
}
