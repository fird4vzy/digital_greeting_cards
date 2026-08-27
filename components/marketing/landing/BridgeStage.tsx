import { SectionHeading } from '@/components/marketing/SectionHeading';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * Акт четвёртый: мост от цифрового к бумажному.
 *
 * Строки — узел `ui.bouquet`, тот же, что читает секция шагов ниже. Это не
 * дублирование, а замысел образца: мост произносит фразу, шаги её показывают.
 * Своей здесь только `doorLine` — главная фраза продукта, которой до сих пор
 * не было на сайте: открытка это то, что остаётся, а QR — всего лишь дверь.
 *
 * Курсив на строке двери — тем же правилом, что и везде в этой типографике:
 * курсивом набирается эмоциональная половина, и только она.
 */
export function BridgeStage({ dict }: { dict: Dictionary }) {
  const strings = dict.ui.bouquet;

  return (
    <section className="relative h-[190svh] md:h-[220svh] lg:h-[280svh]">
      <div className="sticky top-0 flex min-h-svh items-end px-[var(--spacing-gutter)] pt-[clamp(92px,13vh,132px)] pb-[12svh] md:items-center md:pb-0">
        <div className="mx-auto w-full max-w-[86rem]">
          <SectionHeading
            counter="04"
            eyebrow={strings.eyebrow}
            title={strings.title}
            lead={strings.lead}
          />
          <p className="mt-12 max-w-[26ch] font-display text-title italic leading-snug text-on-surface-soft">
            {strings.doorLine}
          </p>
        </div>
      </div>
    </section>
  );
}
