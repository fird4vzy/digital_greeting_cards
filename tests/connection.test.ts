import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { databaseChoice } from '../lib/db/connection.ts';

/**
 * К какой базе подключаемся.
 *
 * Проверяется потому, что ошибка здесь обнаруживается позже всех остальных: не
 * падением, а тем, что заказ «пропал» — или, наоборот, тем, что тестовое имя
 * оказалось в настоящей админке рядом с чужими телефонами. Второе уже
 * случалось: как только в `.env.local` появилась боевая строка, локальная
 * проверка формы начала писать в ту же базу, что и сайт.
 *
 * Две асимметричные гарантии, и обе важны в свою сторону:
 * вне продакшена база разработки **побеждает**, а в продакшене её не
 * существует — переменная, случайно попавшая в Vercel, не должна уводить
 * боевые заказы в чью-то песочницу.
 */

const PROD = 'postgres://prod';
const DEV = 'postgres://dev';

describe('выбор базы', () => {
  test('в разработке побеждает DATABASE_URL_DEV', () => {
    const choice = databaseChoice({
      NODE_ENV: 'development',
      DATABASE_URL: PROD,
      DATABASE_URL_DEV: DEV,
    } as NodeJS.ProcessEnv);

    assert.equal(choice.url, DEV);
    assert.equal(choice.isDev, true);
  });

  test('в продакшене DATABASE_URL_DEV не смотрится вообще', () => {
    const choice = databaseChoice({
      NODE_ENV: 'production',
      DATABASE_URL: PROD,
      DATABASE_URL_DEV: DEV,
    } as NodeJS.ProcessEnv);

    assert.equal(choice.url, PROD);
    assert.equal(choice.isDev, false);
  });

  test('без DATABASE_URL_DEV берётся обычная строка', () => {
    const choice = databaseChoice({
      NODE_ENV: 'development',
      DATABASE_URL: PROD,
    } as NodeJS.ProcessEnv);

    assert.equal(choice.url, PROD);
    assert.equal(choice.isDev, false);
  });

  test('пустая строка — это не заданная переменная', () => {
    // `DATABASE_URL_DEV=` в файле встречается чаще, чем кажется: строку
    // закомментировали наполовину. Пустое значение не должно уводить
    // подключение в никуда.
    const choice = databaseChoice({
      NODE_ENV: 'development',
      DATABASE_URL: PROD,
      DATABASE_URL_DEV: '   ',
    } as NodeJS.ProcessEnv);

    assert.equal(choice.url, PROD);
    assert.equal(choice.isDev, false);
  });

  test('без обеих переменных — ничего, и это не исключение', () => {
    const choice = databaseChoice({ NODE_ENV: 'development' } as NodeJS.ProcessEnv);
    assert.equal(choice.url, undefined);
    assert.equal(choice.isDev, false);
  });
});
