import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wordmark } from '@/components/site/Wordmark';
import { AdminNav } from '@/components/admin/AdminNav';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/auth/admin';
import { signOut } from '../login/actions';

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
 *
 * The session check in `proxy.ts` already ran; this repeats it. Next's own
 * guidance is that the proxy is an optimistic gate, not the authorisation
 * boundary — so the boundary is here, closest to the data, where no routing
 * quirk or proxy bypass can skip it.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await verifyAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value))) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-[100svh] bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[82rem] items-center gap-8 px-[var(--spacing-gutter)]">
          <Wordmark href="/admin" />
          <AdminNav />
          <div className="ml-auto flex items-center gap-5">
            <Link href="/" className="text-caption text-ink-muted transition-colors hover:text-ink">
              View site
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="text-caption text-ink-muted transition-colors hover:text-ink"
              >
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[82rem] px-[var(--spacing-gutter)] py-12">
        {children}
      </main>
    </div>
  );
}
