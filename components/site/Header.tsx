'use client';

import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { ButtonLink } from '@/components/ui/Button';
import type { Locale } from '@/lib/i18n/config';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Wordmark } from './Wordmark';
import { cn } from '@/lib/utils/cn';

export type HeaderStrings = {
  templates: string;
  works: string;
  howItWorks: string;
  forShops: string;
  dashboard: string;
  createCard: string;
  language: string;
};

/**
 * Floats transparently over the hero and settles into a paper bar once the
 * reader leaves it — so the first screen stays a photograph, not a web page.
 */
export function Header({
  overlay = false,
  locale,
  strings,
}: {
  overlay?: boolean;
  locale: Locale;
  strings: HeaderStrings;
}) {
  const links = [
    { href: '/templates', label: strings.templates },
    { href: '/works', label: strings.works },
    { href: '/#bouquet', label: strings.howItWorks },
    // До этого в панель и к предложению магазинам можно было попасть
    // только через футер, то есть прокрутив четыре экрана сцены. Для
    // владельца это ежедневный маршрут, а не редкий.
    { href: '/shops', label: strings.forShops },
    { href: '/admin', label: strings.dashboard },
  ];

  const { scrollY } = useScroll();
  const [settled, setSettled] = useState(!overlay);

  useMotionValueEvent(scrollY, 'change', (value) => {
    if (overlay) setSettled(value > 80);
  });

  return (
    <motion.header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ease-[var(--ease-out-expo)]',
        settled
          ? 'border-b border-edge bg-surface/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
    >
      <div className="mx-auto flex h-[4.5rem] w-full max-w-[86rem] items-center justify-between px-[var(--spacing-gutter)]">
        <Wordmark />

        <nav className="flex items-center gap-1 sm:gap-6">
          <div className="hidden items-center gap-6 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-caption text-on-surface-soft transition-colors duration-300 hover:text-on-surface"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <LocaleSwitcher locale={locale} label={strings.language} />

          <ButtonLink href="/create" size="sm" className="ml-1">
            {strings.createCard}
          </ButtonLink>
        </nav>
      </div>
    </motion.header>
  );
}
