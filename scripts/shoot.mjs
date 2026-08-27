/**
 * СНИМКИ СТРАНИЦЫ НА РАЗНОЙ ПРОКРУТКЕ
 * ==================================
 * Гоняет headless Chrome по протоколу DevTools: открыть адрес, прокрутить на
 * долю высоты, снять кадр. Повторить.
 *
 * Зачем это существует. `chrome --screenshot` снимает только первый экран и не
 * умеет прокручивать, а всё интересное в этом проекте — сцены, размазанные на
 * несколько экранов: букет собирается за четыре, тёмная редакция лендинга
 * будет за семь. Один кадр сверху не говорит ничего.
 *
 * И цена этого уже заплачена. Букет выкатили на лендинг, не посмотрев, потому
 * что «пиксели проверить нельзя» — и сняли в тот же день. Оказалось, можно:
 * нужны верные флаги (`--use-angle=swiftshader --enable-unsafe-swiftshader`),
 * и программный растеризатор рисует полную сцену. Этот файл — чтобы отговорка
 * больше не возникала. Родня `glb-render.mjs`, который существует по той же
 * причине: посмотреть до того, как увидит кто-то ещё.
 *
 * Использование:
 *   node scripts/shoot.mjs <url> <папка> [доли] [ширина] [высота]
 *
 *   node scripts/shoot.mjs http://localhost:4010/design/bouquet out 0,.25,.5,1
 *   node scripts/shoot.mjs http://localhost:4010/ out 0,.5 390 844
 *
 * Доли — от 0 (верх) до 1 (низ прокручиваемой высоты).
 */
import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const [url, outDir, fractionsArg, widthArg, heightArg] = process.argv.slice(2);

if (!url || !outDir) {
  console.error('node scripts/shoot.mjs <url> <папка> [доли] [ширина] [высота]');
  process.exit(1);
}

const fractions = (fractionsArg ?? '0,0.5,1').split(',').map(Number);
const width = Number(widthArg ?? 1280);
const height = Number(heightArg ?? 900);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((candidate) => existsSync(candidate));

if (!CHROME) {
  console.error('Chrome не найден.');
  process.exit(1);
}

const port = 9222 + Math.floor(process.pid % 500);
const profile = path.join(os.tmpdir(), `shoot-${process.pid}`);

const chrome = spawn(CHROME, [
  '--headless=new',
  '--no-sandbox',
  '--disable-extensions',
  '--hide-scrollbars',
  // Без этих двух сцена не рисуется вовсе, и именно из-за этого когда-то
  // решили, что проверить нельзя.
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
  'about:blank',
], { stdio: 'ignore' });

/** Ждёт, пока Chrome поднимет протокол. Опрос, а не сон вслепую. */
async function endpoint() {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      const json = await response.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch {
      /* ещё не поднялся */
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error('Chrome не открыл порт протокола');
}

const socket = new WebSocket(await endpoint());
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 1;
const pending = new Map();

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  const waiter = pending.get(message.id);
  if (!waiter) return;
  pending.delete(message.id);
  message.error ? waiter.reject(new Error(message.error.message)) : waiter.resolve(message.result);
});

function send(method, params = {}, sessionId) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

// Один таб на всё: открывать по вкладке на кадр значит каждый раз заново
// компилировать шейдеры и ждать сцену.
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

const call = (method, params) => send(method, params, sessionId);

await call('Page.enable');
await call('Runtime.enable');
await call('Emulation.setDeviceMetricsOverride', {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: width < 700,
});

await call('Page.navigate', { url });

/** Ждёт, пока страница догрузится и сцена успеет нарисовать несколько кадров. */
async function settle(ms) {
  const until = Date.now() + ms;
  while (Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
}

await settle(6000);

const evaluate = async (expression) => {
  const { result } = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  return result.value;
};

const scrollable = await evaluate(
  'Math.max(0, document.documentElement.scrollHeight - window.innerHeight)',
);
console.log(`высота прокрутки: ${scrollable}px, окно ${width}×${height}`);

await mkdir(outDir, { recursive: true });

for (const fraction of fractions) {
  const y = Math.round(scrollable * fraction);
  await evaluate(`window.scrollTo(0, ${y}); 1`);
  // Сцена читает прокрутку в rAF-цикле, поэтому кадру нужно время доехать до
  // нового положения, а не только долистать.
  await settle(2500);

  const { data } = await call('Page.captureScreenshot', { format: 'png' });
  const name = `p${String(Math.round(fraction * 100)).padStart(3, '0')}.png`;
  await writeFile(path.join(outDir, name), Buffer.from(data, 'base64'));
  console.log(`  ${name}  прокрутка ${y}px`);
}

const errors = await evaluate(
  '(window.__shootErrors || []).length',
);
if (errors) console.log(`ошибок в консоли: ${errors}`);

socket.close();
chrome.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
console.log('готово');
