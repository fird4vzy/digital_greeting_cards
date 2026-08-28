import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  ALLOWED_TRANSITIONS,
  ORDER_STATUSES,
  canTransition,
  isDeletable,
} from '../lib/db/types.ts';
import { photoSchema } from '../lib/card/schema.ts';

/**
 * Правила заказа, которые раньше держались на том, что таких кнопок нет в
 * интерфейсе.
 *
 * `PATCH /api/orders/[id]` принимал любую пару статусов, и `CANCELLED` —
 * задуманный надгробием, потому что бирка уже напечатана и роздана, — снимался
 * обратно одним запросом. Маршрут удалён, таблица переходов добавлена; тест
 * следит, чтобы её не «упростили» обратно.
 */

describe('переходы статусов', () => {
  test('отмена необратима', () => {
    for (const to of ORDER_STATUSES) {
      if (to === 'CANCELLED') continue;
      assert.equal(
        canTransition('CANCELLED', to),
        false,
        `CANCELLED → ${to} не должен разрешаться: код уже на бирке`,
      );
    }
  });

  test('из опубликованного можно только отменить', () => {
    assert.deepEqual([...ALLOWED_TRANSITIONS.PUBLISHED], ['CANCELLED']);
    assert.equal(canTransition('PUBLISHED', 'NEW'), false);
    assert.equal(canTransition('PUBLISHED', 'READY'), false);
  });

  test('публиковать можно только из «готово»', () => {
    const canPublish = ORDER_STATUSES.filter((from) => canTransition(from, 'PUBLISHED'));
    assert.deepEqual(canPublish, ['READY', 'PUBLISHED']);
  });

  test('отменить можно из любого живого статуса', () => {
    for (const from of ORDER_STATUSES) {
      if (from === 'CANCELLED') continue;
      assert.equal(canTransition(from, 'CANCELLED'), true, `${from} → CANCELLED должен быть можно`);
    }
  });

  test('переход в самого себя — не ошибка', () => {
    for (const status of ORDER_STATUSES) {
      assert.equal(canTransition(status, status), true);
    }
  });

  test('в таблице описан каждый статус и нет выдуманных', () => {
    assert.deepEqual(Object.keys(ALLOWED_TRANSITIONS).sort(), [...ORDER_STATUSES].sort());
    for (const [from, targets] of Object.entries(ALLOWED_TRANSITIONS)) {
      for (const to of targets) {
        assert.ok(ORDER_STATUSES.includes(to), `${from} → ${to}: такого статуса нет`);
      }
    }
  });
});

describe('удаление заказа', () => {
  test('опубликованный не удаляется', () => {
    assert.equal(isDeletable({ status: 'PUBLISHED', publishedAt: null }), false);
  });

  test('когда-то опубликованный не удаляется даже после возврата назад', () => {
    // Код мог быть напечатан в те часы, что открытка была живой.
    assert.equal(isDeletable({ status: 'READY', publishedAt: '2026-08-01T10:00:00Z' }), false);
    assert.equal(isDeletable({ status: 'CANCELLED', publishedAt: '2026-08-01T10:00:00Z' }), false);
  });

  test('никогда не публиковавшийся удаляется', () => {
    assert.equal(isDeletable({ status: 'NEW', publishedAt: null }), true);
  });
});

describe('источник фотографии', () => {
  const photo = (url: string) => photoSchema.safeParse({ id: 'p1', url });

  test('принимаются те схемы, что действительно используются', () => {
    assert.ok(photo('data:image/jpeg;base64,/9j/4AAQ').success);
    assert.ok(photo('data:image/webp;base64,UklGRg').success);
    // Заглушки из lib/utils/placeholder.ts.
    assert.ok(photo('data:image/svg+xml;utf8,%3Csvg%3E').success);
    assert.ok(photo('https://example.com/a.jpg').success);
    assert.ok(photo('/w/_covers/tebe.jpg').success);
  });

  test('чужие схемы отвергаются', () => {
    assert.equal(photo('javascript:alert(1)').success, false);
    assert.equal(photo('data:text/html;base64,PHNjcmlwdD4=').success, false);
    assert.equal(photo('http://example.com/a.jpg').success, false);
    assert.equal(photo('  data:image/png;base64,x').success, false);
  });

  test('ссылка длиннее потолка отвергается до того, как попадёт в базу', () => {
    // Тридцать таких строк проходили проверку, и спасал только лимит тела
    // запроса у Vercel — чужая настройка, которой на своём хостинге нет.
    const huge = `data:image/png;base64,${'A'.repeat(900_000)}`;
    assert.equal(photo(huge).success, false);
  });
});
