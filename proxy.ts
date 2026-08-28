import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from '@/lib/auth/admin';
import { LOCALE_COOKIE, LOCALE_HEADER, isLocale, negotiateLocale } from '@/lib/i18n/config';

/**
 * Admin gate and locale negotiation.
 *
 * `/admin` is session-gated here so that an expired or absent session lands on
 * the login page instead of a dashboard that renders empty. This is the
 * optimistic check Next's own guidance describes, not the authorisation
 * boundary: the `(dashboard)` layout verifies the session again before
 * rendering, and `app/admin/actions.ts` verifies it again before every write —
 * server actions POST to the path they were invoked from, so they pass through
 * here, but nothing about routing should be load-bearing for a mutation.
 *
 * The visitor's language is resolved once, here, and handed to the app on a
 * request header. An explicit choice they made earlier (cookie) beats their
 * browser's Accept-Language, which beats the default.
 *
 * **Why not `/ru/…` URL segments.** Route-based locales are the textbook
 * answer and they are better for SEO — but this product has almost nothing to
 * index: published cards are deliberately `noindex`, and the marketing site is
 * a handful of pages. Against that, a locale segment would put a language
 * prefix on every internal link and, worse, invite it onto card URLs that are
 * *printed on paper* and can never change. Cookie negotiation keeps card links
 * permanent and the routing tree flat. If organic search ever matters, this is
 * the one file that has to change.
 *
 * `/c/…` is excluded entirely: a published card's language comes from the card
 * itself, never from whoever is holding the phone.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page is the one admin path that must stay reachable logged out,
  // or the redirect below would point at itself.
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!(await verifyAdminSession(session))) {
      const login = new URL('/admin/login', request.url);
      return NextResponse.redirect(login);
    }
  }

  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookie)
    ? cookie
    : negotiateLocale(request.headers.get('accept-language'));

  const headers = new Headers(request.headers);
  headers.set(LOCALE_HEADER, locale);

  const response = NextResponse.next({ request: { headers } });

  // Remember the negotiated choice so the next visit skips negotiation and,
  // more importantly, so an explicit switch survives navigation.
  if (cookie !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  /**
   * `monitoring` в списке исключений — это туннель Sentry (`tunnelRoute` в
   * next.config.ts). Через него браузер отправляет отчёты об ошибках нашим же
   * адресом, чтобы их не резали блокировщики рекламы. Посреднику там делать
   * нечего, а документация Sentry прямо предупреждает: если маршрут попадёт
   * под middleware, отчёты с клиента перестанут доходить — молча.
   */
  matcher: ['/((?!c/|api/|monitoring|_next/|.*\\..*).*)'],
};
