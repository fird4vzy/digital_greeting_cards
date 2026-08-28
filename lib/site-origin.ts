import 'server-only';

import { headers } from 'next/headers';

/**
 * Absolute origin for QR codes and share links.
 *
 * Prefers the configured public URL — the only value that is correct on a
 * card that has already been printed — then the forwarded host from the
 * current request, then localhost for development.
 */
export async function siteOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;

  // Настроенное значение принимается, только если это настоящий адрес.
  //
  // Здесь непроверенная строка опаснее, чем в метаданных: этот origin уходит
  // в QR-коды, а те печатаются на бирках и привязываются к букетам. Ошибка
  // не всплывёт при сборке — она всплывёт у человека с бумажкой в руках,
  // который отсканирует код и никуда не попадёт. `vercel env pull` умеет
  // записать сюда `[SENSITIVE]` вместо секрета, поэтому проверка не
  // теоретическая.
  if (configured) {
    try {
      return new URL(configured).origin;
    } catch {
      console.warn(
        `[site] NEXT_PUBLIC_SITE_URL не похож на адрес (${configured}) — беру адрес запроса.`,
      );
    }
  }

  try {
    const list = await headers();
    const host = list.get('x-forwarded-host') ?? list.get('host');

    // Хост из заголовка принимается, только если он наш.
    //
    // `x-forwarded-host` подделывается одной строкой в curl, а результат
    // уезжает в QR-код на бирке. Без проверки достаточно было одного запроса
    // с `X-Forwarded-Host: evil.uz` в момент, когда `NEXT_PUBLIC_SITE_URL` не
    // задан или испорчен, — и магазин печатал бирки, ведущие на чужой сайт.
    // Отменить такое нельзя: бумага уже роздана вместе с букетами.
    if (host && isOwnHost(host)) {
      const protocol =
        list.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
      return `${protocol}://${host}`;
    }

    if (host) {
      console.warn(`[site] хост ${host} не в списке своих — беру localhost.`);
    }
  } catch {
    // Called outside a request scope (build-time metadata, scripts).
  }

  return 'http://localhost:3000';
}

/**
 * Свои хосты.
 *
 * Настроенный `NEXT_PUBLIC_SITE_URL` попадает сюда сам: если он задан
 * правильно, до заголовков дело не доходит вовсе, а если задан и испорчен —
 * его хост всё равно неизвестен, и список остаётся единственной защитой.
 * Превью-развёртывания Vercel получают адрес вида `*.vercel.app`, поэтому
 * суффикс, а не точное совпадение: иначе каждая ветка ломала бы себе ссылки.
 */
function isOwnHost(host: string): boolean {
  const name = host.split(':')[0]!.toLowerCase();

  if (name === 'localhost' || name === '127.0.0.1') return true;
  if (name === 'birdunyo.uz' || name.endsWith('.birdunyo.uz')) return true;
  if (name.endsWith('.vercel.app')) return true;

  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) {
    try {
      return new URL(configured).hostname.toLowerCase() === name;
    } catch {
      return false;
    }
  }

  return false;
}
