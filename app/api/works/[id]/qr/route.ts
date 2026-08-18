import { NextResponse } from 'next/server';
import { qrSvg } from '@/lib/qr';
import { siteOrigin } from '@/lib/site-origin';
import { getWork } from '@/lib/works';

/**
 * GET /api/works/tebe/qr[?size=320&dark=%23191512]
 *
 * QR ведёт на страницу работы, а не на сам файл: страница переживёт смену
 * имени входного файла, а напечатанный код — нет.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const work = getWork(id);

  if (!work) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const url = new URL(request.url);
  const dark = url.searchParams.get('dark') ?? '#191512';
  const size = Number(url.searchParams.get('size') ?? 512);

  const svg = await qrSvg(`${await siteOrigin()}/works/${work.id}`, {
    dark,
    light: '#00000000',
    width: Number.isFinite(size) ? Math.min(Math.max(size, 128), 2048) : 512,
  });

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
