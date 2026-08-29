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
 * пройдёт никогда, а пофайльно пройдёт почти всё. Распаковщик архива тут
 * ничего бы не спас и добавил бы зависимость.
 *
 * **Два способа положить файл.** Маленький приезжает сюда байтами, как раньше.
 * Тяжёлый браузер грузит прямо в хранилище (токен — в `token/route.ts`) и
 * присылает сюда только адрес; тогда в теле запроса вместо `file` лежат `url`
 * и `size`. Это и снимает предел, из-за которого видео и звук трёх работ из
 * семи привязать к заказу было нельзя вообще ничем.
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
  const url = String(form.get('url') ?? '');

  if (!orderId) return bad('orderId is required');
  if (!url && !(file instanceof File)) return bad('file or url is required');

  const sourceName = file instanceof File ? file.name : '';
  const path = normalisePath(rawPath || sourceName);
  if (!path) return bad(`Недопустимый путь: ${rawPath || sourceName}`);

  const order = await getOrder(orderId);
  if (!order) return bad('Заказ не найден', 404);

  if (url) return registerRemote(order.id, path, url, Number(form.get('size') ?? 0));

  // Ниже — путь байтами. Сюда попадаем, только когда адреса не было, а тогда
  // `file` обязан быть файлом: проверка на это стоит выше.
  if (!(file instanceof File)) return bad('file is required');

  if (file.size > MAX_FILE_BYTES) {
    return bad(
      `«${path}» весит ${(file.size / 1024 / 1024).toFixed(1)} МБ, а через этот запрос ` +
        `проходит не больше ${MAX_FILE_BYTES / 1024 / 1024} МБ. Такие файлы идут в хранилище ` +
        'напрямую — включите Blob в Vercel и задайте BLOB_READ_WRITE_TOKEN, ' +
        'и браузер отправит его туда сам.',
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
 * Записывает адрес файла, уже лежащего в хранилище.
 *
 * **Адрес проверяется, а не принимается на слово, и это не формальность.**
 * `/u/<код>/…` забирает файл по этому адресу и отдаёт его со своего домена.
 * Прими мы сюда произвольную ссылку — и маршрут стал бы открытым прокси:
 * чужая страница поехала бы с birdunyo.uz, а трафик к ней считался бы нам.
 * Поэтому хост обязан принадлежать хранилищу, а сам адрес — быть http(s).
 */
async function registerRemote(orderId: string, path: string, url: string, size: number) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return bad('Некорректный адрес файла');
  }

  const fromBlob =
    parsed.protocol === 'https:' && parsed.hostname.endsWith('.blob.vercel-storage.com');
  if (!fromBlob) return bad('Адрес не из хранилища');

  if (!Number.isFinite(size) || size <= 0) return bad('Не указан размер файла');

  const store = await getCardFileStore();
  const existing = await store.list(orderId);
  const already = existing
    .filter((entry) => entry.path !== path)
    .reduce((sum, entry) => sum + entry.size, 0);

  if (already + size > MAX_CARD_BYTES) {
    return bad(`Открытка не помещается: предел ${MAX_CARD_BYTES / 1024 / 1024} МБ на заказ.`, 413);
  }

  try {
    const stored = await store.putRemote(orderId, path, mediaTypeFor(path), parsed.toString(), size);
    return Response.json({ file: stored });
  } catch (error) {
    // Непринятая миграция — самая вероятная причина, и она поправима руками.
    // Пятисотка с трассировкой в логе оставила бы оператора со словом
    // «ошибка»; здесь он читает, что именно сделать.
    return bad((error as Error).message, 503);
  }
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
