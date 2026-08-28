/**
 * Растровый комплект логотипа — из того же SVG, что рисует шапку сайта.
 *
 * Нужен потому, что телеграму и инстаграму вектор отдать нельзя: они берут
 * PNG и сами его сжимают. Держать эти PNG нарисованными руками значит завести
 * вторую версию логотипа, которая однажды разойдётся с сайтом, — поэтому
 * источник здесь ровно один, `public/brand/wordmark.svg` и `app/icon.svg`, а
 * всё остальное собирается командой `npm run brand:export`.
 *
 * Аватарок две пары, и это не про вкус. Телеграм показывает аватар кружком в
 * 40 пикселей: «bir dunyo» в такой кружок влезает, но не читается, поэтому в
 * профиль идёт знак — карточка с загнутым углом, — а надпись остаётся для
 * шапок и постов, где её видно целиком.
 */
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// fileURLToPath, а не new URL().pathname: в пути проекта кириллица, и в
// file-URL она приезжает процентами. См. STATUS, тот же капкан был в скриптах.
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'brand');
mkdirSync(out, { recursive: true });

/** Токены из app/globals.css. Светлая тема и тёмная берут разный красный. */
const LIGHT = { ink: '#191512', surface: '#f6f2ec', brand: '#a33b48', corner: '#c9848c' };
const DARK = { ink: '#f0e7da', surface: '#17130f', brand: '#c2404e', corner: '#d9868d' };

// --- надпись -------------------------------------------------------------

const source = readFileSync(join(out, 'wordmark.svg'), 'utf8');
const VIEW = { x: 34, y: 744, w: 1981, h: 586 };

/** Пути надписи в порядке отрисовки: порядок и есть чертёж, менять нельзя. */
const paths = [...source.matchAll(/<path\b([^>]*)\/>/g)].map(([, attrs]) => ({
  d: /\bd="([^"]+)"/.exec(attrs)[1],
  role: /--wm-surface/.test(attrs) ? 'surface' : /--wm-ink/.test(attrs) ? 'ink' : 'brand',
  fold: /class="wm-fold"/.test(attrs),
}));

/**
 * Надпись, вписанная в холст.
 *
 * `knockout` — для прозрачного PNG: светлые участки надписи это не белая
 * краска, а просвет — изнанка загнутого угла и внутренности букв «b» и «o».
 * Залить их цветом фона значит получить логотип, который держится ровно на
 * одном фоне; поэтому здесь они вырезаются маской. Обводка сгиба рисуется
 * поверх маски: в исходнике она лежит на просвете, и вырезать её нельзя.
 */
function wordmark({ width, height, palette, knockout = false, background = null, inset = 0.79 }) {
  const scale = (width * inset) / VIEW.w;
  const tx = (width - VIEW.w * scale) / 2 - VIEW.x * scale;
  const ty = (height - VIEW.h * scale) / 2 - VIEW.y * scale;

  const draw = (p, fill) => `<path d="${p.d}" fill="${fill}"/>`;
  const body = paths
    .filter((p) => !(knockout && (p.role === 'surface' || (p.fold && p.role === 'ink'))))
    .map((p) => draw(p, p.role === 'brand' ? palette.brand : p.role === 'ink' ? palette.ink : palette.surface))
    .join('');

  const holes = paths.filter((p) => p.role === 'surface');
  const foldInk = paths.filter((p) => p.fold && p.role === 'ink');

  const mask = knockout
    ? `<mask id="cut" maskUnits="userSpaceOnUse" x="${VIEW.x}" y="${VIEW.y}" width="${VIEW.w}" height="${VIEW.h}">
         <rect x="${VIEW.x}" y="${VIEW.y}" width="${VIEW.w}" height="${VIEW.h}" fill="#fff"/>
         ${holes.map((p) => draw(p, '#000')).join('')}
       </mask>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : ''}
  ${mask}
  <g transform="translate(${tx} ${ty}) scale(${scale})">
    ${knockout ? `<g mask="url(#cut)">${body}</g>${foldInk.map((p) => draw(p, palette.ink)).join('')}` : body}
  </g>
</svg>`;
}

// --- знак ----------------------------------------------------------------

const icon = readFileSync(join(root, 'app', 'icon.svg'), 'utf8');

/**
 * Знак на сплошном фоне.
 *
 * Плашка из `app/icon.svg` выбрасывается: там она нужна как фон вкладки, а
 * здесь фон рисует сам аватар — телеграм и инстаграм всё равно обрежут его
 * кружком, и скруглённый квадрат внутри круга выглядит как ошибка.
 */
function mark({ size, palette }) {
  const inner = icon
    .replace(/<rect\b[^>]*\/>/, '')
    .replace(/#a33b48/g, palette.brand)
    .replace(/#c9848c/g, palette.corner)
    .replace(/#f6f2ec/g, palette.surface)
    .replace(/^[\s\S]*?<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');

  // Карточка занимает 24 из 40 единиц исходной сетки и почти квадратна,
  // поэтому её углы — самое далёкое от центра. При 64% высоты аватара они
  // уходят на 87% радиуса кружка, которым его обрежут, — знак крупный,
  // но ни один угол в срез не попадает.
  const scale = (size * 0.64) / 24;
  const shift = (size - 40 * scale) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${palette.surface}"/>
  <g transform="translate(${shift} ${shift}) scale(${scale})">${inner}</g>
</svg>`;
}

// --- сборка --------------------------------------------------------------

const files = [
  // Аватар профиля: телеграм, инстаграм, любой кружок.
  ['avatar-mark-cream', mark({ size: 1024, palette: LIGHT })],
  ['avatar-mark-noir', mark({ size: 1024, palette: DARK })],
  // Аватар надписью — для мест, где картинку видно крупно. Уже, чем на баннере:
  // квадрат обрежут кругом, а крайние буквы лежат как раз там, где он режет.
  ['avatar-wordmark-cream', wordmark({ width: 1024, height: 1024, palette: LIGHT, background: LIGHT.surface, inset: 0.7 })],
  ['avatar-wordmark-noir', wordmark({ width: 1024, height: 1024, palette: DARK, background: DARK.surface, inset: 0.7 })],
  // Шапки и посты.
  ['wordmark-cream', wordmark({ width: 2400, height: 800, palette: LIGHT, background: LIGHT.surface })],
  ['wordmark-noir', wordmark({ width: 2400, height: 800, palette: DARK, background: DARK.surface })],
  // Прозрачный фон — положить на фотографию или на печатную бирку.
  ['wordmark-ink', wordmark({ width: 3000, height: 1000, palette: LIGHT, knockout: true })],
  ['wordmark-paper', wordmark({ width: 3000, height: 1000, palette: DARK, knockout: true })],
];

for (const [name, svg] of files) {
  const svgPath = join(out, `${name}.svg`);
  const pngPath = join(out, `${name}.png`);
  writeFileSync(svgPath, svg);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(pngPath);
  const { width, height } = await sharp(pngPath).metadata();
  console.log(`${name}.png  ${width}×${height}  ${Math.round(statSync(pngPath).size / 1024)} КБ`);
}
