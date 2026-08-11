'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const links = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/cards', label: 'Cards' },
  { href: '/admin/templates', label: 'Templates' },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {links.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-caption transition-colors duration-300',
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
