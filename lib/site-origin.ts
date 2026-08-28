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
    if (host) {
      const protocol =
        list.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
      return `${protocol}://${host}`;
    }
  } catch {
    // Called outside a request scope (build-time metadata, scripts).
  }

  return 'http://localhost:3000';
}
