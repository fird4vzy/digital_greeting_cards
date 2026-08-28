import 'server-only';
import { headers } from 'next/headers';

/**
 * Ограничение частоты запросов.
 *
 * **Чего здесь не было.** Ни счётчика, ни капчи, ни задержки — нигде. Самое
 * острое место — вход в админку: пароль один на весь бизнес, и подбирать его
 * можно было бесконечно, без блокировки и без следа в логах. Рядом в том же
 * файле аккуратно реализовано сравнение за постоянное время, чтобы не утекал
 * общий префикс, — тонкая атака закрыта, а входная дверь стояла нараспашку.
 * Следом: создание заказов (неограниченный рост базы и поток сообщений в
 * рабочую группу) и перебор кодов открыток.
 *
 * **Два хранилища, и это не выбор из вкуса.** Vercel поднимает столько
 * инстансов, сколько сочтёт нужным, и счётчик в памяти каждого — это ровно
 * `лимит × число инстансов` попыток. Поэтому если заданы `UPSTASH_REDIS_REST_URL`
 * и `UPSTASH_REDIS_REST_TOKEN`, счёт общий и настоящий. Если нет — счёт в
 * памяти: он слабее, но перебор пароля из одного места всё равно ломает, а
 * требовать заводить Redis ради запуска нельзя.
 *
 * Upstash берётся по HTTP, без пакета: одна зависимость, которую не придётся
 * обновлять, и один `fetch` вместо соединения, которое на serverless всё
 * равно не живёт между запросами.
 *
 * **Окно фиксированное, не скользящее.** На границе окна пропускается до
 * двойного лимита — для подбора пароля это ничего не меняет, а стоит одну
 * операцию вместо сортированного множества.
 */

type Rule = { name: string; limit: number; windowMs: number };

/**
 * Правила собраны здесь, а не разбросаны по местам вызова: числа надо видеть
 * рядом, иначе нельзя сказать, согласованы они или просто разные.
 */
export const RATE_LIMITS = {
  /** Вход в админку. Пять попыток за четверть часа — человек столько не ошибается. */
  login: { name: 'login', limit: 5, windowMs: 15 * 60_000 },
  /** Создание заказов. Живой заказчик оформляет один, редко два. */
  createOrder: { name: 'order', limit: 10, windowMs: 60 * 60_000 },
  /** Планировщик: за ним стоит оплачиваемый вызов модели. */
  aiPlan: { name: 'ai', limit: 30, windowMs: 60 * 60_000 },
} as const satisfies Record<string, Rule>;

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSec: number };

// --- счёт в памяти -------------------------------------------------------

const counters = new Map<string, { count: number; resetAt: number }>();

function countInMemory(key: string, windowMs: number): number {
  const now = Date.now();
  const existing = counters.get(key);

  if (!existing || existing.resetAt <= now) {
    // Заодно уборка: без неё карта растёт по одному ключу на каждый IP
    // навсегда, и это утечка памяти, а не кеш.
    if (counters.size > 10_000) {
      for (const [k, v] of counters) if (v.resetAt <= now) counters.delete(k);
    }

    counters.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }

  existing.count += 1;
  return existing.count;
}

// --- счёт в Upstash ------------------------------------------------------

function upstash(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/+$/, ''), token } : null;
}

/** `INCR` и `EXPIRE ... NX` одним запросом. Возвращает счёт или `null`. */
async function countInRedis(key: string, windowSec: number): Promise<number | null> {
  const config = upstash();
  if (!config) return null;

  try {
    const response = await fetch(`${config.url}/pipeline`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${config.token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify([
        ['INCR', key],
        ['EXPIRE', key, String(windowSec), 'NX'],
      ]),
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    });

    if (!response.ok) return null;

    const results = (await response.json()) as { result?: unknown }[];
    const count = Number(results?.[0]?.result);
    return Number.isFinite(count) ? count : null;
  } catch {
    return null;
  }
}

// --- кто именно стучится --------------------------------------------------

/**
 * IP вызывающего.
 *
 * `x-forwarded-for` на Vercel ставит сама платформа, и первый адрес в списке —
 * настоящий клиент. Заголовок подделывается тривиально, поэтому за пределами
 * Vercel ему верить нельзя; здесь он — лучшее, что есть, и цена ошибки
 * ограничена: подделавший себе адрес получает собственное окно, а не чужое.
 */
async function callerKey(): Promise<string> {
  const list = await headers();
  const forwarded = list.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return list.get('x-real-ip') ?? 'unknown';
}

/**
 * Считает попытку и говорит, пускать ли.
 *
 * При недоступном Redis счёт молча переезжает в память этого инстанса. Не
 * «пропускать всё»: тогда сбой Upstash снимал бы защиту с входа в админку
 * ровно в тот момент, когда о нём никто не знает.
 */
export async function rateLimit(rule: Rule, subject?: string): Promise<RateLimitResult> {
  const who = subject ?? (await callerKey());
  const windowSec = Math.ceil(rule.windowMs / 1000);
  const window = Math.floor(Date.now() / rule.windowMs);
  const key = `rl:${rule.name}:${who}:${window}`;

  const count = (await countInRedis(key, windowSec)) ?? countInMemory(key, rule.windowMs);
  const remaining = Math.max(0, rule.limit - count);

  return {
    ok: count <= rule.limit,
    remaining,
    // Сколько осталось до конца окна, а не длина окна целиком: на девятой
    // минуте пятнадцатиминутного окна ждать пятнадцать минут не нужно.
    retryAfterSec: Math.max(1, Math.ceil(((window + 1) * rule.windowMs - Date.now()) / 1000)),
  };
}

/** Готовый 429 для обработчиков маршрутов. */
export function tooManyRequests(result: RateLimitResult): Response {
  return Response.json(
    { error: 'Too many requests' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfterSec) } },
  );
}
