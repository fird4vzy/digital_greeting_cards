import 'server-only';

import type { Order } from '@/lib/db/types';
import { getDictionary } from '@/lib/i18n';
import { localiseTemplate, occasionLabel } from '@/lib/i18n/localise';
import { resolveTemplateAnywhere } from '@/lib/card/registry';
import { toSummary } from '@/lib/card/template';
import { getWork } from '@/lib/works';

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
 * Номер темы в супергруппе-форуме.
 *
 * Заказы и обращения в поддержку — разные разговоры, и валить их в общий
 * поток значит терять оба: заказ тонет в переписке, вопрос теряется среди
 * заказов. Telegram решает это темами, и адресуются они полем
 * `message_thread_id`.
 *
 * **Принимается и число, и ссылка на тему.** Номер темы человек достаёт
 * правым щелчком по ней → «Копировать ссылку», получая
 * `https://t.me/c/2419.../7`. Требовать, чтобы он сам выковырял оттуда
 * последнее число, — это лишний шаг и лишний способ ошибиться; пусть вставит
 * как есть.
 *
 * Не задано — сообщение уходит в общий поток, как раньше. Это осознанный
 * запасной путь: группа может и не быть форумом, и тогда `message_thread_id`
 * вызвал бы отказ Telegram на каждом заказе.
 */
function topicId(raw: string | undefined): number | undefined {
  if (!raw) return undefined;

  // Ссылка, скопированная из Telegram, иногда заканчивается слэшем.
  const digits = raw.trim().match(/(\d+)\/?\s*$/);
  if (!digits) return undefined;

  const value = Number(digits[1]);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

/** Куда именно писать: чат плюс, если задана, тема внутри него. */
function target(topic: string | undefined) {
  const thread = topicId(topic);
  return {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    ...(thread ? { message_thread_id: thread } : {}),
  };
}

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

/**
 * Сообщение о заказе — словами, а не идентификаторами.
 *
 * Раньше здесь печаталось `Повод: anniversary` и `Шаблон: romantic`: сырые
 * ключи из базы, английские, одинаковые во всех трёх языках. Это тот же баг,
 * что когда-то был в панели оператора, и правило записано там же — **имя
 * показывают человеку, идентификатор остаётся в коде**. Читает это живой
 * человек в телеграме, а не разработчик в логах.
 *
 * И главное: **просьба заказчика идёт первой**. Если он не выбирал шаблон, а
 * описал свою идею или показал на готовую работу, то шаблон в заказе —
 * подобранный нами, и называть его как выбор клиента прямо неверно. Раньше
 * этой строки не было вовсе: самое важное, что сказал человек, до группы не
 * доезжало.
 */
function buildMessage(order: Order, adminUrl: string, templateName: string): string {
  const dict = getDictionary(order.locale);
  const lines = [
    `<b>Новый заказ · ${escapeHtml(order.code)}</b>`,
    '',
    `Кому: ${escapeHtml(order.recipient.name)}`,
    `От кого: ${escapeHtml(order.customer.name)}`,
    `Повод: ${escapeHtml(occasionLabel(order.occasion, dict))}`,
    // Когда заказчик шаблон не выбирал, честнее сказать, что он подобран.
    `Шаблон: ${escapeHtml(templateName)}${order.wish ? ' (подобрали сами)' : ''}`,
  ];

  // Телеграм первым: по нему и отвечают. Почта — только у старых заказов.
  const contact = [order.customer.telegram, order.customer.phone, order.customer.email]
    .filter(Boolean)
    .join(' · ');
  if (contact) lines.push(`Связь: ${escapeHtml(contact)}`);

  if (order.photos.length > 0) lines.push(`Фотографий: ${order.photos.length}`);

  // Просьба заказчика — до пожеланий салону и до всего остального: с неё
  // начинается работа над открыткой.
  if (order.wish) {
    lines.push('', '<b>Заказчик не выбирал шаблон</b>');

    if (order.wish.kind === 'work') {
      const title = getWork(order.wish.workId)?.title ?? order.wish.workId;
      lines.push(`Хочет как работа «${escapeHtml(title)}».`);
    } else {
      const text = order.wish.text.trim();
      lines.push(
        'Описал свою идею:',
        escapeHtml(text.length > 600 ? `${text.slice(0, 600)}…` : text),
      );
    }
  }

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

  // Имя шаблона — из общего реестра, включая собранные оператором: в
  // словаре их нет, и без реестра такой шаблон снова стал бы идентификатором.
  const template = await resolveTemplateAnywhere(order.templateId);
  const templateName = localiseTemplate(
    toSummary(template),
    getDictionary(order.locale),
  ).name;

  const text = buildMessage(order, `${origin}/admin/orders/${order.id}`, templateName);

  try {
    const response = await fetch(`${API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...target(process.env.TELEGRAM_TOPIC_ORDERS),
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
/** Чат, который бот видел: то, что нужно положить в `TELEGRAM_CHAT_ID`. */
export type SeenChat = { id: string; title: string; type: string; current: boolean };

export type ChatLookup =
  | { ok: true; chats: SeenChat[] }
  | { ok: false; kind: 'unconfigured' }
  | { ok: false; kind: 'rejected'; detail: string };

/**
 * Показывает чаты, из которых бот получал сообщения.
 *
 * Существует ради одной конкретной ловушки, стоившей трёх сессий. Когда
 * обычная группа превращается в супергруппу — а это происходит само, стоит
 * включить топики, — её `chat_id` меняется на вид `-100…`, и прежний
 * замолкает навсегда. Снаружи это выглядит как «бот перестал писать», а
 * Telegram отвечает `chat not found`, что читается как «бота нет в группе».
 *
 * Достать новый id можно было только вручную: открыть группу в
 * `web.telegram.org` и выковырять число из адресной строки. Кнопка делает то
 * же самое за один запрос и сразу помечает, какой из чатов уже настроен.
 *
 * **`getUpdates` не работает при установленном вебхуке** — Telegram отдаёт
 * 409, и это не ошибка, а сообщение: у бота есть вебхук, значит сообщения
 * забирает он. Пробрасываем как есть.
 *
 * Ещё одно: `getUpdates` помнит только последние сутки. Если бот давно
 * молчит, список будет пуст — тогда нужно написать в группу любое сообщение
 * и нажать снова. Это сказано в подписи к кнопке.
 */
export async function findChats(): Promise<ChatLookup> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, kind: 'unconfigured' };

  try {
    const response = await fetch(`${API}/bot${token}/getUpdates?limit=100`, {
      signal: AbortSignal.timeout(8000),
    });
    const body = (await response.json()) as {
      ok: boolean;
      description?: string;
      result?: { message?: { chat?: { id: number; title?: string; type: string } } }[];
    };

    if (!body.ok) {
      return { ok: false, kind: 'rejected', detail: scrub(body.description ?? String(response.status)) };
    }

    const current = process.env.TELEGRAM_CHAT_ID;
    const seen = new Map<string, SeenChat>();

    for (const update of body.result ?? []) {
      const chat = update.message?.chat;
      if (!chat) continue;
      const id = String(chat.id);
      seen.set(id, {
        id,
        title: chat.title ?? id,
        type: chat.type,
        current: id === current,
      });
    }

    return { ok: true, chats: [...seen.values()] };
  } catch (error) {
    return { ok: false, kind: 'rejected', detail: scrub((error as Error).message) };
  }
}

/**
 * Пересылает написанное боту в рабочую группу.
 *
 * Ровно то, чего не хватало кнопке на `/shops`: флорист пишет боту в личку,
 * сообщение появляется там, где команда и так читает заказы. Без этого бот
 * принимал сообщения молча — их не видел никто.
 *
 * **Петля разрывается здесь.** Бот состоит в той же группе, куда пересылает.
 * Своих сообщений он не получает, но чужие в группе — вполне, если у него
 * выключен режим приватности. Пересылка такого сообщения обратно в ту же
 * группу дала бы эхо: каждое сообщение в чате возвращалось бы копией. Поэтому
 * всё, что пришло ИЗ целевого чата, отбрасывается первым же условием.
 *
 * Пересылается текстом, а не `forwardMessage`: пересланное показало бы
 * команде карточку отправителя, но не сказало бы, откуда он взялся. Здесь
 * важнее контекст — кто написал и как с ним связаться, — поэтому шапка
 * собирается своя, а `reply_markup` Telegram не нужен.
 */
export async function forwardIncoming(update: unknown): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const message = (update as { message?: TelegramMessage } | null)?.message;
  if (!message) return;

  // Пришло из самой группы — не пересылать, иначе эхо.
  if (String(message.chat?.id) === chatId) return;

  // `/start` — это не вопрос, а «я открыл бота». Пересылать такое в рабочую
  // группу значит засорять её каждым любопытным; человеку нужен ответ, а
  // команде — тишина. Отвечаем сами и выходим.
  if (message.text?.trim().startsWith('/start')) {
    await reply(token, message.chat?.id, welcome());
    return;
  }

  const from = message.from;
  const name = [from?.first_name, from?.last_name].filter(Boolean).join(' ') || 'без имени';
  const handle = from?.username ? `@${from.username}` : null;

  const body = message.text?.trim();
  // Не текст — фото, голосовое, стикер. Сказать, что оно было, полезнее, чем
  // промолчать: команда напишет человеку сама.
  const content = body
    ? escapeHtml(body.length > 3000 ? `${body.slice(0, 3000)}…` : body)
    : '<i>нетекстовое сообщение — откройте бота, чтобы посмотреть</i>';

  const lines = [
    '<b>Написали боту</b>',
    '',
    `От: ${escapeHtml(name)}${handle ? ` · ${escapeHtml(handle)}` : ''}`,
    '',
    content,
  ];

  if (!handle) {
    // Без username ответить из группы невозможно: ссылка `tg://user?id=` в
    // группах не всегда открывается. Честнее предупредить, чем оставить
    // команду гадать, почему на человека нельзя нажать.
    lines.push('', '<i>username не указан — ответить можно только из самого бота</i>');
  }

  try {
    await fetch(`${API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ...target(process.env.TELEGRAM_TOPIC_SUPPORT),
        text: lines.join('\n'),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error(`[telegram] не удалось переслать: ${scrub((error as Error).message)}`);
  }
}

/**
 * Что видит человек, впервые открывший бота.
 *
 * Живёт в коде, а не у @BotFather: описание в профиле показывается до первого
 * действия, а это — ответ на него, и меняется он вместе с сайтом. Держать оба
 * текста в одном месте нельзя, но менять их стоит вместе — второй ставится
 * командой `npm run tg:webhook face`.
 *
 * Адреса берутся из `NEXT_PUBLIC_SITE_URL`, чтобы бот не рассылал ссылки на
 * прежний домен после переезда.
 */
function welcome(): string {
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://birdunyo.uz').replace(/\/+$/, '');

  return [
    '<b>Bir dunyo</b> — цифровые открытки к букетам.',
    '',
    'К цветам крепится маленькая бирка с кодом. Человек наводит телефон — и',
    'открывается то, что вы для него собрали: письмо, фотографии, даты.',
    '',
    `Собрать открытку: ${site}/create`,
    `Посмотреть примеры: ${site}/works`,
    `Цветочным магазинам: ${site}/shops`,
    '',
    'Или просто напишите, что нужно, — ответим здесь.',
  ].join('\n');
}

/** Короткий ответ в тот же чат. Ошибку глотаем: см. про повторы в маршруте. */
async function reply(token: string, chatId: number | undefined, text: string): Promise<void> {
  if (!chatId) return;

  try {
    await fetch(`${API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (error) {
    console.error(`[telegram] не удалось ответить: ${scrub((error as Error).message)}`);
  }
}

/** Ровно те поля апдейта, которые здесь читаются. */
type TelegramMessage = {
  chat?: { id: number };
  from?: { first_name?: string; last_name?: string; username?: string };
  text?: string;
};

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
        // Проверка идёт туда же, куда пойдут заказы: смысл её в том, чтобы
        // увидеть сообщение там, где его будут ждать, а не просто где-нибудь.
        ...target(process.env.TELEGRAM_TOPIC_ORDERS),
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
