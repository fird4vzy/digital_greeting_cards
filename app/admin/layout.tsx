import type { Metadata } from 'next';
import Link from 'next/link';
import { Wordmark } from '@/components/site/Wordmark';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: { default: 'Shop dashboard', template: '%s · Shop dashboard' },
  robots: { index: false, follow: false },
};

/**
 * The shop-side surface.
 *
 * Deliberately plainer than the customer product: dense, tabular, fast to
 * scan. It uses the same tokens so it still feels like the same company, but
 * none of the cinematics — an operator working through a Friday afternoon
 * queue does not want a reveal animation between them and an order.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[82rem] items-center gap-8 px-[var(--spacing-gutter)]">
          <Wordmark href="/admin" />
          <AdminNav />
          <Link
            href="/"
            className="ml-auto text-caption text-ink-muted transition-colors hover:text-ink"
          >
            View site
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[82rem] px-[var(--spacing-gutter)] py-12">
        {children}
      </main>
    </div>
  );
}
