import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

/**
 * Переключатель между двумя галереями.
 *
 * Шаблон и работа — разные вещи, и разводить их по вкладкам честнее, чем
 * держать в одном списке: шаблон это то, из чего соберут новую открытку, а
 * работа — та, что уже дошла до человека.
 */
export function GalleryTabs({
  active,
  templatesLabel,
  worksLabel,
}: {
  active: 'templates' | 'works';
  templatesLabel: string;
  worksLabel: string;
}) {
  const tabs = [
    { key: 'templates' as const, href: '/templates', label: templatesLabel },
    { key: 'works' as const, href: '/works', label: worksLabel },
  ];

  return (
    <div className="mt-12 inline-flex rounded-full border border-edge-strong p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? 'page' : undefined}
          className={cn(
            'inline-flex h-9 items-center rounded-full px-5 text-caption transition-colors duration-400',
            active === tab.key
              ? 'bg-ink text-paper'
              : 'text-on-surface-soft hover:text-on-surface',
          )}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
