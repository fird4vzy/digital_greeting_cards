import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Wordmark } from '@/components/site/Wordmark';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, verifyAdminSession } from '@/lib/auth/admin';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Вход',
  robots: { index: false, follow: false },
};

/**
 * The way into the shop dashboard.
 *
 * Sits outside the `(dashboard)` route group on purpose: that group's layout
 * is what enforces the session, and a login page rendered inside it could only
 * ever be shown to someone already logged in.
 */
export default async function AdminLoginPage() {
  const configured = isAdminConfigured();

  // Already signed in — nothing here to offer.
  if (configured && (await verifyAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value))) {
    redirect('/admin');
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-paper px-[var(--spacing-gutter)] py-16">
      <div className="w-full max-w-[26rem]">
        <Wordmark href="/" />

        <h1 className="mt-10 font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
          Кабинет салона
        </h1>
        <p className="mt-3 text-caption text-ink-muted">
          Очередь заказов и опубликованные открытки.
        </p>

        {configured ? (
          <LoginForm />
        ) : (
          <p className="mt-10 rounded-2xl border border-line-strong bg-white/60 p-4 text-caption text-ink-soft">
            Вход не настроен. Задайте переменную окружения <code>ADMIN_PASSWORD</code> и
            пересоберите приложение.
          </p>
        )}
      </div>
    </main>
  );
}
