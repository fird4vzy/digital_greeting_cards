import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { GalleryTabs } from '@/components/marketing/GalleryTabs';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { getI18n } from '@/lib/i18n/server';
import { localiseTemplates, occasionLabel } from '@/lib/i18n/localise';
import { listAllTemplateSummaries } from '@/lib/card/registry';
import { listWorks, workEntryUrl } from '@/lib/works';
import { PhoneFrame, PHONE_SCREEN_RATIO } from '@/components/marketing/PhoneFrame';
import { WorkPreview } from '@/components/works/WorkPreview';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.ui.works.metaTitle, description: dict.ui.works.metaDescription };
}

/**
 * НАШИ РАБОТЫ.
 *
 * В карточках крутятся сами работы, а не их фотографии: единственное, что
 * отличает эти открытки от картинки, — что они двигаются, и обложка ровно это
 * и скрывала.
 *
 * Цена известна и удержана в `WorkPreview`: фрейм не существует, пока карточка
 * не подошла к экрану, до тех пор лежит обложка, а автовоспроизведение
 * заглушено политикой разрешений, чтобы галерея не запускала семь видео разом.
 * Звук и видео — на странице работы, куда заходят осознанно.
 */
export default async function WorksPage() {
  const { locale, dict } = await getI18n();
  const works = listWorks();

  // Портированные работы ссылались на шаблон его идентификатором — `ask`,
  // `window`. Это внутреннее имя, оно латиницей и одинаково во всех трёх
  // языках; читателю нужно название. Реестр, а не словарь напрямую, потому
  // что шаблон может быть собран оператором и в словаре его нет.
  // Сейчас ни одна работа никуда не портирована, а реестр — обращение к базе.
  // Спрашиваем только тогда, когда есть чьё имя переводить.
  const templateNames = works.some((work) => work.portedTo)
    ? new Map(
        localiseTemplates(await listAllTemplateSummaries(), dict).map((template) => [
          template.id,
          template.name,
        ]),
      )
    : new Map<string, string>();

  return (
    <>
      <Header locale={locale} strings={{ ...dict.ui.nav, language: dict.ui.localeSwitcher.label }} />
      <main className="pt-[4.5rem]">
        <section className="px-[var(--spacing-gutter)] pb-16 pt-[var(--spacing-section)]">
          <div className="mx-auto w-full max-w-[86rem]">
            <SectionHeading
              eyebrow={dict.ui.works.eyebrow}
              title={dict.ui.works.title}
              lead={dict.ui.works.lead}
            />

            <Reveal preset="fade">
              <GalleryTabs
                active="works"
                templatesLabel={dict.ui.works.tabTemplates}
                worksLabel={dict.ui.works.tabWorks}
              />
            </Reveal>

            <RevealGroup
              step={0.08}
              className="mt-14 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
            >
              {works.map((work) => (
                <Reveal key={work.id} preset="fade">
                  <article className="group flex h-full flex-col">
                    <Link href={`/works/${work.id}`} className="block">
                      <PhoneFrame
                        className="max-w-[15rem] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5"
                        label={work.title}
                      >
                        <WorkPreview
                          src={workEntryUrl(work)}
                          cover={work.cover}
                          title={work.title}
                          ratio={PHONE_SCREEN_RATIO}
                          enabled={work.livePreview !== false}
                        />
                      </PhoneFrame>
                    </Link>

                    <div className="mt-6 flex flex-1 flex-col">
                      <div className="flex items-baseline justify-between gap-4">
                        <h2 className="font-display text-title leading-none text-ink">
                          <Link
                            href={`/works/${work.id}`}
                            className="transition-colors hover:text-accent"
                          >
                            {work.title}
                          </Link>
                        </h2>
                        <span className="eyebrow shrink-0 text-ink-faint tabular-nums">
                          {work.year}
                        </span>
                      </div>

                      <p className="mt-3 text-caption text-ink-soft">
                        {occasionLabel(work.occasion, dict)}
                      </p>

                      {work.portedTo ? (
                        <p className="mt-4 text-caption text-ink-muted">
                          {dict.ui.works.basedTemplate}:{' '}
                          <Link
                            href={`/templates/${work.portedTo}`}
                            className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                          >
                            {templateNames.get(work.portedTo) ?? work.portedTo}
                          </Link>
                        </p>
                      ) : null}

                      <Link
                        href={`/works/${work.id}`}
                        className="mt-5 inline-flex items-center gap-2 text-caption text-ink transition-colors hover:text-accent"
                      >
                        {dict.ui.works.open}
                      </Link>
                    </div>
                  </article>
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </section>
      </main>
      <Footer strings={dict.ui.footer} />
    </>
  );
}
