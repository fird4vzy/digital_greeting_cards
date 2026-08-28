/**
 * Регистрация вебхука у Telegram: set, status, delete.
 *
 * Вебхук нужен, чтобы написанное боту доходило до рабочей группы. Опроса на
 * serverless-хостинге быть не может — держать процесс негде, — поэтому Telegram
 * должен сам стучаться на адрес приложения.
 *
 *   node scripts/telegram-webhook.mjs status
 *   node scripts/telegram-webhook.mjs set https://ваш-домен
 *   node scripts/telegram-webhook.mjs delete
 *
 * Токен и секрет читаются из `.env.local` — тем же способом, что и в
 * `scripts/migrate.mjs`. Ни один из них не печатается.
 *
 * **Вебхук и `getUpdates` несовместимы.** Пока вебхук стоит, кнопка «Найти
 * chat id» в `/admin` будет получать от Telegram 409: сообщения забирает
 * вебхук, и опросить их второй раз нельзя. Это не поломка. Нужен chat id —
 * `delete`, найти, `set` обратно.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * `fileURLToPath`, а не `new URL(...).pathname` — и это не педантизм.
 *
 * Путь проекта содержит кириллицу, а в file-URL она процентно-закодирована:
 * `pathname` отдаёт `.../%D0%BF%D1%80.../scripts`, такой каталог не
 * существует, `.env.local` не открывается — и переменные молча не грузятся.
 * Скрипт отвечал «TELEGRAM_BOT_TOKEN не задан» при живом токене в файле.
 * `fileURLToPath` декодирует и заодно ставит правильный разделитель Windows.
 */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

let envFileRead = false;

for (const name of ['.env.local', '.env']) {
  let text;
  try {
    text = readFileSync(path.join(root, name), 'utf8');
  } catch {
    continue; // нет файла — нормально, переменные могут прийти из окружения
  }

  envFileRead = true;

  for (const line of text.split(/\r?\n/)) {
    const m = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line);
    if (!m || process.env[m[1]] !== undefined) continue;

    const v = m[2].trim();
    const q = /^(['"])([\s\S]*)\1$/.exec(v);
    const value = q ? q[2] : v.split('#')[0].trim();

    // `vercel env pull` пишет `[SENSITIVE]` вместо секретов, которые Vercel
    // отказывается отдавать. Принять такую строку за значение — значит уйти
    // в Telegram с мусорным токеном и получить невнятный отказ вместо
    // понятного «не задан».
    if (value === '[SENSITIVE]') continue;

    process.env[m[1]] = value;
  }
}

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
  console.error('TELEGRAM_BOT_TOKEN не задан.\n');
  console.error('  Токен нужен здесь, на вашей машине: скрипт ходит в Telegram');
  console.error('  напрямую, а не через сайт. Секрета вебхука для этого мало.\n');
  console.error('  Проще всего — дописать одну строку в .env.local, рядом с DATABASE_URL:\n');
  console.error('    TELEGRAM_BOT_TOKEN=<токен от @BotFather>\n');
  console.error('  Или вытянуть всё из Vercel. Команды по одной — в PowerShell');
  console.error('  разделителя && нет:\n');
  console.error('    npx vercel link');
  console.error('    npx vercel env pull .env.local --environment=production\n');
  console.error('  Без --environment=production придут переменные Development,');
  console.error('  а токен и секрет вы задавали для Production.');
  console.error('  Учтите два побочных эффекта pull: он ПЕРЕЗАПИСЫВАЕТ');
  console.error('  .env.local целиком, а секретные значения Vercel вообще не отдаёт —');
  console.error('  вместо них пишет [SENSITIVE]. Такие строки здесь игнорируются.\n');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${token}`;
const [command, origin] = process.argv.slice(2);

async function call(method, body) {
  const response = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  return response.json();
}

if (command === 'status') {
  const info = await call('getWebhookInfo');
  const r = info.result ?? {};
  console.log('адрес:            ', r.url || '(не задан)');
  console.log('ожидает доставки: ', r.pending_update_count ?? 0);
  console.log('секрет проверяется:', r.has_custom_certificate === undefined ? 'н/д' : 'да');
  if (r.last_error_message) {
    console.log('последняя ошибка: ', r.last_error_message);
    console.log('когда:            ', new Date((r.last_error_date ?? 0) * 1000).toISOString());
  }
  process.exit(0);
}

if (command === 'delete') {
  const out = await call('deleteWebhook', { drop_pending_updates: false });
  console.log(out.ok ? 'вебхук снят — getUpdates снова работает' : `отказ: ${out.description}`);
  process.exit(out.ok ? 0 : 1);
}

if (command === 'set') {
  if (!origin) {
    console.error('Укажите адрес: node scripts/telegram-webhook.mjs set https://ваш-домен');
    process.exit(1);
  }

  if (!secret) {
    console.error('TELEGRAM_WEBHOOK_SECRET не задан.\n');
    console.error('  Придумайте длинную случайную строку, положите её в Vercel');
    console.error('  (Production) и в .env.local под этим именем. Без неё маршрут');
    console.error('  вебхука отвечает 404 и ничего не принимает — это защита от');
    console.error('  того, чтобы в вашу группу писал кто угодно.\n');
    console.error('  Сгенерировать:  node -e "console.log(crypto.randomUUID())"');
    process.exit(1);
  }

  const url = `${origin.replace(/\/+$/, '')}/api/telegram/webhook`;
  const out = await call('setWebhook', {
    url,
    secret_token: secret,
    // Нужны только сообщения. Всё остальное — правки, реакции, участники —
    // приходило бы впустую и стоило бы вызовов функции.
    allowed_updates: ['message'],
  });

  console.log(out.ok ? `вебхук зарегистрирован: ${url}` : `отказ: ${out.description}`);
  if (out.ok) {
    console.log('\nПроверьте: напишите боту в личку — сообщение должно прийти в группу.');
    console.log('Пока вебхук стоит, кнопка «Найти chat id» в /admin отвечает 409 — это нормально.');
  }
  process.exit(out.ok ? 0 : 1);
}

console.error('Команды: status | set <https://домен> | delete');
process.exit(1);
