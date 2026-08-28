import { adminOnly } from '@/lib/auth/guard';
import { getCardFileStore, getOrder, updateOrder } from '@/lib/db';
import {
  MAX_CARD_BYTES,
  MAX_FILE_BYTES,
  mediaTypeFor,
  normalisePath,
} from '@/lib/db/card-files';

/**
 * Приём открытки, написанной руками.
 *
 * Один файл за запрос, а не архив целиком, — и это не выбор, а следствие: у
 * Vercel тело запроса ограничено 4,5 МБ, поэтому папка на 9 МБ одним куском не
 * пройдёт никогда, а пофайльно пройдёт всё, кроме отдельных тяжёлых файлов.
 * Распаковщик архива тут ничего бы не спас и добавил бы зависимость.
 *
 * **Проверка сессии здесь обязательна.** Посредник закрывает `/admin`, но не
 * `/api/admin`: он про то, куда пускать браузер, а не про то, кому разрешать
 * запись. Без этой проверки маршрут был бы открыт всему интернету.
 */

const bad = (message: string, status = 400) =>
  Response.json({ error: message }, { status });

export async function POST(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;

  const form = await request.formData();
  const orderId = String(form.get('orderId') ?? '');
  const file = form.get('file');
  const rawPath = String(form.get('path') ?? '');

  if (!orderId) return bad('orderId is required');
  if (!(file instanceof File)) return bad('file is required');

  const path = normalisePath(rawPath || file.name);
  if (!path) return bad(`Недопустимый путь: ${rawPath || file.name}`);

  const order = await getOrder(orderId);
  if (!order) return bad('Заказ не найден', 404);

  if (file.size > MAX_FILE_BYTES) {
    return bad(
      `«${path}» весит ${(file.size / 1024 / 1024).toFixed(1)} МБ. ` +
        `Предел на файл — ${MAX_FILE_BYTES / 1024 / 1024} МБ: у Vercel тело запроса ограничено 4,5 МБ, ` +
        'поэтому такой файл не пройдёт ни этой формой, ни любой другой. Сожмите его или вынесите наружу.',
      413,
    );
  }

  const store = await getCardFileStore();
  const existing = await store.list(order.id);
  const already = existing
    .filter((entry) => entry.path !== path)
    .reduce((sum, entry) => sum + entry.size, 0);

  if (already + file.size > MAX_CARD_BYTES) {
    return bad(
      `Открытка не помещается: предел ${MAX_CARD_BYTES / 1024 / 1024} МБ на заказ.`,
      413,
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const stored = await store.put(order.id, path, mediaTypeFor(path), bytes);

  return Response.json({ file: stored });
}

/**
 * Назначает входной файл — тот, с которого открытка открывается.
 *
 * Отдельным действием, а не догадкой при загрузке: `index.html` в корне есть
 * не у всех (у одной из работ вход — `main.html`), и угадывать тут значит
 * иногда открывать не ту страницу.
 */
export async function PATCH(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;

  const { orderId, entry } = (await request.json()) as {
    orderId?: string;
    entry?: string | null;
  };

  if (!orderId) return bad('orderId is required');

  const order = await getOrder(orderId);
  if (!order) return bad('Заказ не найден', 404);

  if (entry === null || entry === '') {
    await updateOrder(order.id, { customEntry: null });
    return Response.json({ entry: null });
  }

  const path = normalisePath(String(entry));
  if (!path) return bad('Недопустимый путь');

  const store = await getCardFileStore();
  if (!(await store.read(order.id, path))) {
    return bad(`Файл «${path}» не загружен`, 404);
  }

  await updateOrder(order.id, { customEntry: path });
  return Response.json({ entry: path });
}

/** Убирает всю загруженную папку и возвращает заказ к сборке движком. */
export async function DELETE(request: Request) {
  const denied = await adminOnly();
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return bad('orderId is required');

  const order = await getOrder(orderId);
  if (!order) return bad('Заказ не найден', 404);

  const store = await getCardFileStore();
  const removed = await store.clear(order.id);
  await updateOrder(order.id, { customEntry: null });

  return Response.json({ removed });
}
