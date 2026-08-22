# Как выкатить это в `digital_greeting_cards`

Пушить я не могу — доступа на запись нет, и токен мне давать не нужно.
Ниже готовые файлы и точные команды: минут пятнадцать работы.

---

## Что проверено, а что нет

Репозиторий склонирован, зависимости поставлены (`npm ci`), файлы положены на место
и прогнаны настоящими инструментами проекта:

| проверка | результат |
| --- | --- |
| `tsc --noEmit` до правок | чисто, 0 ошибок |
| `tsc --noEmit` с тремя новыми файлами | чисто, 0 ошибок |
| `next build` | `✓ Compiled successfully`, 27 статических страниц |

**Не проверено:** как это выглядит в браузере внутри Next. Стенд гоняет сцену без
WebGL, а `next build` не рисует пиксели. Первое, что делаешь, — `npm run dev`
и смотришь глазами.

Сборка в моей песочнице падала на `next/font` — сюда нет доступа к
`fonts.googleapis.com`. У тебя это соберётся; я на время проверки подменил
шрифты заглушкой и вернул `app/layout.tsx` в исходный вид.

---

## 1. Три новых файла

Копируются как есть, ничего существующего не трогают:

```
components/three/scenes/BouquetAssembly.tsx      сцена: 7 голов, сборка по прогрессу
components/three/BouquetAssemblyCanvas.tsx       канвас, свет, экспозиция
components/marketing/BouquetStage.tsx            гейт: motion prefs, in-view, boundary
```

Они переиспользуют то, что уже есть, а не дублируют его:

- `curvedPetalGeometry()` из `components/three/geometry.ts`
- `useStudioEnvironment()` из `components/three/useStudioEnvironment.ts`
- таблица из пяти колец — та же, что в `scenes/BloomFlower.tsx`
- бирка на букете — существующий `scenes/BrandTag.tsx`, не новая
- гейт повторяет правила `Atmosphere`: динамический импорт, `rich`, `useInView`,
  error boundary, пауза рендера при уходе секции и при уходе вкладки

---

## 2. Подключение

`BouquetStage` — фиксированный слой под контентом. Ему нужна ссылка на секцию,
прокрутка через которую и есть прогресс сборки:

```tsx
'use client';

import { useRef } from 'react';
import { BouquetStage } from '@/components/marketing/BouquetStage';

export function FeelingSection(/* ... */) {
  const section = useRef<HTMLElement>(null);

  return (
    <>
      <BouquetStage sectionRef={section} range={[0, 0.55]} />
      <section ref={section} className="relative h-[230vh]">
        <div className="sticky top-0 flex min-h-svh items-center">
          {/* текст слева, букет справа сам */}
        </div>
      </section>
    </>
  );
}
```

`range` режет сцену на два акта, как в превью: `[0, 0.55]` на «Выберите чувство»
(лепестки → цветы → букет) и `[0.55, 1]` на «Прикрепите к букету»
(крафт → лента → бирка с QR).

Секции нужна высота больше экрана (`h-[230vh]`) и залипающий внутренний блок —
иначе прогрессу неоткуда браться.

---

## 3. Шрифт — отдельный коммит, это баг на живом сайте

`Instrument Serif` **не имеет кириллицы вообще**, а в `layout.tsx` ещё и
`subsets: ['latin']` у обоих семейств. Все русские и узбекско-кириллические
заголовки сейчас рисует запасной Georgia. Проверил по каталогу `next/font`:

| шрифт | субсеты | стили |
| --- | --- | --- |
| Instrument Serif | latin, latin-ext | normal, italic |
| Prata | **cyrillic**, cyrillic-ext, latin | normal — **курсива нет** |
| Cormorant Garamond | **cyrillic**, cyrillic-ext, latin, latin-ext | normal, **italic** |
| Playfair Display | **cyrillic**, latin, latin-ext | normal, **italic** |

Поправка к тому, что я говорил раньше: **Prata не подходит**, хотя по характеру
ближе всех. У неё нет курсива, а вся типографика держится на курсивных строках
(«в сообщение.», «чувство.») — браузер наклонит буквы алгоритмически, и на
кириллице это выглядит плохо.

Бери `Cormorant Garamond` (тоньше, ближе к «премиальной открытке») или
`Playfair Display` (плотнее, увереннее на крупных кеглях). Диф:

```diff
-import { Instrument_Serif, Inter } from 'next/font/google';
+import { Cormorant_Garamond, Inter } from 'next/font/google';

-const display = Instrument_Serif({
-  subsets: ['latin'],
-  weight: '400',
+const display = Cormorant_Garamond({
+  subsets: ['latin', 'cyrillic'],
+  weight: ['400', '600'],
   style: ['normal', 'italic'],
   variable: '--font-instrument-serif',
   display: 'swap',
   fallback: ['Iowan Old Style', 'Georgia', 'serif'],
 });

 const sans = Inter({
-  subsets: ['latin'],
+  subsets: ['latin', 'cyrillic'],
   variable: '--font-inter',
   display: 'swap',
   fallback: ['system-ui', 'sans-serif'],
 });
```

Имя переменной `--font-instrument-serif` оставь как есть — на неё завязан
`globals.css`, и переименование раздует диф на пустом месте.

---

## 4. Команды

```bash
git checkout -b feat/bouquet-assembly

# положить три файла из архива на свои места, затем:
npm run typecheck        # должно быть чисто
npm run dev              # смотреть глазами: /

git add components/three/scenes/BouquetAssembly.tsx \
        components/three/BouquetAssemblyCanvas.tsx \
        components/marketing/BouquetStage.tsx
git commit -m "feat(three): букет, собирающийся по прокрутке"

# шрифт — отдельным коммитом, его легче откатить
git add app/layout.tsx
git commit -m "fix(fonts): кириллица в заголовках"

git push -u origin feat/bouquet-assembly
```

Дальше Vercel сам поднимет preview-деплой на ветку. **Смотри превью с телефона
до мержа в main** — 3D включается от 680px и на слабом Android его стоит
проверить руками.

---

## Чего я бы не делал сразу

Не мержил бы всю ночную редакцию лендинга одним заходом. Тёмная тема, лента
работ и новый футер — это отдельный разговор и отдельный диф; сегодняшний
коммит добавляет один самостоятельный кусок, который включается и выключается
одной строчкой. Если букет на проде не понравится — удаляешь `<BouquetStage>`,
и сайт ровно такой, каким был.
