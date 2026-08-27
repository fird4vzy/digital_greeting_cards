import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Wordmark } from '@/components/site/Wordmark';
import { LocaleSwitcher } from '@/components/site/LocaleSwitcher';
import { AdminNav } from '@/components/admin/AdminNav';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/auth/admin';
import { getI18n } from '@/lib/i18n/server';
import { signOut } from '../login/actions';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();

  return {
    title: { default: dict.admin.title, template: `%s · ${dict.admin.title}` },
    robots: { index: false, follow: false },
  };
}

/**
 * The shop-side surface.
 *
 * Deliberately plainer than the customer product: dense, tabular, fast to
 * scan. It uses the same tokens so it still feels like the same company, but
 * none of the cinematics — an operator working through a Friday afternoon
 * queue does not want a reveal animation between them and an order.
 *
 * The language switcher is here as well as on the public site because an
 * operator may never visit the public site: without it, a shop that works in
 * Uzbek would be stuck with whatever their browser negotiated on first visit.
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

  const { locale, dict } = await getI18n();
  const nav = dict.admin.nav;

  return (
    <div className="min-h-[100svh] bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-xl">
        {/* Две строки на телефоне, одна от планшета.
            Раньше была одна строка фиксированной высоты, и на 390 px знак, четыре
            вкладки, переключатель языка и две ссылки не помещались. Навигация
            сжималась в полоску шириной в несколько пикселей — на экране это
            выглядело как чёрное полукружие рядом со знаком (сплющенная активная
            плашка), а меню казалось пропавшим. */}
        <div className="mx-auto flex w-full max-w-[82rem] flex-wrap items-center gap-x-6 gap-y-3 px-[var(--spacing-gutter)] py-3 md:h-16 md:flex-nowrap md:gap-8 md:py-0">
          <Wordmark href="/admin" />
          <AdminNav
            labels={{
              overview: nav.overview,
              orders: nav.orders,
              cards: nav.cards,
              templates: nav.templates,
            }}
          />

          <div className="ml-auto flex items-center gap-5 max-md:order-first">
            <LocaleSwitcher locale={locale} label={dict.ui.localeSwitcher.label} />

            <Link href="/" className="text-caption text-ink-muted transition-colors hover:text-ink">
              {nav.viewSite}
            </Link>

            <form action={signOut}>
              <button
                type="submit"
                className="text-caption text-ink-muted transition-colors hover:text-ink"
              >
                {nav.signOut}
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
