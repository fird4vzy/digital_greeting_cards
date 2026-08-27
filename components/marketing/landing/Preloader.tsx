'use client';

import { useEffect, useState } from 'react';
import { Wordmark } from '@/components/site/Wordmark';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * Заставка первой загрузки: «Собираем», счётчик до ста, тонкая линия внизу.
 *
 * Из образца, вместе со смыслом: страница везёт three.js и семь обложек, и
 * первые полторы секунды выглядела бы как тёмное ничто. Заставка не прячет
 * загрузку, а объясняет её — счётчик показывает, что идёт работа, а не сбой.
 *
 * **Уезжает вверх, а не гаснет.** `translateY(-100%)` из образца: страница
 * из-под неё выходит, а не проявляется. Ощущение поднятого занавеса, и оно же
 * маскирует первый кадр сцены, который всегда самый дорогой.
 *
 * **Показывается один раз за вкладку.** Отметка в `sessionStorage`: заставка
 * на каждый переход по сайту превратилась бы из «сейчас соберём» в «опять
 * ждать». Приватный режим бросает исключение на чтении — тогда заставка
 * просто покажется снова, это не поломка.
 *
 * **При `prefers-reduced-motion` её нет вовсе.** Не как уступка: полноэкранный
 * слой, уезжающий вверх, — ровно то движение, от которого людям с этой
 * настройкой плохо. Они получают страницу сразу.
 *
 * Рендерится всегда, а прячется на клиенте: убери её из разметки при
 * `!ready`, и на первом кадре гидратации мелькнёт неготовая страница —
 * заставка обязана быть в HTML, а не появляться после него.
 */

const KEY = 'birdunyo:seen-loader';
const DURATION = 1400;

export function Preloader({ strings }: { strings: Dictionary['ui']['loader'] }) {
  const { reduced, ready } = useMotionPrefs();
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const [skip, setSkip] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(KEY) === '1';
    } catch {
      // Приватный режим: покажем ещё раз, ничего страшного.
    }

    if (seen) {
      setSkip(true);
      return undefined;
    }

    try {
      window.sessionStorage.setItem(KEY, '1');
    } catch {
      /* см. выше */
    }

    const started = performance.now();
    let frame = 0;

    const tick = () => {
      const t = Math.min(1, (performance.now() - started) / DURATION);
      // Та же кривая, что у образца: разгон и торможение, а не линейный ход.
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setCount(Math.round(eased * 100));

      if (t < 1) frame = window.requestAnimationFrame(tick);
      else setDone(true);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  // `ready` отсекает первый кадр гидратации, когда настройки ещё не прочитаны
  // и `reduced` временно false.
  const hidden = skip || (ready && reduced) || done;

  return (
    <div
      aria-hidden="true"
      // `pointer-events-none` появляется вместе с уходом: пока заставка на
      // экране, она честно перехватывает клики по странице под собой.
      className={
        'fixed inset-0 z-[80] grid grid-rows-[1fr_auto] bg-[#17130f] p-[clamp(20px,4vw,46px)] ' +
        'transition-transform duration-[950ms] ease-[cubic-bezier(0.76,0,0.24,1)] ' +
        (hidden ? '-translate-y-full pointer-events-none' : 'translate-y-0')
      }
    >
      <div className="grid place-items-center gap-6 text-center">
        <span className="[&_svg]:h-[clamp(34px,5vw,54px)]">
          <Wordmark tone="paper" />
        </span>
        <span className="font-display text-[clamp(16px,2.2vw,24px)] text-[rgba(240,231,218,0.58)]">
          {strings.linePlain} <span className="italic">{strings.lineItalic}</span>
        </span>
      </div>

      <div className="flex items-end justify-between text-[11px] uppercase tracking-[0.16em] text-[rgba(240,231,218,0.4)]">
        <span>{strings.label}</span>
        <span className="font-display text-[clamp(38px,8vw,84px)] leading-[0.8] tabular-nums">
          {String(count).padStart(2, '0')}
        </span>
      </div>

      {/* Линия внизу растёт вместе со счётчиком — единственная деталь, по
          которой видно, что это прогресс, а не просто цифра. */}
      <span
        className="absolute inset-x-0 bottom-0 h-px origin-left bg-[#c2404e] transition-[width] duration-100"
        style={{ width: `${count}%` }}
      />
    </div>
  );
}
