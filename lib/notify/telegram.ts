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
 * (the group or person to notify). With either unset this does nothing, which
 * keeps `npm run dev` and every preview deployment quiet.
 *
 * **Never let this fail an order.** The customer has already written something
 * personal and pressed the button; a telegram outage, a revoked token or a
 * bot removed from the group must not turn that into an error page. Every
 * failure is logged and swallowed.
 */

const API = 'https://api.telegram.org';

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

export async function notifyNewOrder(order: Order, origin: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

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
    console.error(`[telegram] could not notify: ${(error as Error).message}`);
  }
}
