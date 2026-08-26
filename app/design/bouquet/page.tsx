import type { Metadata, Viewport } from 'next';
import { BouquetScrollStage } from '@/components/marketing/BouquetScrollStage';
import { getI18n } from '@/lib/i18n/server';

/**
 * СТЕНД ДЛЯ СОБИРАЮЩЕГОСЯ БУКЕТА
 * ==============================
 *
 * Не часть продукта и не черновик лендинга. Это то самое «место», которого,
 * по записи в STATUS, не хватало сцене: секция выше экрана, залипающий блок
 * внутри и **ничего непрозрачного впереди**.
 *
 * Зачем отдельный адрес. Сцену уже выкатывали на лендинг и снимали в тот же
 * день: канвас рисует слой на `-z-10`, а секции лендинга залиты непрозрачным,
 * поэтому букет просвечивал только в щелях между плашками и читался как один
 * дизайн, наклеенный на другой. Вывод оттуда — «3D-сцену, которую нельзя
 * увидеть до деплоя, нельзя выкатывать на лендинг; поставь её за отдельный
 * адрес или дождись глаз». Это и есть тот адрес.
 *
 * Почему тёмный фон. Канвас настраивался под тёмную редакцию: экспозиция
 * 0.82, тонированный блик, цвета, которым нужна тёмная земля. На светлой
 * странице он и не мог выглядеть правильно. Токен взят из
 * `design/preview/bir-dunyo-v10.html` — `--bg #17130F`, — чтобы стенд врал
 * как можно меньше.
 *
 * Почему один `BouquetStage`, а не два. Слой — `fixed inset-0`, и второй
 * экземпляр дал бы второй канвас, работающий постоянно: `useInView` висит на
 * полноэкранном фиксированном div, который из виду не уходит. Поэтому одна
 * секция на оба акта, прогресс 0→1 на всю её высоту, а акты разведены двумя
 * залипающими блоками внутри — лепестки и цветы на первом, обёртка с биркой
 * на втором.
 *
 * Строки взяты из настоящего лендинга, а не написаны здесь: судить сцену
 * нужно против текста той длины, что будет на самом деле, и заодно правило
 * «ни одной видимой строки в компоненте» остаётся целым.
 */

export const metadata: Metadata = {
  title: 'Букет · стенд',
  // Внутренняя страница: в поиске ей делать нечего.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#17130F', colorScheme: 'dark' };

export default async function BouquetPreviewPage() {
  const { dict } = await getI18n();

  return (
    <main className="min-h-svh text-[#F0E7DA]">
      {/*
        ЗЕМЛЯ ЛЕЖИТ ЗА КАНВАСОМ, А НЕ ПЕРЕД НИМ.

        Отдельный слой на `-z-20`, а не `background` на самом `<main>`. Разница
        не косметическая: `BouquetStage` рисует канвас на `-z-10`, поэтому
        любая непрозрачная заливка на элементе выше по стеку просто закрывает
        сцену собой — и это ровно то, из-за чего букет сняли с лендинга. Стенд,
        повторивший бы ту же ошибку, ничего бы не показал.
      */}
      <div aria-hidden="true" className="fixed inset-0 -z-20" style={{ background: '#17130F' }} />

      {/* Высота на оба акта. Прогресс берётся из прокрутки через эту секцию,
          поэтому она обязана быть выше экрана — иначе делить нечего. */}
      <BouquetScrollStage className="relative h-[420vh]">
        <Act
          eyebrow={dict.ui.feeling.eyebrow}
          title={dict.ui.feeling.title}
          lead={dict.ui.feeling.lead}
        />
        <Act
          eyebrow={dict.ui.bouquet.eyebrow}
          title={dict.ui.bouquet.title}
          lead={dict.ui.bouquet.lead}
          note={dict.ui.bouquet.note}
        />
      </BouquetScrollStage>

      {/* Хвост: сцена уходит из виду и рендер встаёт. Проверять это тоже надо. */}
      <div className="h-[60vh]" />
    </main>
  );
}

/**
 * Один акт: половина высоты стенда и залипающая колонка текста.
 *
 * Текст занимает левую половину и стоит прямо на фоне — ни карточки, ни
 * заливки, ни `backdrop-blur`. Любой из них закрыл бы букет собой, а ровно
 * этим сцена и была испорчена в прошлый раз.
 */
function Act({
  eyebrow,
  title,
  lead,
  note,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  note?: string;
}) {
  return (
    <div className="h-[210vh]">
      <div className="sticky top-0 flex min-h-svh items-center px-[var(--spacing-gutter)]">
        <div className="mx-auto w-full max-w-[86rem]">
          <div className="max-w-[34rem]">
            <p className="eyebrow text-[#AC8B57]">{eyebrow}</p>
            <h2 className="mt-5 font-display text-display leading-[0.95] tracking-[-0.03em]">
              {title}
            </h2>
            <p className="mt-6 max-w-[30rem] text-body leading-relaxed text-[#F0E7DA]/65">{lead}</p>
            {note ? (
              <p className="mt-8 max-w-[26rem] font-display text-title italic leading-snug text-[#F0E7DA]/80">
                {note}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
