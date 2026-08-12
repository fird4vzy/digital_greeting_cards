/**
 * Admin access control.
 *
 * The admin surface has no identity layer — no users, no sessions, no per-shop
 * ownership. What it has is a single shared secret in `ADMIN_PASSWORD`, checked
 * over HTTP Basic auth in middleware. That is deliberately the smallest thing
 * that stops `/admin` being world-writable the moment the site is public; it is
 * not the auth this product eventually needs. See the note in
 * `app/admin/actions.ts` for what real auth has to cover.
 *
 * Basic auth was chosen over a login form because it needs no session store, no
 * cookie plumbing and no login route, and because the browser's own credential
 * prompt is one less surface to get wrong. It is only as private as the
 * transport, which on a real deployment is HTTPS.
 *
 * **Fail closed.** With `ADMIN_PASSWORD` unset, production refuses every admin
 * request rather than waving it through — a forgotten env var must never be the
 * difference between a locked and an open order queue. Local development is
 * exempt so `npm run dev` still needs no setup.
 */

/**
 * Realm string shown in the browser's credential prompt.
 *
 * ASCII only, and not by preference: header values are ByteStrings, so a
 * non-Latin-1 character here (an em dash, say) throws when the header is set
 * and turns every 401 into a 500.
 */
const REALM = 'More Than a Bouquet admin';

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; reason: 'unconfigured' | 'missing' | 'invalid' };

/**
 * Compares two strings without leaking their common prefix through timing.
 *
 * Hand-rolled because Edge middleware has no `crypto.timingSafeEqual`. Lengths
 * are folded into the accumulator rather than short-circuiting on them, so the
 * comparison runs over a fixed number of code units for any given `expected`.
 */
function constantTimeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const length = Math.max(a.length, b.length);

  for (let i = 0; i < length; i += 1) {
    diff |= (a.codePointAt(i) ?? 0) ^ (b.codePointAt(i) ?? 0);
  }

  return diff === 0;
}

/** Pulls the password out of an `Authorization: Basic …` header. */
function readBasicPassword(header: string | null): string | null {
  if (!header) return null;

  const [scheme, encoded] = header.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return null;

  let decoded: string;
  try {
    decoded = atob(encoded);
  } catch {
    // Malformed base64 — indistinguishable from a wrong password, treat as one.
    return null;
  }

  // "user:password". The username is ignored: there is only one credential and
  // asking the operator to also remember a username buys nothing.
  const separator = decoded.indexOf(':');
  return separator === -1 ? null : decoded.slice(separator + 1);
}

export function checkAdminAuth(authorization: string | null): AdminAuthResult {
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    // Unset in dev is a convenience; unset in production is a misconfiguration.
    return process.env.NODE_ENV === 'production'
      ? { ok: false, reason: 'unconfigured' }
      : { ok: true };
  }

  const supplied = readBasicPassword(authorization);
  if (supplied === null) return { ok: false, reason: 'missing' };

  return constantTimeEqual(supplied, expected) ? { ok: true } : { ok: false, reason: 'invalid' };
}

/** The response to send when {@link checkAdminAuth} rejects a request. */
export function adminAuthResponse(reason: 'unconfigured' | 'missing' | 'invalid'): Response {
  if (reason === 'unconfigured') {
    // No prompt: no password can succeed, so asking for one is a dead end.
    return new Response('Admin is not configured. Set ADMIN_PASSWORD.', {
      status: 503,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'www-authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'content-type': 'text/plain; charset=utf-8',
    },
  });
}
