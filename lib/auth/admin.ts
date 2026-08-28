/**
 * Admin access control.
 *
 * One shared password in `ADMIN_PASSWORD`, exchanged at `/admin/login` for a
 * signed session cookie. This is not an identity layer — no accounts, no
 * per-shop ownership — it establishes that the caller is *an* operator, never
 * *which* operator. See the note in `app/admin/actions.ts`.
 *
 * **Why a form and not HTTP Basic.** Basic auth needs no session store and no
 * login route, which is why it was here first, but the credential prompt it
 * raises is the browser's, not the product's: an unstyled system dialog that
 * reads as an error rather than as a way in, with no way to sign out short of
 * closing the browser. A shop owner opening the order queue every morning
 * should see the shop's own page.
 *
 * **The session.** `<exp>.<hmac>`, signed with a key derived from the
 * password. Nothing is stored server-side: the cookie carries its own expiry
 * and the signature makes it unforgeable, which suits a deployment that may be
 * several serverless instances with nothing shared between them. Changing
 * `ADMIN_PASSWORD` changes the key and so invalidates every session already
 * issued — the closest thing to "log everyone out" available without a store.
 *
 * **Fail closed.** With `ADMIN_PASSWORD` unset, production refuses every admin
 * request rather than waving it through; a forgotten env var must never be the
 * difference between a locked and an open order queue. Local development is
 * exempt so `npm run dev` still needs no setup.
 *
 * Это утверждение три недели было ложью, и аудит 28 августа её нашёл. Закрыт
 * был только вход: `verifyAdminPassword` в проде без пароля отказывал всем.
 * А проверка *сессии* шла мимо — `sign` подставлял вместо ключа строку
 * `'development-only-unset-password'`, лежащую в публичном репозитории, и
 * подписанная ею кука проходила `verifyAdminSession`. То есть забытая
 * переменная не запирала админку, а открывала её любому, кто читал исходники.
 * Теперь ключа без настройки не существует вовсе: `signingKey` в проде
 * возвращает `null`, `sign` на этом падает, а проверка отвечает «нет».
 */

export const ADMIN_SESSION_COOKIE = 'mtab_admin';

/**
 * Twelve hours: long enough to cover a shop's day without a second login,
 * short enough that a browser left open on a counter does not stay a way in
 * indefinitely.
 */
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const encoder = new TextEncoder();

/** True when a password is configured, or when dev is standing in for one. */
export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD) || process.env.NODE_ENV !== 'production';
}

/**
 * Compares two strings without leaking their common prefix through timing.
 *
 * Hand-rolled because the Edge runtime has no `crypto.timingSafeEqual`.
 *
 * Сравниваются не строки, а их хеши, и это исправление двух ошибок в прежнем
 * варианте. Он крутил цикл `Math.max(a.length, b.length)` раз — то есть время
 * ответа зависело от длины присланного пароля, ровно та утечка, ради которой
 * функция и написана, пусть и только про длину. И он брал `codePointAt`, а
 * тот на первой половине суррогатной пары возвращает весь символ целиком:
 * пароль с эмодзи дальше сравнивался со сдвигом индекса.
 *
 * Хеш всегда 32 байта, так что цикл фиксирован по определению, а не по
 * договорённости.
 */
async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  const [left, right] = await Promise.all([digest(a), digest(b)]);

  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left[i]! ^ right[i]!;

  return diff === 0;
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
}

export async function verifyAdminPassword(supplied: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;

  // Dev with no password set: any non-empty value opens the door, matching the
  // "clean checkout needs no setup" rule. Production has no such branch.
  if (!expected) return process.env.NODE_ENV !== 'production' && supplied.length > 0;

  return constantTimeEqual(supplied, expected);
}

export { constantTimeEqual };

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

/**
 * Ключ подписи сессий — или `null`, если подписывать нечем.
 *
 * `ADMIN_SESSION_SECRET` идёт первым и необязателен: пока его нет, ключом
 * служит пароль, и это осознанный размен — одной переменной меньше, а смена
 * пароля заодно разлогинивает всех. Цена в том, что каждая выданная кука —
 * оракул для офлайнового перебора пароля, поэтому у кого есть чем, тот
 * задаёт отдельный секрет и размен снимает.
 *
 * В деве ключ подставляется, чтобы чистый клон работал без настройки. В
 * проде — никогда: подставленный ключ и был дырой, которую здесь чинят.
 */
function signingKey(): string | null {
  const configured = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (configured) return configured;

  return process.env.NODE_ENV === 'production' ? null : 'development-only-unset-password';
}

async function sign(payload: string): Promise<string> {
  const secret = signingKey();
  if (!secret) throw new Error('ADMIN_PASSWORD не задан — подписывать сессию нечем');

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

/** Mints a session for a caller who has already proved the password. */
export async function createAdminSession(): Promise<{ value: string; maxAge: number }> {
  const expiry = Date.now() + SESSION_TTL_MS;
  const payload = `v1.${expiry}`;

  return {
    value: `${payload}.${await sign(payload)}`,
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  };
}

export async function verifyAdminSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;

  // Раньше эта проверка отсутствовала, и в этом была вся дыра: без пароля
  // подпись всё равно вычислялась — подставленным ключом из репозитория.
  if (!signingKey()) return false;

  const separator = token.lastIndexOf('.');
  if (separator === -1) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  const [version, expiry] = payload.split('.');
  if (version !== 'v1') return false;

  // Checked before the signature so an expired-but-valid token cannot be
  // replayed; the comparison itself is still constant-time.
  const expiresAt = Number(expiry);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;

  return await constantTimeEqual(signature, await sign(payload));
}
