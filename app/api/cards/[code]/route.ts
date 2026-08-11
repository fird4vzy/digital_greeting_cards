import { NextResponse } from 'next/server';
import { getOrderByCode } from '@/lib/db';
import { composeConfigForOrder } from '@/lib/card/service';

/**
 * GET /api/cards/8FJ29K
 *
 * The public read for a published card. Returns only the card configuration —
 * never the order, the customer or the shop. A card URL is effectively public
 * (it is printed and handed over), so nothing behind it may be sensitive.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const order = await getOrderByCode(code);

  if (!order || order.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  const config = order.config ?? composeConfigForOrder(order);

  return NextResponse.json(
    { code: order.code, config },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=300' } },
  );
}
