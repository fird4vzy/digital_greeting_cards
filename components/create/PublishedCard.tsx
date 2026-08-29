'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Blossom } from '@/components/cards/primitives/Motif';
import { easing } from '@/lib/design/motion';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { t } from '@/lib/i18n';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * ЗАКАЗ ПРИНЯТ. ОТКРЫТКИ ЕЩЁ НЕТ.
 *
 * Раньше этот экран отдавал заказчику код крупными буквами, ссылку на
 * `/c/<код>`, кнопку «скопировать» и «распечатать QR-карточку». Всё это —
 * инструменты того, кто открытку делает, а не того, кто её заказал:
 *
 *   - ссылка ведёт на открытку, которой ещё не существует;
 *   - QR печатать нечего и не на что вешать — букета у заказчика нет;
 *   - вернуться по ссылке он всё равно не сможет, личного кабинета нет.
 *
 * Bir dunyo — студия: открытку делают руками, а готовую ссылку и QR
 * отправляют заказчику в телеграм. Значит его работа на этом закончена, и
 * экран должен сказать ровно это.
 *
 * **Почему здесь не крутится прогресс.** Приём из `cybernet-script-builder` —
 * картинка и строка, перебирающая «Собираю структуру… Пишу реплики…» — работает
 * там, потому что в этот момент действительно работает модель. Здесь не
 * работает ничего: заказ прочитает человек, и, возможно, завтра. Поддельный
 * прогресс был бы враньём в продукте, у которого честность записана принципом.
 *
 * Поэтому перебираются не стадии машины, а **что с заказом произойдёт**. Это
 * правда, это не скучно, и заодно говорит, за что человек платит: открытку
 * соберут руками, а не выплюнет генератор.
 */

export function PublishedCard({
  code,
  contact,
  strings,
}: {
  code: string;
  /** Телеграм или телефон, который он оставил. Туда и придёт ответ. */
  contact: string;
  strings: Dictionary['ui']['create']['done'];
}) {
  const { reduced } = useMotionPrefs();
  const stages = strings.stages;
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // При сниженной анимации список показывается целиком и не двигается —
    // смена состояния сохраняется, просто не отнимает внимание.
    if (reduced) return undefined;
    const timer = window.setInterval(() => setStage((s) => (s + 1) % stages.length), 2600);
    return () => window.clearInterval(timer);
  }, [reduced, stages.length]);

  return (
    <motion.section
      className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col items-center justify-center px-[var(--spacing-gutter)] py-32 text-center"
      initial={{ opacity: 0, y: reduced ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0.2 : 0.8, ease: easing.out }}
    >
      {/* Цветок не приземляется и не замирает: он продолжает жить, пока человек
          читает. Это единственное движение на экране, и оно ничего не обещает —
          в отличие от полоски прогресса, которая обещала бы срок. */}
      <motion.span
        className="text-accent"
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -40 }}
        animate={
          reduced
            ? { opacity: 1 }
            : { opacity: 1, scale: [1, 1.06, 1], rotate: [0, 4, 0] }
        }
        transition={
          reduced
            ? { duration: 0.3 }
            : { opacity: { duration: 1, delay: 0.15 }, scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' }, rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut' } }
        }
      >
        <Blossom className="h-10 w-10" />
      </motion.span>

      <h1 className="mt-8 font-display text-display-sm leading-[1.05] tracking-[-0.03em] text-ink">
        {strings.title}
      </h1>

      <p className="mt-5 max-w-[42ch] text-body-lg text-pretty text-ink-soft">
        {strings.lead}
      </p>

      {/* Что произойдёт дальше. Под сниженной анимацией — списком, иначе по
          одной строке: короткий текст, который сменяется, читают, а список из
          четырёх пунктов пролистывают глазами. */}
      <div className="mt-12 w-full max-w-[26rem] rounded-[1.25rem] border border-line-strong bg-white/60 px-6 py-7">
        <p className="eyebrow text-ink-muted">{strings.stagesLabel}</p>

        {reduced ? (
          <ul className="mt-4 space-y-2.5 text-left">
            {stages.map((line) => (
              <li key={line} className="text-body leading-snug text-ink-soft">
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <div className="relative mt-4 h-[3.5rem]">
            <AnimatePresence mode="wait">
              <motion.p
                key={stage}
                className="absolute inset-0 flex items-center justify-center text-body leading-snug text-ink-soft"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.55, ease: easing.out }}
              >
                {stages[stage]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}
      </div>

      {contact ? (
        <p className="mt-8 max-w-[38ch] text-body text-ink-soft">
          {t(strings.answerHere, { contact })}
        </p>
      ) : null}

      {/* Код остаётся — но как номер заказа, а не как ссылка. Он нужен ровно в
          одном случае: человек пишет в бота, и по коду его заказ находят
          быстрее. Ровно это бот и просит в своём ответе. */}
      <p className="mt-10 text-caption text-ink-muted">
        {strings.reference} <span className="tabular-nums tracking-[0.12em] text-ink">{code}</span>
      </p>
    </motion.section>
  );
}
