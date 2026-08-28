'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  isAdminConfigured,
  verifyAdminPassword,
} from '@/lib/auth/admin';
import { getI18n } from '@/lib/i18n/server';
import { RATE_LIMITS, rateLimit } from '@/lib/security/rate-limit';

export type LoginState = { error?: string };

/**
 * Exchanges the shared password for a session cookie.
 *
 * The failure message never distinguishes "wrong password" from anything else
 * a caller could probe for, and the only signal on success is the redirect.
 *
 * **Пять попыток за четверть часа.** Пароль здесь один на весь бизнес, и до
 * 28 августа перебирать его можно было бесконечно: ни задержки, ни блокировки,
 * ни строчки в логе. Счёт идёт до проверки пароля — иначе он считал бы только
 * тех, кто уже угадал, — и до `isAdminConfigured`, чтобы ненастроенный вход не
 * оставался бесплатным способом узнать, что стенд поднят.
 */
export async function signIn(_state: LoginState, formData: FormData): Promise<LoginState> {
  const { dict } = await getI18n();
  const t = dict.admin.login;

  const attempt = await rateLimit(RATE_LIMITS.login);
  if (!attempt.ok) {
    console.warn('[login] превышен лимит попыток входа');
    return { error: t.errorTooMany };
  }

  if (!isAdminConfigured()) {
    return { error: t.errorUnconfigured };
  }

  const password = formData.get('password');
  if (typeof password !== 'string' || password.length === 0) {
    return { error: t.errorEmpty };
  }

  if (!(await verifyAdminPassword(password))) {
    // Единственный след неудачного входа. Без него подбор не отличить от
    // забывчивости оператора, а отличать надо.
    console.warn('[login] неверный пароль');
    return { error: t.errorWrong };
  }

  const session = await createAdminSession();

  (await cookies()).set(ADMIN_SESSION_COOKIE, session.value, {
    httpOnly: true,
    sameSite: 'lax',
    // Plain HTTP is only ever localhost here; every real deployment is HTTPS.
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: session.maxAge,
  });

  redirect('/admin');
}

export async function signOut() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
  redirect('/admin/login');
}
