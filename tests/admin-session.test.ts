import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  constantTimeEqual,
  createAdminSession,
  verifyAdminPassword,
  verifyAdminSession,
} from '../lib/auth/admin.ts';

/**
 * Сессия админки.
 *
 * Первым здесь стоит тест на дыру, найденную аудитом 28 августа: без
 * `ADMIN_PASSWORD` в проде кука, подписанная строкой из этого же публичного
 * репозитория, открывала всю админку — при том что комментарий рядом обещал
 * обратное, а страница входа вежливо писала «не настроено».
 *
 * Тест воспроизводит ровно ту подделку, а не проверяет, что «функция
 * возвращает false»: подпись собирается тем же алгоритмом и тем же ключом,
 * каким её собрал бы посторонний, читавший исходники.
 */

const ORIGINAL = { ...process.env };

/**
 * `NODE_ENV` в типах Next объявлен только для чтения — из-за замены его на
 * литерал при сборке. В тестах менять его надо, и это единственное место,
 * где приведение оправдано: без него нельзя проверить самое важное — как
 * ведёт себя прод.
 *
 * Функция, а не сохранённая ссылка на `process.env`: `beforeEach` ниже
 * подменяет весь объект целиком, и ссылка, взятая один раз при загрузке
 * модуля, писала бы в отброшенную копию. Тест это и поймал — три проверки
 * прода молча шли в режиме разработки.
 */
function setEnv(key: string, value: string): void {
  (process.env as Record<string, string | undefined>)[key] = value;
}

beforeEach(() => {
  process.env = { ...ORIGINAL };
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_SESSION_SECRET;
});

/** Кука, подписанная ключом-заглушкой из репозитория. */
async function forgeWithLeakedKey(ttlMs = 3_600_000): Promise<string> {
  const payload = `v1.${Date.now() + ttlMs}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('development-only-unset-password'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${payload}.${Buffer.from(signature).toString('base64url')}`;
}

describe('в продакшене без ADMIN_PASSWORD', () => {
  beforeEach(() => {
    setEnv('NODE_ENV', 'production');
  });

  test('подделанная ключом из репозитория кука отвергается', async () => {
    assert.equal(await verifyAdminSession(await forgeWithLeakedKey()), false);
  });

  test('сессию нельзя выдать вовсе', async () => {
    await assert.rejects(createAdminSession(), /подписывать сессию нечем/);
  });

  test('любой пароль отвергается', async () => {
    assert.equal(await verifyAdminPassword('что угодно'), false);
    assert.equal(await verifyAdminPassword(''), false);
  });
});

describe('в продакшене с ADMIN_PASSWORD', () => {
  beforeEach(() => {
    setEnv('NODE_ENV', 'production');
    process.env.ADMIN_PASSWORD = 'настоящий-пароль';
  });

  test('своя сессия принимается', async () => {
    const session = await createAdminSession();
    assert.equal(await verifyAdminSession(session.value), true);
  });

  test('подделанная кука по-прежнему отвергается', async () => {
    assert.equal(await verifyAdminSession(await forgeWithLeakedKey()), false);
  });

  test('верный пароль принимается, неверный — нет', async () => {
    assert.equal(await verifyAdminPassword('настоящий-пароль'), true);
    assert.equal(await verifyAdminPassword('настоящий-парол'), false);
    assert.equal(await verifyAdminPassword('настоящий-пароль '), false);
  });

  test('просроченная сессия отвергается, даже подписанная верно', async () => {
    // Срок проверяется до подписи — иначе валидную, но истёкшую куку можно
    // было бы переигрывать.
    const expired = await createAdminSession();
    const past = expired.value.replace(/^v1\.\d+/, `v1.${Date.now() - 1000}`);
    assert.equal(await verifyAdminSession(past), false);
  });

  test('мусор вместо куки отвергается и ничего не роняет', async () => {
    for (const junk of ['', 'v1', 'v1.', 'v2.999999999999.abc', 'нет точек', '...']) {
      assert.equal(await verifyAdminSession(junk), false, `не отвергнуто: ${junk}`);
    }
    assert.equal(await verifyAdminSession(undefined), false);
  });

  test('ADMIN_SESSION_SECRET перебивает пароль как ключ подписи', async () => {
    // Смысл отдельного секрета в том, что смена пароля перестаёт быть
    // единственным способом отозвать сессии, и наоборот — сессия перестаёт
    // быть оракулом для подбора пароля.
    process.env.ADMIN_SESSION_SECRET = 'отдельный-ключ';
    const session = await createAdminSession();

    delete process.env.ADMIN_SESSION_SECRET;
    assert.equal(await verifyAdminSession(session.value), false);
  });
});

describe('constantTimeEqual', () => {
  test('строки разной длины не совпадают и не падают', async () => {
    assert.equal(await constantTimeEqual('a', 'aaaaaaaaaa'), false);
    assert.equal(await constantTimeEqual('', ''), true);
  });

  test('эмодзи сравниваются посимвольно, а не со сдвигом', async () => {
    // Прежняя версия брала codePointAt, а он на первой половине суррогатной
    // пары возвращает весь символ, и дальше индексы разъезжались.
    assert.equal(await constantTimeEqual('пароль🌸', 'пароль🌸'), true);
    assert.equal(await constantTimeEqual('пароль🌸', 'пароль🌷'), false);
  });
});
