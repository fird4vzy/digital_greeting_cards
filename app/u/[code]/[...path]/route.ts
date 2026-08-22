import { getCardFileStore, getOrderByCode } from '@/lib/db';

/**
 * Отдаёт файлы открытки, написанной руками.
 *
 * Отдельный путь `/u/…`, а не `/c/<код>/…`, ровно по одной причине: страница
 * открытки показывает эти файлы во фрейме, а фрейм должен получить **чужой,
 * непрозрачный origin**. Живи файлы под тем же путём, они делили бы адрес со
 * страницей, и `sandbox` терял бы смысл.
 *
 * **Доступ.** Файлы отдаются для любого неотменённого заказа, а не только для
 * опубликованного, — тем же доводом, что и черновик открытки: код угадать
 * нельзя, а оператору надо посмотреть работу до публикации. Публичный смысл
 * при этом сохраняет `/c/<код>`: он остаётся строго для опубликованных.
 *
 * Заголовок `Access-Control-Allow-Origin` обязателен и не является
 * послаблением: фрейм с непрозрачным origin запрашивает шрифты как
 * межсайтовые, и без заголовка чужая вёрстка тихо рисуется не тем шрифтом.
 * Ровно та же причина, что и в разделе «Наши работы».
 */

type Params = { params: Promise<{ code: string; path: string[] }> };

export async function GET(_request: Request, { params }: Params) {
  const { code, path } = await params;

  const order = await getOrderByCode(code);
  if (!order || order.status === 'CANCELLED') {
    return new Response('Not found', { status: 404 });
  }

  const store = await getCardFileStore();
  const file = await store.read(order.id, path.join('/'));
  if (!file) return new Response('Not found', { status: 404 });

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      'Content-Type': file.mediaType,
      'Content-Length': String(file.bytes.length),
      'Access-Control-Allow-Origin': '*',
      // Открытка живёт по постоянному адресу, но оператор её переписывает,
      // пока заказ в работе. Поэтому кеш короткий и с проверкой, а не годовой.
      'Cache-Control': 'public, max-age=60, must-revalidate',
      // Тип берётся из расширения при загрузке; браузеру не надо его угадывать.
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
