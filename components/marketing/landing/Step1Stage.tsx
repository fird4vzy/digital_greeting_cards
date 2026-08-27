import { SectionHeading } from '@/components/marketing/SectionHeading';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * Акт первый: «Выберите чувство» как сцена, а не как секция.
 *
 * Высота больше экрана и залипающий блок внутри — не украшение, а механика:
 * прокрутка через эту высоту и есть число, которым собирается букет позади.
 * Обычной секции прогрессу неоткуда взяться — ровно поэтому первую попытку
 * поставить сцену на живую главную снимали в тот же день.
 *
 * Текст прижат к низу на телефоне и центрирован от планшета. Это лечение
 * измеренного столкновения: на 390 px собранный букет занимает середину
 * кадра, и центрированный заголовок ложился прямо на цветы.
 *
 * Строки — те же, что у светлой «Выберите чувство»: сцена меняет подачу,
 * а не слова.
 */
export function Step1Stage({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative h-[170svh] md:h-[190svh] lg:h-[230svh]">
      {/* На телефоне текст сверху, а букет камера уводит в нижнюю половину
          кадра — они больше не делят середину экрана. От планшета
          возвращается вертикальное центрирование. */}
      <div className="sticky top-0 flex min-h-svh items-start px-[var(--spacing-gutter)] pt-[clamp(92px,13vh,132px)] pb-[8svh] md:items-center md:pb-0">
        <div className="mx-auto w-full max-w-[86rem]">
          <SectionHeading
            counter="01"
            eyebrow={dict.ui.feeling.eyebrow}
            title={dict.ui.feeling.title}
            lead={dict.ui.feeling.lead}
          />
        </div>
      </div>
    </section>
  );
}
