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
  const dark = url.searchParams.get('dark') ?? '#191512';
  const size = Number(url.searchParams.get('size') ?? 512);

  const svg = await qrSvg(cardUrl(await siteOrigin(), order.code), {
    dark,
    light: '#00000000',
    width: Number.isFinite(size) ? Math.min(Math.max(size, 128), 2048) : 512,
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, immutable',
    },
  });
}
