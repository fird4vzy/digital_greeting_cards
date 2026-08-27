'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/**
 * Текст проявляется сверху вниз, пока его прокручивают.
 *
 * Из образца: письмо не выезжает и не проступает целиком, а открывается по
 * строке, `clip-path: inset(0 0 100% 0)` → `inset(0 0 0% 0)`, привязанное к
 * прокрутке. Смысл ровно тот же, что у самой открытки в шаблоне «Ноктюрн» —
 * читатель получает письмо по мере того, как идёт вниз, а не одним куском.
 *
 * **Почему `clip-path`, а не высота.** Обрезка не трогает поток: соседние
 * карточки не прыгают, пока текст открывается, и высота сетки известна сразу.
 * Анимировать высоту здесь значило бы пересчитывать вёрстку в каждом кадре.
 *
 * Начальное состояние ставится ТОЛЬКО из скрипта, после того как настройки
 * движения прочитаны. Пропиши я `inset(0 0 100% 0)` в разметке — при
 * `prefers-reduced-motion` и без JS письмо осталось бы невидимым навсегда.
 * Это тот же класс ошибки, что начальные состояния масок в образце.
 */
export function ScrubReveal({ children }: { children: ReactNode }) {
  const host = useRef<HTMLDivElement>(null);
  const { reduced, ready } = useMotionPrefs();

  useEffect(() => {
    if (!ready || reduced) return undefined;

    const node = host.current;
    if (!node) return undefined;

    let frame = 0;
    let last = -1;

    const tick = () => {
      const rect = node.getBoundingClientRect();
      const height = window.innerHeight;

      // Начинает открываться, когда верх дошёл до 85% экрана; полностью
      // открыт, когда низ поднялся до 75%. Пропорции образца.
      const span = rect.height + height * 0.1;
      const t = span > 0 ? (height * 0.85 - rect.top) / span : 1;
      const clamped = Math.min(1, Math.max(0, t));

      const step = Math.round(clamped * 100);
      if (step !== last) {
        last = step;
        node.style.clipPath = `inset(0 0 ${100 - step}% 0)`;
      }

      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frame);
      if (node) node.style.clipPath = '';
    };
  }, [ready, reduced]);

  return (
    <div ref={host} className="h-full">
      {children}
    </div>
  );
}
