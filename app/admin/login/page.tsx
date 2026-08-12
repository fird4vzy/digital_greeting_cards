import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Wordmark } from '@/components/site/Wordmark';
import { LocaleSwitcher } from '@/components/site/LocaleSwitcher';
import { ADMIN_SESSION_COOKIE, isAdminConfigured, verifyAdminSession } from '@/lib/auth/admin';
import { getI18n } from '@/lib/i18n/server';
import { LoginForm } from './LoginForm';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();

  return {
    title: dict.admin.title,
    robots: { index: false, follow: false },
  };
}

/**
 * The way into the shop dashboard.
 *
 * Sits outside the `(dashboard)` route group on purpose: that group's layout
 * is what enforces the session, and a login page rendered inside it could only
 * ever be shown to someone already logged in.
 */
export default async function AdminLoginPage() {
  const { locale, dict } = await getI18n();
  const t = dict.admin.login;
  const configured = isAdminConfigured();

  // Already signed in — nothing here to offer.
  if (configured && (await verifyAdminSession((await cookies()).get(ADMIN_SESSION_COOKIE)?.value))) {
    redirect('/admin');
  }

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-paper px-[var(--spacing-gutter)] py-16">
      <div className="w-full max-w-[26rem]">
        <div className="flex items-center justify-between gap-4">
          <Wordmark href="/" />
          <LocaleSwitcher locale={locale} label={dict.ui.localeSwitcher.label} />
        </div>

        <h1 className="mt-10 font-display text-display-sm leading-none tracking-[-0.025em] text-ink">
          {dict.admin.title}
        </h1>
        <p className="mt-3 text-caption text-ink-muted">{t.lead}</p>

        {configured ? (
          <LoginForm
            labels={{
              password: t.password,
              submit: t.submit,
              pending: t.pending,
            }}
          />
        ) : (
          <p className="mt-10 rounded-2xl border border-line-strong bg-white/60 p-4 text-caption text-ink-soft">
            {t.unconfigured}
          </p>
        )}
      </div>
    </main>
  );
}
