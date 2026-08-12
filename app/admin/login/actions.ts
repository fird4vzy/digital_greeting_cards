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

export type LoginState = { error?: string };

/**
 * Exchanges the shared password for a session cookie.
 *
 * The failure message never distinguishes "wrong password" from anything else
 * a caller could probe for, and the only signal on success is the redirect.
 */
export async function signIn(_state: LoginState, formData: FormData): Promise<LoginState> {
  const { dict } = await getI18n();
  const t = dict.admin.login;

  if (!isAdminConfigured()) {
    return { error: t.errorUnconfigured };
  }

  const password = formData.get('password');
  if (typeof password !== 'string' || password.length === 0) {
    return { error: t.errorEmpty };
  }

  if (!verifyAdminPassword(password)) {
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
