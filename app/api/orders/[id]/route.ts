import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getOrder, updateOrder } from '@/lib/db';
import { ORDER_STATUSES } from '@/lib/db/types';
import { composeConfigForOrder } from '@/lib/card/service';

const patchSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  templateId: z.string().optional(),
  message: z.string().optional(),
  notes: z.string().optional(),
  /** Recompose the card from the current order fields. */
  regenerate: z.boolean().optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid patch' }, { status: 400 });
  }

  const existing = await getOrder(id);
  if (!existing) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const { regenerate, ...patch } = parsed.data;
  const merged = { ...existing, ...patch };

  const order = await updateOrder(id, {
    ...patch,
    // Publishing without a composed card would produce an empty page, so
    // compose implicitly whenever one is missing.
    ...(regenerate || (patch.status === 'PUBLISHED' && !existing.config)
      ? { config: composeConfigForOrder(merged) }
      : {}),
  });

  return NextResponse.json({ order });
}
