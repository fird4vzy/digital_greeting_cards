import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { blobUrlsOf, isStoredBlob } from '../lib/storage/blob-urls.ts';

/**
 * Что именно стирается при удалении заказа.
 *
 * Проверяется здесь не «работает ли `del`» — это чужой код, — а тот единственный
 * кусок, где ошибка стоит дорого: **какие адреса мы считаем своими**.
 *
 * Ошибка в обе стороны плохая, но по-разному. Признать своим чужой адрес —
 * значит по чьей-то просьбе пойти удалять что-то на постороннем хосте. Не
 * признать свой — оставить чужие фотографии лежать по публичной ссылке после
 * того, как человек попросил их убрать; про этот случай и написан весь
 * `PRIVACY.md`.
 *
 * Та же проверка хоста стоит на приёме адреса при загрузке — там она мешает
 * `/u/<код>` превратиться в открытый прокси. Один и тот же вопрос, два места,
 * и промах в любом из них дорог.
 */

describe('свой адрес отличается от чужого', () => {
  test('адрес хранилища — свой', () => {
    assert.ok(isStoredBlob('https://abc123.public.blob.vercel-storage.com/orders/p1.jpg'));
  });

  test('чужой хост — не свой', () => {
    assert.ok(!isStoredBlob('https://evil.example.com/p1.jpg'));
  });

  test('хост, лишь начинающийся как наш, — не свой', () => {
    // Классическая подделка: строка содержит наше имя, но домен чужой.
    assert.ok(!isStoredBlob('https://blob.vercel-storage.com.evil.com/p1.jpg'));
  });

  test('http вместо https — не свой', () => {
    assert.ok(!isStoredBlob('http://abc.public.blob.vercel-storage.com/p1.jpg'));
  });

  test('data-URL — не свой', () => {
    // Старые заказы носят снимки прямо в строке. Стирать там нечего, и
    // попытка была бы ошибкой на каждом дореформенном заказе.
    assert.ok(!isStoredBlob('data:image/jpeg;base64,/9j/4AAQ'));
  });

  test('не адрес вообще — не свой, и не исключение', () => {
    assert.ok(!isStoredBlob('просто строка'));
    assert.ok(!isStoredBlob(''));
  });
});

describe('список адресов заказа', () => {
  const photo = (url: string) => ({ id: url, url, alt: '' });

  test('берёт фотографии и файлы открытки, отбрасывая чужое', () => {
    const urls = blobUrlsOf(
      {
        photos: [
          photo('https://a.public.blob.vercel-storage.com/1.jpg'),
          photo('data:image/jpeg;base64,/9j/4AAQ'),
          photo('https://cdn.example.com/2.jpg'),
        ],
      },
      ['https://a.public.blob.vercel-storage.com/video.mp4', 'https://evil.example.com/x.mp4'],
    );

    assert.deepEqual(urls, [
      'https://a.public.blob.vercel-storage.com/1.jpg',
      'https://a.public.blob.vercel-storage.com/video.mp4',
    ]);
  });

  test('заказ без файлов даёт пустой список, а не падает', () => {
    assert.deepEqual(blobUrlsOf({ photos: [] }), []);
  });
});
