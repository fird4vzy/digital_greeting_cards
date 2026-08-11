import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder, listOrders } from '@/lib/db';
import { ORDER_STATUSES } from '@/lib/db/types';
import { photoSchema } from '@/lib/card/schema';
import { composeConfigForOrder } from '@/lib/card/service';
import { DEFAULT_TEMPLATE_ID } from '@/templates';

const draftSchema = z.object({
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    shop: z.string().optional(),
  }),
  recipient: z.object({ name: z.string().min(1), relationship: z.string().min(1) }),
  occasion: z.string().min(1),
  mood: z.string().min(1),
  message: z.string().default(''),
  photos: z.array(photoSchema).max(30).default([]),
  moments: z
    .array(z.object({ date: z.string(), title: z.string(), text: z.string().optional() }))
    .default([]),
  memories: z.array(z.object({ label: z.string(), text: z.string() })).default([]),
  wishes: z.array(z.string()).default([]),
  templateId: z.string().default(DEFAULT_TEMPLATE_ID),
  notes: z.string().optional(),
  /** Compose and publish in one call — used by the customer creation flow. */
  publish: z.boolean().default(false),
});

/** GET /api/orders?status=NEW&search=alina — the shop-side queue. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  const orders = await listOrders({
    status: ORDER_STATUSES.includes(status as never) ? (status as never) : undefined,
    search: url.searchParams.get('search') ?? undefined,
    limit: Number(url.searchParams.get('limit') ?? 50),
  });

  return NextResponse.json({ orders });
}

/** POST /api/orders — create an order, optionally composing and publishing it. */
export async function POST(request: Request) {
  const parsed = draftSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid order' },
      { status: 400 },
    );
  }

  const { publish, ...draft } = parsed.data;

  const order = await createOrder({ ...draft, status: 'NEW', config: null });

  if (!publish) {
    return NextResponse.json({ order }, { status: 201 });
  }

  // Compose through the same service the admin uses, then publish.
  const { updateOrder } = await import('@/lib/db');
  const published = await updateOrder(order.id, {
    config: composeConfigForOrder(order),
    status: 'PUBLISHED',
  });

  return NextResponse.json({ order: published ?? order }, { status: 201 });
}
