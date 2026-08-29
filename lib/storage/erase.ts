import 'server-only';

import { del } from '@vercel/blob';
import { isStoredBlob } from './blob-urls';

export { blobUrlsOf, isStoredBlob } from './blob-urls';

/**
 * СТИРАНИЕ ФАЙЛОВ ЗАКАЗА ИЗ ОБЪЕКТНОГО ХРАНИЛИЩА.
 *
 * Появилось не из общих соображений, а как прямое следствие переезда файлов
 * туда. Пока фотографии лежали data-URL'ом внутри строки заказа, а файлы
 * рукописной открытки — байтами в `card_files`, удаление заказа уносило с
 * собой всё: строка исчезала, `ON DELETE CASCADE` убирал файлы, и на этом
 * история человека заканчивалась.
 *
 * Теперь и то и другое живёт по постоянным публичным адресам, и удаление
 * строки на них не действует. Без этого модуля «удалить заказ» означало бы
 * «убрать его из панели», а снимки продолжали бы открываться по ссылке — кем
 * угодно и сколько угодно. Для чужих фотографий это не мелочь.
 *
 * Что именно считается своим файлом — в `blob-urls.ts`, отдельно и с тестами.
 */

export type EraseResult = { deleted: number; failed: number };

/**
 * Стирает переданные адреса. Ошибки считает, но не бросает.
 *
 * Падать здесь нельзя: стирание вызывается по ходу удаления заказа, и отказ
 * хранилища не должен оставлять запись в базе. Лучше удалить строку и
 * недосчитаться файла, чем оставить и то и другое — файл без заказа хотя бы не
 * связан ни с чьим именем.
 *
 * Уже отсутствующий адрес не считается ошибкой: повторный вызов должен быть
 * безобидным, иначе первая же неудача навсегда заблокировала бы вторую попытку.
 */
export async function eraseBlobs(urls: string[]): Promise<EraseResult> {
  const targets = [...new Set(urls.filter(isStoredBlob))];
  if (targets.length === 0 || !process.env.BLOB_READ_WRITE_TOKEN) {
    return { deleted: 0, failed: 0 };
  }

  const results = await Promise.allSettled(targets.map((url) => del(url)));

  const failed = results.filter((result) => result.status === 'rejected').length;
  if (failed > 0) {
    console.error(
      `[erase] не удалось стереть ${failed} из ${targets.length} файлов. ` +
        'Заказ удалён, файлы остались — их адреса больше нигде не записаны, ' +
        'убрать можно только в панели хранилища.',
    );
  }

  return { deleted: targets.length - failed, failed };
}
