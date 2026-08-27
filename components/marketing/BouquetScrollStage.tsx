'use client';

import { useRef, type ReactNode } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { BouquetStage } from './BouquetStage';

/**
 * Даёт секции ссылку на себя, чтобы прокрутка через неё собирала букет.
 *
 * Обёртка, а не правка самих секций, по двум причинам. Секции — серверные
 * компоненты, а `ref` требует клиентского; и главное — так вся сцена
 * снимается одной строкой в `app/page.tsx`, ничего не разбирая обратно.
 * Именно этого просил автор сцены: кусок, который включается и выключается
 * целиком, а не врастает в вёрстку.
 *
 * **Почему одна секция, а не две.** Замысел был на два акта — лепестки на
 * «Выберите чувство» и обёртка с биркой на «Прикрепите к букету». Второе
 * сейчас невозможно: `BouquetStage` рисует слой на `-z-10`, а секция
 * «Прикрепите» залита непрозрачным `bg-noir` и просто закрывает его собой.
 * Канвас к тому же настраивался под тёмную сцену, а тёмная редакция лендинга
 * отложена. Поэтому здесь один акт целиком, на прозрачной секции; когда
 * тёмная тема появится, `range` разрежет его обратно на два.
 */
export function BouquetScrollStage({
  children,
  range,
  className,
  id,
}: {
  children: ReactNode;
  /** Ставится на обёртку, чтобы другие эффекты могли найти эту секцию. */
  id?: string;
  /** Какую часть таймлайна проигрывает прокрутка через эту секцию. */
  range?: [number, number];
  className?: string;
}) {
  const section = useRef<HTMLDivElement>(null);
  // Гейт по секции, а не по слою: слой у BouquetStage растянут на весь
  // вьюпорт и «виден» всегда, из-за чего канвас жил бы на всей странице —
  // и позади героя, у которого собственная сцена, рисовались бы две разом.
  const { ref: gate, inView } = useInView<HTMLDivElement>({ once: false, rootMargin: '300px' });

  return (
    <>
      {inView ? <BouquetStage sectionRef={section} range={range} /> : null}
      <div
        id={id}
        ref={(node) => {
          section.current = node;
          gate.current = node;
        }}
        className={className}
      >
        {children}
      </div>
    </>
  );
}
