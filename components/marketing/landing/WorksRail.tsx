'use client';

import Link from 'next/link';
import { useEffect, useRef, type ReactNode } from 'react';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/**
 * Лента работ, которую тянет прокрутка страницы.
 *
 * Вертикальная прокрутка через высокую секцию превращается в горизонтальный
 * ход плёнки: страница едет вниз, карточки едут влево. Сдвиг пишется в
 * transform напрямую из rAF-цикла, минуя состояние React, — тот же приём и по
 * той же причине, что у сцены букета: прокрутка не должна перерисовывать
 * дерево шестьдесят раз в секунду.
 *
 * Два честных отступления:
 *
 * - **reduced motion и отсутствие JS.** Лента остаётся обычной горизонтальной
 *   прокруткой пальцем: `overflow-x-auto` стоит в разметке всегда, а цикл
 *   просто не запускается. Начальное состояние ничего не прячет — без JS
 *   видны первые карточки и заголовок, что и требовалось.
 * - **Подпись «Открыть» видна всегда.** В образце она проявлялась по ховеру,
 *   но на телефоне ховера нет, и вся навигационная подсказка исчезала бы. Это
 *   ровно та ветка `@media (hover: none)`, из-за которой предупреждал разбор.
 */

type WorkCard = {
  id: string;
  title: string;
  year: string;
  occasion: string;
  cover: string;
};

export function WorksRail({
  works,
  heading,
  openLabel,
}: {
  works: WorkCard[];
  heading: ReactNode;
  openLabel: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const { rich } = useMotionPrefs();

  useEffect(() => {
    if (!rich) return undefined;

    let frame = 0;
    const measure = () => {
      const section = sectionRef.current;
      const viewport = viewportRef.current;
      const rail = railRef.current;

      if (section && viewport && rail) {
        const rect = section.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        const progress = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
        // Насколько лента длиннее окна — столько ей и ехать. Меряется каждый
        // кадр, а не один раз: ширина меняется с поворотом телефона.
        const shift = Math.max(0, rail.scrollWidth - viewport.clientWidth);
        rail.style.transform = `translate3d(${-progress * shift}px, 0, 0)`;
      }

      frame = window.requestAnimationFrame(measure);
    };

    frame = window.requestAnimationFrame(measure);
    return () => {
      window.cancelAnimationFrame(frame);
      if (railRef.current) railRef.current.style.transform = '';
    };
  }, [rich]);

  return (
    <section ref={sectionRef} className="relative h-[220svh] md:h-[280svh] lg:h-[330svh]">
      <div className="sticky top-0 flex min-h-svh flex-col justify-center gap-10 pt-[clamp(92px,13vh,132px)] pb-[8svh] md:gap-14">
        <div className="w-full px-[var(--spacing-gutter)]">
          <div className="mx-auto w-full max-w-[86rem]">{heading}</div>
        </div>

        {/* `overflow-x-auto` живёт в разметке постоянно: когда цикл выключен
            (reduced motion, JS не доехал), лента остаётся прокручиваемой
            пальцем, а не обрезанной. При включённом цикле transform уводит
            ленту раньше, чем нативная прокрутка понадобится. */}
        <div ref={viewportRef} className="w-full overflow-x-auto overflow-y-hidden [scrollbar-width:none]">
          <div
            ref={railRef}
            className="flex w-max gap-5 px-[var(--spacing-gutter)] will-change-transform md:gap-7"
          >
            {works.map((work) => (
              <Link
                key={work.id}
                href={`/works/${work.id}`}
                className="group w-[66vw] max-w-[21rem] shrink-0 sm:w-[44vw] md:w-[30vw]"
              >
                <span
                  className="block overflow-hidden rounded-[var(--radius-petal)] border border-edge bg-surface-2"
                  style={{ aspectRatio: '16 / 10' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={work.cover}
                    alt={work.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full scale-[1.04] object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-100"
                  />
                </span>

                <span className="mt-4 flex items-baseline gap-3 text-[0.6875rem] tracking-[0.08em] text-on-surface-faint">
                  {/* Год набран прямым намеренно: курсив в этой типографике
                      зарезервирован за чувством, а не за метаданными. */}
                  <em className="not-italic tabular-nums">{work.year}</em>
                  <span aria-hidden="true">·</span>
                  <span>{work.occasion}</span>
                </span>
                <span className="mt-1.5 block font-display text-[1.35rem] leading-tight text-on-surface">
                  {work.title}
                </span>
                <span className="mt-2 inline-block text-caption text-brand opacity-75 transition-opacity duration-500 group-hover:opacity-100">
                  {openLabel} &rarr;
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
