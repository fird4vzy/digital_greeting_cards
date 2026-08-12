import { NextResponse, type NextRequest } from 'next/server';
import { adminAuthResponse, checkAdminAuth } from '@/lib/auth/admin';
import { LOCALE_COOKIE, LOCALE_HEADER, isLocale, negotiateLocale } from '@/lib/i18n/config';

/**
 * Admin gate and locale negotiation.
 *
 * `/admin` is password-gated here because the proxy is the one place that also
 * covers the server actions in `app/admin/actions.ts`: they POST back to the
 * admin path they were invoked from, so a check that runs before routing
 * catches the writes as well as the reads. The admin layout re-checks anyway —
 * Next's own guidance is not to let the proxy be the only thing standing
 * between a request and protected data. See `lib/auth/admin.ts`.
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
export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const auth = checkAdminAuth(request.headers.get('authorization'));
    if (!auth.ok) return adminAuthResponse(auth.reason);
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
  matcher: ['/((?!c/|api/|_next/|.*\\..*).*)'],
};
