'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

/**
 * A client component — it needs the current path to mark the active tab — so
 * its labels arrive as a prop rather than from the server-side dictionary.
 */
export type AdminNavLabels = {
  overview: string;
  orders: string;
  cards: string;
  templates: string;
};

export function AdminNav({ labels }: { labels: AdminNavLabels }) {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: labels.overview, exact: true },
    { href: '/admin/orders', label: labels.orders },
    { href: '/admin/cards', label: labels.cards },
    { href: '/admin/templates', label: labels.templates },
  ];

  return (
    // На телефоне — своя строка во всю ширину, вкладки переносятся.
    // `shrink-0` на самих ссылках: без него flex сжимал плашки до нечитаемого.
    <nav className="flex w-full flex-wrap items-center gap-1 md:w-auto md:flex-nowrap">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-caption transition-colors duration-300',
              active ? 'bg-ink text-paper' : 'text-ink-soft hover:bg-ink/[0.05] hover:text-ink',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
