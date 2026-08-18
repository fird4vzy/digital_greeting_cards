import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { TemplateCard } from '@/components/marketing/TemplateCard';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { GalleryTabs } from '@/components/marketing/GalleryTabs';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { OCCASIONS, type OccasionId } from '@/lib/card/taxonomy';
import { localiseTemplates, localisedOccasions, occasionLabel } from '@/lib/i18n/localise';
import { getI18n } from '@/lib/i18n/server';
import { t } from '@/lib/i18n';
import { listAllTemplateSummaries } from '@/lib/card/registry';
import { cn } from '@/lib/utils/cn';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();
  return { title: dict.ui.templates.metaTitle, description: dict.ui.templates.metaDescription };
}

type Props = { searchParams: Promise<{ feeling?: string }> };

export default async function TemplatesPage({ searchParams }: Props) {
  const { feeling } = await searchParams;
  const { locale, dict } = await getI18n();

  const all = localiseTemplates(await listAllTemplateSummaries(), dict);
  const active = OCCASIONS.some((o) => o.id === feeling) ? (feeling as OccasionId) : undefined;
  const templates = active ? all.filter((template) => template.occasions.includes(active)) : all;

  return (
    <>
      <Header locale={locale} strings={{ ...dict.ui.nav, language: dict.ui.localeSwitcher.label }} />
      <main className="pt-[4.5rem]">
        <section className="px-[var(--spacing-gutter)] pb-16 pt-[var(--spacing-section)]">
          <div className="mx-auto w-full max-w-[86rem]">
            <SectionHeading
              eyebrow={dict.ui.templates.eyebrow}
              title={dict.ui.templates.title}
              lead={dict.ui.templates.lead}
            />

            <Reveal preset="fade">
              <GalleryTabs
                active="templates"
                templatesLabel={dict.ui.works.tabTemplates}
                worksLabel={dict.ui.works.tabWorks}
              />
            </Reveal>

            {/* Filter by feeling. Plain links, so the filter is shareable and
                survives a page refresh. */}
            <Reveal preset="fade">
              <div className="mt-8 flex flex-wrap gap-2">
                <FilterChip href="/templates" active={!active}>
                  {dict.ui.templates.everything}
                </FilterChip>
                {localisedOccasions(dict).map((occasion) => (
                  <FilterChip
                    key={occasion.id}
                    href={`/templates?feeling=${occasion.id}`}
                    active={active === occasion.id}
                  >
                    {occasion.label}
                  </FilterChip>
                ))}
              </div>
            </Reveal>

            {active ? (
              <p className="mt-8 text-caption text-ink-muted">
                {t(dict.ui.templates.countLine, {
                  count: templates.length,
                  feeling: occasionLabel(active, dict),
                })}
              </p>
            ) : null}

            <RevealGroup
              step={0.08}
              className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
            >
              {templates.map((template) => (
                <Reveal key={template.id} preset="fade">
                  <TemplateCard
                    template={template}
                    strings={dict.ui.templates}
                    dict={dict}
                    locale={locale}
                  />
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

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-9 items-center rounded-full border px-4 text-caption transition-colors duration-400',
        active
          ? 'border-ink bg-ink text-paper'
          : 'border-line-strong text-ink-soft hover:border-ink hover:text-ink',
      )}
    >
      {children}
    </Link>
  );
}
