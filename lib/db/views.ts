import 'server-only';

import { getPool } from './index';

/**
 * Сканирования открытки.
 *
 * **Почему это вообще появилось.** Таблица `card_views` описана в схеме с
 * самого начала, с индексом и комментарием «Scan analytics. Append-only», и
 * за всё время в неё не было записано ни строки. То есть единственная цифра,
 * которая что-то говорит о продукте по существу — открыл ли получатель
 * открытку вообще, — не собиралась. Магазин не мог ответить на вопрос
 * «дошло?», а мы не могли ответить на «работает ли идея».
 *
 * **Что записывается и что нет.** Код и время. Ни адреса, ни отпечатка
 * браузера, ни идентификатора посетителя: считается «открытку открывали», а
 * не «этот человек её открывал». Реферер пишется, только если это не наш же
 * домен, — он говорит, из чего перешли (из телеграма, из камеры), и не
 * говорит о человеке ничего.
 *
 * Открытку читает получатель, который о нас не просил и согласия не давал.
 * Собирать о нём что-то сверх факта открытия было бы неправильно, и никакой
 * выгоды от этого нет.
 */

/** Ошибка счётчика не должна ломать открытку. Никогда не бросает. */
export async function recordCardView(code: string, referrer: string | null): Promise<void> {
  const pool = await getPool();
  if (!pool) return;

  try {
    await pool.query(
      'INSERT INTO card_views (code, referrer) VALUES ($1, $2)',
      [code, referrer],
    );
  } catch (error) {
    // В том числе когда таблицы нет: код уезжает пушем, схема применяется
    // руками, и между этим всегда есть окно. До него открытка просто
    // открывается без счётчика.
    console.error(`[views] не записал просмотр ${code}: ${(error as Error).message}`);
  }
}

export type ViewStats = { total: number; first: string | null; last: string | null };

/** Сколько раз открывали — для страницы заказа в админке. */
export async function viewStats(code: string): Promise<ViewStats> {
  const pool = await getPool();
  if (!pool) return { total: 0, first: null, last: null };

  try {
    const result = await pool.query<{ total: string; first: Date | null; last: Date | null }>(
      `SELECT count(*)::text AS total, min(viewed_at) AS first, max(viewed_at) AS last
         FROM card_views WHERE code = $1`,
      [code],
    );

    const row = result.rows[0];
    return {
      total: Number(row?.total ?? 0),
      first: row?.first ? row.first.toISOString() : null,
      last: row?.last ? row.last.toISOString() : null,
    };
  } catch {
    return { total: 0, first: null, last: null };
  }
}
