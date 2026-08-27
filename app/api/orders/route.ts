import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder, listOrders } from '@/lib/db';
import { ORDER_STATUSES } from '@/lib/db/types';
import { photoSchema } from '@/lib/card/schema';
import { composeConfigForOrderAnywhere } from '@/lib/card/compose-server';
import { notifyNewOrder } from '@/lib/notify/telegram';
import { siteOrigin } from '@/lib/site-origin';
import { DEFAULT_TEMPLATE_ID } from '@/templates';
import { listWorks } from '@/lib/works';

/** Идентификаторы работ — чтобы «хочу как эта» нельзя было прислать наугад. */
const WORK_IDS = new Set(listWorks().map((work) => work.id));

const draftSchema = z.object({
  customer: z
    .object({
      name: z.string().min(1),
      email: z.email().optional().or(z.literal('')),
      phone: z.string().optional(),
      shop: z.string().optional(),
    })
    // The shop has to be able to reach whoever ordered: an order it cannot
    // ask a question about is an order it cannot finish. Either channel will
    // do, but not neither.
    .refine((customer) => Boolean(customer.email?.trim() || customer.phone?.trim()), {
      message: 'Give a phone number or an email address',
      path: ['phone'],
    }),
  recipient: z.object({ name: z.string().min(1), relationship: z.string().min(1) }),
  occasion: z.string().min(1),
  mood: z.string().min(1),
  /**
   * Необязателен: заказ, приславший одно настроение старым способом, остаётся
   * валидным, а список тогда собирается из него в хранилище.
   */
  moods: z.array(z.string().min(1)).min(1).optional(),
  /** Language the card is written in — see lib/i18n/config.ts. */
  locale: z.string().default('ru'),
  message: z.string().default(''),
  photos: z.array(photoSchema).max(30).default([]),
  moments: z
    .array(z.object({ date: z.string(), title: z.string(), text: z.string().optional() }))
    .default([]),
  memories: z.array(z.object({ label: z.string(), text: z.string() })).default([]),
  wishes: z.array(z.string()).default([]),
  templateId: z.string().default(DEFAULT_TEMPLATE_ID),
  /**
   * Чего заказчик хочет вместо шаблона — своя идея словами или «как вот эта
   * ваша работа». Отсутствует, когда шаблон его устраивает.
   *
   * `workId` сверяется с реестром работ, а не принимается на слово: иначе
   * оператор увидел бы ссылку на работу, которой нет, и не понял бы, чего от
   * него хотят. Незнакомый id — отказ, а не тихое сохранение мусора.
   */
  wish: z
    .discriminatedUnion('kind', [
      z.object({ kind: z.literal('own'), text: z.string().min(1).max(4000) }),
      z.object({
        kind: z.literal('work'),
        workId: z.string().refine((id) => WORK_IDS.has(id), 'Unknown work'),
      }),
    ])
    .nullable()
    .default(null),
  notes: z.string().optional(),
  /** The customer's instructions to the shop. Never rendered into the card. */
  brief: z.string().max(4000).optional(),
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

  // The card is always composed, so the shop opens a finished draft rather
  // than an empty record and the customer can see something immediately.
  // `publish` decides only whether it is live: on the customer flow it is
  // false, and a person reviews the draft before a code goes onto a tag.
  // `moods` необязателен в контракте, а в заказе обязателен: клиент,
  // приславший одно настроение старым способом, получает список из него.
  const created = await createOrder({
    ...draft,
    moods: draft.moods ?? [draft.mood],
    // Ручная открытка привязывается позже, оператором и вручную.
    customEntry: null,
    status: 'NEW',
    config: null,
  });
  const config = await composeConfigForOrderAnywhere(created);

  const { updateOrder } = await import('@/lib/db');
  const order =
    (await updateOrder(created.id, {
      config,
      ...(publish ? { status: 'PUBLISHED' as const } : {}),
    })) ?? created;

  // After the order is safely stored: a notification is not worth failing on.
  await notifyNewOrder(order, await siteOrigin());

  return NextResponse.json({ order }, { status: 201 });
}
