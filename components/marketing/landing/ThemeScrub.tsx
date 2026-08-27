'use client';

import { useEffect } from 'react';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/**
 * Страница едет из ночи в бумагу и обратно.
 *
 * Это то, чего не хватало сильнее всего: в образце тёмный лендинг светлеет,
 * пока читаешь мост, и снова темнеет, когда мост уходит. Смысл не
 * декоративный — на светлом развороте стоит фраза о том, что открытка это то,
 * что остаётся, и страница буквально становится бумагой.
 *
 * **Почему без GSAP.** Образец делает это `gsap.to(theme, { scrollTrigger })`.
 * Тащить GSAP со ScrollTrigger ради двух интерполяций — 120 КБ на страницу,
 * которая и так везёт three.js. Здесь тот же результат на rAF-цикле: он уже
 * есть в проекте для сцены букета, и правило то же — прокрутка пишет в стиль
 * напрямую, минуя состояние React.
 *
 * **Почему меняются ровно две переменные.** `[data-theme='noir']` выводит все
 * свои токены из `--noir-bg` и `--noir-fg` (см. `globals.css`), поэтому
 * подмена двух значений тянет за собой поверхности, границы, приглушённый
 * текст и цвет главной кнопки. Одиннадцать записей в кадр превратились в две.
 *
 * При `prefers-reduced-motion` цикл не запускается вовсе: страница остаётся
 * тёмной. Смена темы по прокрутке — ровно тот эффект, от которого людям с
 * этой настройкой становится плохо.
 */

/** Ночь → сумерки → бумага. Значения из образца. */
const BG = ['#17130f', '#3a2a28', '#ede3d3'];
/** Светлый конец — не чёрный `#17130f`: на бумаге текст мягче чернил. */
const FG = ['#f0e7da', '#f0e2d6', '#221b16'];

const hex = (value: string): [number, number, number] => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];

const STOPS_BG = BG.map(hex);
const STOPS_FG = FG.map(hex);

/** Линейная интерполяция по списку остановок, как `gsap.utils.interpolate`. */
function mix(stops: [number, number, number][], t: number): string {
  const span = (stops.length - 1) * Math.min(1, Math.max(0, t));
  const index = Math.min(stops.length - 2, Math.floor(span));
  const local = span - index;
  const from = stops[index];
  const to = stops[index + 1];

  const channel = (i: number) => Math.round(from[i] + (to[i] - from[i]) * local);
  return `rgb(${channel(0)} ${channel(1)} ${channel(2)})`;
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

export function ThemeScrub({
  scopeId,
  sectionId,
}: {
  /**
   * Идентификаторы, а не ref: обе точки живут в серверных компонентах, и
   * протаскивать через них клиентскую ссылку значило бы делать клиентским
   * половину дерева. Узлы ищутся один раз при запуске цикла.
   */
  scopeId: string;
  sectionId: string;
}) {
  const { reduced, ready } = useMotionPrefs();

  useEffect(() => {
    if (!ready || reduced) return undefined;

    const scope = document.getElementById(scopeId);
    const section = document.getElementById(sectionId);
    if (!scope || !section) return undefined;

    let frame = 0;
    let last = -1;

    const tick = () => {
      {
        const rect = section.getBoundingClientRect();
        const height = window.innerHeight;

        // Светлеет, пока мост входит: от «верх секции у низа экрана» до
        // «верх секции на четверти экрана». Темнеет симметрично на выходе.
        // Между этими двумя фазами страница держится бумажной.
        const enter = (height - rect.top) / (height * 0.75);
        const leave = (height * 0.75 - rect.bottom) / (height * 0.6);

        const t = Math.min(1, Math.max(0, enter)) - Math.min(1, Math.max(0, leave));
        const eased = easeInOut(Math.min(1, Math.max(0, t)));

        // Писать в стиль только на заметном шаге: без этого браузер получает
        // новый цвет в каждом кадре стоящей страницы и пересчитывает все
        // производные токены впустую.
        const step = Math.round(eased * 200);
        if (step !== last) {
          last = step;
          const value = step / 200;
          scope.style.setProperty('--noir-bg', mix(STOPS_BG, value));
          scope.style.setProperty('--noir-fg', mix(STOPS_FG, value));
          // Свечение гаснет к бумаге: на светлом фоне бордовое пятно
          // выглядит грязью, а не светом.
          scope.style.setProperty('--noir-glow', String(0.17 - 0.12 * value));
        }
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      scope.style.removeProperty('--noir-bg');
      scope.style.removeProperty('--noir-fg');
      scope.style.removeProperty('--noir-glow');
    };
  }, [ready, reduced, scopeId, sectionId]);

  return null;
}
