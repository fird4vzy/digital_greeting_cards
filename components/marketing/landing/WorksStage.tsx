import { SectionHeading } from '@/components/marketing/SectionHeading';
import { occasionLabel } from '@/lib/i18n/localise';
import { listWorks } from '@/lib/works';
import type { Dictionary } from '@/lib/i18n/types';
import { WorksRail } from './WorksRail';

/**
 * Акт второй: работы на главной.
 *
 * Раздел «Наши работы» существует отдельной страницей, но образец ставит его
 * второй сценой лендинга — и это правильный порядок доводов: сначала «что вы
 * почувствуете», сразу за ним «вот что мы уже сделали живым людям», и только
 * потом как это устроено.
 *
 * Серверная половина: собирает данные работ и переводит повод. Ленту крутит
 * клиентская `WorksRail` — прокрутка страницы протаскивает карточки
 * горизонтально, как плёнку. Строки — те же, что на странице работ: сцена
 * не рассказывает другую историю, она показывает ту же ближе.
 */
export function WorksStage({ dict }: { dict: Dictionary }) {
  const works = listWorks().map((work) => ({
    id: work.id,
    title: work.title,
    year: work.year,
    occasion: occasionLabel(work.occasion, dict),
    cover: work.cover,
  }));

  return (
    <WorksRail
      works={works}
      openLabel={dict.ui.works.open}
      heading={
        <SectionHeading
          counter="02"
          eyebrow={dict.ui.works.eyebrow}
          title={dict.ui.works.title}
          lead={dict.ui.works.lead}
        />
      }
    />
  );
}
