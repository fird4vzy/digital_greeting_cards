'use client';

import { upload } from '@vercel/blob/client';
import type { Photo } from '@/lib/card/schema';

/**
 * Подготовка снимка на устройстве и его отправка в хранилище.
 *
 * Телефоны отдают файлы по 4–12 МБ; открытка с шестью такими — запрос на
 * пятьдесят мегабайт и мучение на магазинном вайфае. Уменьшение до 1600 px по
 * длинной стороне и перекодирование в JPEG прямо в браузере превращает это в
 * 200–400 КБ на снимок ещё до того, как хоть один байт покинет устройство.
 *
 * **Дальше снимок идёт в объектное хранилище, а не в заказ.** До этого он
 * ехал data-URL'ом внутри тела запроса и там же и оставался — base64 прямо в
 * строке заказа. Две беды разом: тело запроса у Vercel ограничено 4,5 МБ, а
 * страница очереди читала эти строки со всеми снимками сразу, и её вес
 * измерялся мегабайтами ответа. Теперь браузер грузит файл напрямую, а в
 * заказ уезжает адрес.
 *
 * Схема `Photo` принимает и адрес, и data-URL — так было с самого начала.
 * Поэтому старые заказы читаются как читались, переносить ничего не нужно, и
 * запасной путь ниже не требует ни одной уступки в остальном коде.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

/** Ужатый снимок до того, как он куда-либо отправлен. */
type Prepared = { blob: Blob; width: number; height: number };

/**
 * Жаловаться один раз за загрузку страницы, а не на каждый снимок.
 *
 * Заказ несёт до двенадцати фотографий; двенадцать одинаковых строк в консоли
 * прячут сообщение в собственном повторении.
 */
let warnedAboutStorage = false;

export async function prepareImage(file: File, id: string): Promise<Photo | null> {
  if (!file.type.startsWith('image/')) return null;

  const prepared = await downscale(file);
  if (!prepared) return null;

  return {
    id,
    url: await store(prepared, id),
    width: prepared.width,
    height: prepared.height,
    alt: '',
  };
}

/**
 * Отдаёт адрес снимка: из хранилища, а при его отсутствии — data-URL.
 *
 * Запасной путь нужен не для красоты. Хранилище включается в панели Vercel
 * отдельным действием, и между выкладкой этого кода и включением всегда есть
 * окно; на локальной машине его нет вовсе. Без отката форма в этом окне
 * просто перестала бы принимать фотографии — то есть выкладка ломала бы
 * работающий продукт до тех пор, пока человек не нажмёт кнопку в чужой панели.
 */
async function store(prepared: Prepared, id: string): Promise<string> {
  try {
    const result = await upload(`orders/${id}.jpg`, prepared.blob, {
      access: 'public',
      contentType: 'image/jpeg',
      handleUploadUrl: '/api/photos/upload',
    });
    return result.url;
  } catch (error) {
    if (!warnedAboutStorage) {
      warnedAboutStorage = true;
      console.warn(
        '[photos] хранилище недоступно, снимки поедут внутри заказа: ' +
          `${(error as Error).message}. Это работает, но заказ станет тяжёлым — ` +
          'включите Blob в панели Vercel и задайте BLOB_READ_WRITE_TOKEN.',
      );
    }
    return blobToDataUrl(prepared.blob);
  }
}

/** Уменьшает и перекодирует. Ничего не отправляет. */
async function downscale(file: File): Promise<Prepared | null> {
  const bitmap = await loadBitmap(file);
  if (!bitmap) return null;

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(bitmap, 0, 0, width, height);
  if ('close' in bitmap) bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', QUALITY);
  });

  return blob ? { blob, width, height } : null;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fall through to the <img> path — some browsers reject certain formats.
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}
