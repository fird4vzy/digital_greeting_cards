import 'server-only';

import type { Order } from '@/lib/db/types';

/**
 * Tells the shop a new order has arrived.
 *
 * A single HTTPS call to the Bot API, not a bot framework: there is no process
 * to keep alive on a serverless deployment, nothing to poll, and no webhook to
 * register. Notifications only ever go out, so none of that is needed.
 *
 * Configure with `TELEGRAM_BOT_TOKEN` (from @BotFather) and `TELEGRAM_CHAT_ID`
 * (the group or person to notify). With *neither* set this does nothing, which
 * keeps `npm run dev` and every preview deployment quiet. With only one set it
 * complains — see below.
 *
 * **Never let this fail an order.** The customer has already written something
 * personal and pressed the button; a telegram outage, a revoked token or a
 * bot removed from the group must not turn that into an error page. Every
 * failure is logged and swallowed.
 */

const API = 'https://api.telegram.org';

/**
 * Strips the bot token out of anything on its way to a browser.
 *
 * The token is in the request URL, so it can surface inside a thrown fetch
 * error's message. The admin is behind a password, but a credential that only
 * ever needs to exist on the server should never be sent to a client at all —
 * and once it is in a browser it is in devtools, in a screenshot, in a support
 * chat.
 */
function scrub(value: string): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return token ? value.replaceAll(token, '***') : value;
}

/** Escapes the five characters that would otherwise break Telegram's HTML. */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function buildMessage(order: Order, adminUrl: string): string {
  const lines = [
    `<b>Новый заказ · ${escapeHtml(order.code)}</b>`,
    '',
    `Кому: ${escapeHtml(order.recipient.name)}`,
    `От кого: ${escapeHtml(order.customer.name)}`,
    `Повод: ${escapeHtml(order.occasion)}`,
    `Шаблон: ${escapeHtml(order.templateId)}`,
  ];

  const contact = [order.customer.phone, order.customer.email].filter(Boolean).join(' · ');
  if (contact) lines.push(`Связь: ${escapeHtml(contact)}`);

  if (order.photos.length > 0) lines.push(`Фотографий: ${order.photos.length}`);

  if (order.brief?.trim()) {
    // Long briefs are truncated: Telegram rejects messages over 4096
    // characters outright, and the full text is one tap away in the admin.
    const brief = order.brief.trim();
    const shown = brief.length > 600 ? `${brief.slice(0, 600)}…` : brief;
    lines.push('', `<b>Пожелания</b>`, escapeHtml(shown));
  }

  lines.push('', adminUrl);

  return lines.join('\n');
}

/**
 * Warn once per process, not once per order.
 *
 * A misconfigured deployment takes orders continuously; logging on every one
 * buries the message in its own repetition.
 */
let warnedAboutConfig = false;

export async function notifyNewOrder(order: Order, origin: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token && !chatId) {
    // Neither set: notifications are deliberately off. This is the normal
    // state of `npm run dev` and of every preview deployment.
    return;
  }

  if (!token || !chatId) {
    // One set and not the other is not a decision, it is a half-finished
    // setup — and it looks identical to a working one from the outside: the
    // order is accepted, the customer sees success, and the shop is simply
    // never told. Say so loudly, or it stays broken until someone notices
    // an order nobody worked on.
    if (!warnedAboutConfig) {
      warnedAboutConfig = true;
      const missing = !token ? 'TELEGRAM_BOT_TOKEN' : 'TELEGRAM_CHAT_ID';
      console.error(
        `[telegram] ${missing} is not set, so no order notification will ever be sent. ` +
          'Set both variables and redeploy — environment variables only reach a new build.',
      );
    }
    return;
  }

  const text = buildMessage(order, `${origin}/admin/orders/${order.id}`);

  try {
    const response = await fetch(`${API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        // The admin link is for the shop, not something to unfurl in the chat.
        disable_web_page_preview: true,
      }),
      // A slow Telegram must not hold the customer's request open.
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[telegram] sendMessage failed: ${response.status} ${detail.slice(0, 200)}`);
    }
  } catch (error) {
    console.error(`[telegram] could not notify: ${scrub((error as Error).message)}`);
  }
}

/** Which of the two variables are missing. Never returns either value. */
export type NotificationState =
  /** Neither set: notifications are deliberately off. */
  | { kind: 'off' }
  /** One set and not the other — a half-finished setup that looks like a working one. */
  | { kind: 'partial'; missing: 'TELEGRAM_BOT_TOKEN' | 'TELEGRAM_CHAT_ID' }
  /** Both set. Says nothing about whether Telegram accepts them — only a send can. */
  | { kind: 'ready' };

export function notificationState(): NotificationState {
  const token = Boolean(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = Boolean(process.env.TELEGRAM_CHAT_ID);

  if (!token && !chatId) return { kind: 'off' };
  if (!token) return { kind: 'partial', missing: 'TELEGRAM_BOT_TOKEN' };
  if (!chatId) return { kind: 'partial', missing: 'TELEGRAM_CHAT_ID' };
  return { kind: 'ready' };
}

export type TestResult =
  | { ok: true }
  | { ok: false; kind: 'unconfigured'; missing: string }
  /** Telegram answered and refused. `detail` is its own words and the useful part. */
  | { ok: false; kind: 'rejected'; status: number; detail: string }
  | { ok: false; kind: 'unreachable'; detail: string };

/**
 * Sends a message to prove the configuration works, and **reports what went
 * wrong when it does not**.
 *
 * The contract is deliberately the opposite of `notifyNewOrder`, which must
 * swallow every failure so a Telegram outage cannot turn a customer's finished
 * card into an error page. That silence is right there and wrong here: it is
 * the reason a wrong chat id is invisible until somebody notices an order
 * nobody worked on, and the reason the only previous way to test a deployment
 * was to place a real order against it — which is how production came to hold
 * test orders that then had to be cleaned out by hand.
 *
 * Telegram's own refusals are the valuable output and are passed through
 * verbatim: *chat not found* means the id is wrong or the bot was never added
 * to the group, and *Unauthorized* means the token is revoked or mistyped.
 * Translating those into something friendlier would throw away the diagnosis.
 */
export async function sendTestNotification(origin: string): Promise<TestResult> {
  const state = notificationState();
  if (state.kind === 'off') {
    return { ok: false, kind: 'unconfigured', missing: 'TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID' };
  }
  if (state.kind === 'partial') {
    return { ok: false, kind: 'unconfigured', missing: state.missing };
  }

  const text = [
    '<b>Проверка связи</b>',
    '',
    'Если это сообщение видно — уведомления о заказах настроены верно.',
    '',
    `${origin}/admin`,
  ].join('\n');

  try {
    const response = await fetch(`${API}/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (response.ok) return { ok: true };

    // Telegram answers failures as { ok: false, error_code, description }.
    const body = await response.text().catch(() => '');
    let detail = body.slice(0, 300);
    try {
      const parsed = JSON.parse(body) as { description?: string };
      if (parsed.description) detail = parsed.description;
    } catch {
      // Not JSON — a proxy or a gateway answered instead. The raw body is
      // still the most informative thing available.
    }

    return { ok: false, kind: 'rejected', status: response.status, detail: scrub(detail) };
  } catch (error) {
    return { ok: false, kind: 'unreachable', detail: scrub((error as Error).message) };
  }
}
