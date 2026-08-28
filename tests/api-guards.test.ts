import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Матрица прав: у какого маршрута есть проверка сессии, у какого нет.
 *
 * **Этот тест — про то, как проект однажды сломался.** Посредник в `proxy.ts`
 * намеренно не трогает `/api/`, значит граница проходит внутри каждого
 * обработчика, и каждый должен помнить о ней сам. Четыре из девяти не
 * вспомнили, и `GET /api/orders` отдавал всю книгу заказов — имена, телефоны,
 * письма, фотографии — любому, кто открыл девтулзы на `/create` и увидел
 * адрес. Ничто в коде не делало пропуск заметным: он выглядел ровно как
 * честный публичный маршрут.
 *
 * Проверка нарочно текстовая, а не через вызов обработчиков. Импортировать их
 * значит тянуть `next/server`, базу и половину приложения — тест стал бы
 * тяжёлым и хрупким ровно там, где нужен дешёвый и въедливый. Здесь важно не
 * «что вернёт маршрут», а «помнит ли он про сессию вообще», и это видно по
 * исходнику.
 *
 * **Как добавить новый маршрут.** Либо поставить в него `adminOnly()`, либо
 * вписать сюда, в PUBLIC, вместе с причиной. Третьего варианта нет: тест
 * упадёт, и упадёт он на ревью, а не на клиентских данных.
 */

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');

/**
 * Маршруты, открытые намеренно. Каждый — с обоснованием, потому что список
 * исключений без причин через полгода перестаёт быть списком исключений.
 */
const PUBLIC: Record<string, string> = {
  'app/api/orders/route.ts':
    'POST создаёт заказ — это и есть форма заказчика. GET внутри закрыт adminOnly, ' +
    'POST ограничен по частоте.',
  'app/api/cards/[code]/route.ts':
    'Открытка по коду. Код и есть право доступа: его печатают на бирке и отдают человеку.',
  'app/api/qr/[code]/route.ts':
    'QR печатной бирки. Тот же код; отменённый заказ отдаёт 404.',
  'app/api/works/[id]/qr/route.ts':
    'QR витринной работы. Ничего личного — работы сделаны для показа.',
  'app/api/telegram/webhook/route.ts':
    'Сюда стучится Telegram, а не человек. Право доступа — секрет в заголовке; ' +
    'без TELEGRAM_WEBHOOK_SECRET маршрут выключен целиком.',
  'app/api/health/route.ts':
    'Пинг для мониторинга: ходит без куки. Наружу отдаёт только «да/нет».',
  'app/u/[code]/[...path]/route.ts':
    'Файлы рукописной открытки. Тот же код, что у /c/; отдаются в песочнице CSP.',
};

function routeFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) routeFiles(full, found);
    else if (entry.name === 'route.ts') found.push(full);
  }
  return found;
}

const routes = routeFiles(join(root, 'app'))
  .map((file) => relative(root, file).split(sep).join('/'))
  .sort();

describe('каждый маршрут либо закрыт, либо объявлен публичным', () => {
  test('маршруты вообще нашлись', () => {
    // Страховка от того, что тест «проходит», потому что ничего не проверил.
    assert.ok(routes.length >= 7, `найдено маршрутов: ${routes.length}`);
  });

  for (const route of routes) {
    test(route, () => {
      const source = readFileSync(join(root, route), 'utf8');
      const guarded = source.includes('adminOnly(');
      const declaredPublic = route in PUBLIC;

      if (guarded && declaredPublic) {
        // Не ошибка сама по себе — так устроен /api/orders, где GET закрыт, а
        // POST открыт, — но причина обязана это называть.
        assert.match(
          PUBLIC[route]!,
          /adminOnly|закрыт/,
          `${route} и закрыт, и в PUBLIC — причина должна объяснять, какая часть открыта`,
        );
        return;
      }

      assert.ok(
        guarded || declaredPublic,
        `${route} не проверяет сессию и не объявлен публичным.\n` +
          'Поставьте adminOnly() или впишите маршрут в PUBLIC с причиной.',
      );
    });
  }

  test('в PUBLIC нет записей про удалённые маршруты', () => {
    for (const declared of Object.keys(PUBLIC)) {
      assert.ok(
        routes.includes(declared),
        `${declared} есть в PUBLIC, но такого маршрута нет — уберите запись`,
      );
    }
  });
});

describe('серверные действия админки проверяют сессию сами', () => {
  // Server action — это POST-эндпоинт, до которого можно достучаться, зная
  // его идентификатор, ни разу не открыв страницу, на которой он живёт.
  // Поэтому проверка в разметке страницы ничего не значит.
  for (const file of ['app/admin/actions.ts', 'app/admin/templates/actions.ts']) {
    test(file, () => {
      const source = readFileSync(join(root, file), 'utf8');
      const exported = [...source.matchAll(/export async function (\w+)/g)].map((m) => m[1]!);

      assert.ok(exported.length > 0, `в ${file} не нашлось экспортированных действий`);
      assert.ok(
        source.includes('requireAdmin'),
        `${file} не вызывает requireAdmin ни разу`,
      );

      // Каждое действие должно звать requireAdmin в своём теле, а не «файл
      // вообще где-то зовёт».
      const bodies = source.split(/export async function /).slice(1);
      for (const body of bodies) {
        const name = /^(\w+)/.exec(body)![1]!;
        assert.match(
          body.slice(0, 600),
          /requireAdmin\(\)/,
          `${file}: ${name} не начинается с requireAdmin()`,
        );
      }
    });
  }
});
