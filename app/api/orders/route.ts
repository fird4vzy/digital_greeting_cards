import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createOrder, listOrders } from '@/lib/db';
import { adminOnly } from '@/lib/auth/guard';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/security/rate-limit';
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
      /**
       * Телеграм заказчика — основной канал связи.
       *
       * `@` необязателен на входе и добавляется здесь: люди пишут и так и
       * так, а салону нужен один вид, чтобы вставлять в поиск не задумываясь.
       * Пустая строка приходит из формы, где поле не заполнили, и должна
       * проходить как «не указано», а не падать на проверке username.
       */
      telegram: z
        .string()
        .max(64)
        .optional()
        .transform((value) => value?.trim().replace(/^@+/, '') ?? '')
        .refine((value) => value === '' || /^[A-Za-z0-9_]{4,32}$/.test(value), {
          message: 'Похоже, это не username',
        })
        .transform((value) => (value === '' ? undefined : `@${value}`)),
      shop: z.string().optional(),
    })
    // The shop has to be able to reach whoever ordered: an order it cannot
    // ask a question about is an order it cannot finish. Either channel will
    // do, but not neither.
    //
    // Почта осталась в списке ради заказов, принятых до 28 августа: форма её
    // больше не спрашивает, но старый заказ с одной лишь почтой — всё ещё
    // заказ, до которого можно дозвониться.
    .refine(
      (customer) =>
        Boolean(customer.telegram?.trim() || customer.phone?.trim() || customer.email?.trim()),
      { message: 'Give a phone number or a Telegram username', path: ['phone'] },
    ),
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
  /**
   * Ключ повторной отправки. Клиент выдаёт его один раз на черновик и
   * присылает при каждой попытке; повторная отправка возвращает уже созданный
   * заказ вместо второго такого же.
   */
  requestId: z.string().uuid().optional(),
});

/**
 * GET /api/orders?status=NEW&search=alina — очередь заказов для магазина.
 *
 * **Только для оператора.** До 28 августа проверки здесь не было вообще, и
 * маршрут отдавал весь список кому угодно: имена, телефоны, телеграмы,
 * приватные письма получателям и фотографии — целиком, в теле ответа. Хуже
 * того, `?search=+998` превращал его в адресный поиск по телефону.
 */
export async function GET(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;

  const url = new URL(request.url);
  const status = url.searchParams.get('status');

  const orders = await listOrders({
    status: ORDER_STATUSES.includes(status as never) ? (status as never) : undefined,
    search: url.searchParams.get('search') ?? undefined,
    limit: pageSize(url.searchParams.get('limit')),
  });

  return NextResponse.json({ orders });
}

/**
 * Сколько заказов отдавать за раз.
 *
 * Отдельная функция ради одного знака: `Number('')` — это `0`, ноль ложен, а
 * ложный лимит в хранилище означал «без LIMIT». То есть `?limit=` (пустой)
 * возвращал таблицу целиком. Верхняя граница обязательна и сама по себе:
 * `Number.isFinite` пропускает `1e9`.
 */
function pageSize(raw: string | null): number {
  const requested = Math.floor(Number(raw));
  if (!Number.isFinite(requested) || requested <= 0) return 50;
  return Math.min(requested, 200);
}

/** POST /api/orders — create an order. Публикует не заказчик, а магазин. */
export async function POST(request: Request) {
  // Десять заказов в час с одного адреса. Живой заказчик оформляет один,
  // редко два; без потолка это была неограниченная запись в базу — каждый
  // заказ до тридцати фотографий — и неограниченный поток сообщений в
  // рабочую группу магазина.
  const attempt = await rateLimit(RATE_LIMITS.createOrder);
  if (!attempt.ok) return tooManyRequests(attempt);

  const parsed = draftSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid order' },
      { status: 400 },
    );
  }

  const { requestId, ...draft } = parsed.data;

  // The card is always composed, so the shop opens a finished draft rather
  // than an empty record and the customer can see something immediately.
  //
  // Заказ всегда создаётся со статусом NEW, и другого пути нет. Раньше тело
  // запроса принимало `publish: true` и заказ уходил в публикацию сразу;
  // форма слала `false`, но это уговор клиента, а не правило сервера, и
  // `curl` его не соблюдал. Обещание продукта — что магазин смотрит открытку
  // до того, как код попадёт на бирку, — держится теперь на одном месте:
  // `setOrderStatus` в `app/admin/actions.ts`, за проверкой сессии.
  //
  // `moods` необязателен в контракте, а в заказе обязателен: клиент,
  // приславший одно настроение старым способом, получает список из него.
  const seed = {
    ...draft,
    moods: draft.moods ?? [draft.mood],
    // Ручная открытка привязывается позже, оператором и вручную.
    customEntry: null,
    status: 'NEW' as const,
  };

  /**
   * Открытка собирается **до** вставки, и заказ пишется вместе с ней.
   *
   * Раньше это были две записи подряд: создать заказ, собрать конфиг из него,
   * дописать конфиг вторым запросом. Транзакции между ними нет, поэтому
   * падение сборки — удалённый шаблон, кривой рецепт — оставляло в базе заказ
   * с пустой открыткой, а заказчику отдавало 500. Такую строку потом не
   * отличить от нормальной: она выглядит как заказ, по коду не открывается
   * ничего, и никто об этом не узнает.
   *
   * Сборке нужны только поля черновика — `orderToStoryInput` не читает ни id,
   * ни код, — так что порядок был свободен, а не вынужден.
   */
  const config = await composeConfigForOrderAnywhere(seed);

  const order = await createOrder({ ...seed, config, idempotencyKey: requestId });

  // After the order is safely stored: a notification is not worth failing on.
  await notifyNewOrder(order, await siteOrigin());

  return NextResponse.json({ order }, { status: 201 });
}
