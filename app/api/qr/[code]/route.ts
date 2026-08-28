import { NextResponse } from 'next/server';
import { getOrderByCode } from '@/lib/db';
import { cardUrl, qrSvg } from '@/lib/qr';
import { siteOrigin } from '@/lib/site-origin';

/**
 * GET /api/qr/8FJ29K[?dark=%23191512&size=512]
 *
 * Returns the QR as SVG so print shops can scale it without artefacts.
 * Codes are immutable once issued, which makes this aggressively cacheable —
 * the printed card cannot change, so neither can its QR.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const order = await getOrderByCode(code);

  // Отменённая открытка отвечает так же, как несуществующая. Иначе маршрут
  // остаётся оракулом: подтверждает, что код живой, для заказа, который
  // магазин уже закрыл, — а `lib/db/types.ts` описывает отмену как надгробие.
  if (!order || order.status === 'CANCELLED') {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const size = Number(url.searchParams.get('size') ?? 512);

  // Цвет проверяется здесь, хотя библиотека проверяет его тоже.
  //
  // `qrcode` действительно отвергает и «red», и попытку внедрить разметку —
  // это проверено, инъекции в SVG тут нет. Но отвергает он исключением, а
  // исключение из необёрнутого обработчика — это 500, и в разработке ещё и со
  // стеком вызовов наружу. Кривой параметр в ссылке не повод показывать
  // человеку ошибку сервера: берём цвет по умолчанию.
  const requested = url.searchParams.get('dark');
  const dark = requested && /^#[0-9a-fA-F]{3,8}$/.test(requested) ? requested : '#191512';

  let svg: string;
  try {
    svg = await qrSvg(cardUrl(await siteOrigin(), order.code), {
      dark,
      light: '#00000000',
      width: Number.isFinite(size) ? Math.min(Math.max(size, 128), 2048) : 512,
    });
  } catch (error) {
    console.error(`[qr] не удалось нарисовать код: ${(error as Error).message}`);
    return NextResponse.json({ error: 'Could not render the QR code' }, { status: 500 });
  }

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
    },
  });
}
