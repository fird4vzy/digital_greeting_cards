'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Живое превью работы в галерее.
 *
 * Раньше здесь стоял статичный кадр. Кадр честен, но не показывает того
 * единственного, ради чего эти открытки делали, — что они двигаются. Поэтому
 * в карточке крутится сам оригинал, а не его фотография.
 *
 * Три вещи, без которых это было бы плохой идеей.
 *
 * **Ширина.** Работы свёрстаны под телефон и читают собственные медиазапросы.
 * Фрейм шириной 240 px показал бы им десктопную вёрстку, сжатую до открытки, —
 * то есть соврал бы. Поэтому фрейм всегда `PHONE_WIDTH` пикселей внутри и
 * уменьшается трансформом снаружи: внутри он остаётся телефоном.
 *
 * **Вес.** Семь работ разом — это десятки мегабайт. Фрейм не существует, пока
 * карточка не подошла к экрану, а до тех пор лежит обложка. Плюс `allow`
 * намеренно не выставлен: без него политика разрешений глушит автовоспроизведение,
 * и галерея не запускает семь видео одновременно. Видео играет на странице
 * работы, куда заходят осознанно.
 *
 * **Изоляция.** `sandbox` без `allow-same-origin` — та же пара, что и в
 * `WorkViewer`, и по той же причине: вдвоём эти флаги отменяют песочницу.
 * Здесь список даже короче, потому что превью не для нажатий: `pointer-events`
 * сняты, чтобы клик доставался ссылке карточки, а не чужому документу.
 */

/** Ширина, под которую свёрстаны работы: узкий телефон, а не планшет. */
const PHONE_WIDTH = 390;

export function WorkPreview({
  src,
  cover,
  title,
  ratio,
  enabled,
}: {
  src: string;
  cover: string;
  title: string;
  /** Соотношение экрана — то же, что у рамки телефона. */
  ratio: number;
  /** Оживлять ли карточку. Выключено — остаётся одна обложка. */
  enabled: boolean;
}) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const [live, setLive] = useState(false);
  const [scale, setScale] = useState(0);

  // Фрейм рождается, только когда карточка подошла к экрану. `rootMargin`
  // даёт ей начать грузиться чуть раньше, чтобы к моменту взгляда она уже шла.
  useEffect(() => {
    if (!enabled) return;
    const host = hostRef.current;
    if (!host) return;

    if (!('IntersectionObserver' in window)) {
      setLive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLive(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(host);
    return () => observer.disconnect();
  }, [enabled]);

  // Масштаб считается замером, а не вёрсткой: поделить одну длину на другую
  // средствами CSS нельзя, а промахнуться здесь — значит показать работу в
  // чужой ширине.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const measure = () => setScale(host.clientWidth / PHONE_WIDTH);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  return (
    <span ref={hostRef} className="absolute inset-0 block overflow-hidden">
      {/* Обложка остаётся под фреймом: она видна до его появления и всё время,
          пока он грузится, поэтому карточка никогда не бывает пустой. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={cover}
        alt={title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {live && scale > 0 ? (
        <iframe
          src={src}
          title={title}
          tabIndex={-1}
          aria-hidden="true"
          loading="lazy"
          sandbox="allow-scripts"
          className="absolute left-0 top-0 border-0"
          style={{
            width: `${PHONE_WIDTH}px`,
            height: `${Math.round(PHONE_WIDTH * ratio)}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        />
      ) : null}
    </span>
  );
}
