import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { adminOnly } from '@/lib/auth/guard';
import { MAX_CARD_BYTES } from '@/lib/db/card-files';

/**
 * ТОКЕН НА ЗАГРУЗКУ ТЯЖЁЛОГО ФАЙЛА ОТКРЫТКИ.
 *
 * Байты сюда не приходят: браузер берёт короткий подписанный токен и грузит
 * файл прямо в хранилище, минуя функцию. Ради этого маршрут и существует — у
 * Vercel тело запроса ограничено 4,5 МБ, и до сих пор видео и звук трёх работ
 * из семи привязать к заказу было нельзя вообще ничем.
 *
 * **Здесь, в отличие от фотографий заказчика, сессия обязательна.** Форму
 * заказа заполняет человек с улицы, и там вход невозможен по смыслу; открытку
 * же загружает оператор, у которого сессия есть. Открытый маршрут, принимающий
 * произвольные типы файлов, был бы бесплатным файлохранилищем для интернета —
 * а произвольные типы тут нужны: у открыток бывает и видео, и шрифты, и звук.
 *
 * Ограничения частоты нет намеренно: за маршрутом стоит `adminOnly`, то есть
 * известный человек с паролем, а папка открытки — это два-три десятка файлов
 * подряд, и любое разумное окно он бы пробил на первой же загрузке.
 */

export async function POST(request: Request): Promise<Response> {
  const denied = await adminOnly();
  if (denied) return denied;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: 'Blob storage is not configured' }, { status: 501 });
  }

  const body = (await request.json().catch(() => null)) as HandleUploadBody | null;
  if (!body) return Response.json({ error: 'Invalid request' }, { status: 400 });

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        // Типы не перечисляем: открытка — чужая вёрстка, и в ней бывает всё,
        // от woff2 до mp4. Границу держит сессия, а не список расширений.
        maximumSizeInBytes: MAX_CARD_BYTES,
        addRandomSuffix: true,
      }),
      // На localhost не вызывается — хранилищу некуда достучаться. Поэтому
      // запись в базу делает не он, а отдельный запрос от браузера после
      // загрузки: полагаться на этот вызов значит терять файлы при разработке.
      onUploadCompleted: async () => {},
    });

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}
