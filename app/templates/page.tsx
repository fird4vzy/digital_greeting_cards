import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { TemplateCard } from '@/components/marketing/TemplateCard';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { OCCASIONS, occasionLabel, type OccasionId } from '@/lib/card/taxonomy';
import { listTemplateSummaries } from '@/templates';
import { cn } from '@/lib/utils/cn';

export const metadata: Metadata = {
  title: 'Templates',
  description:
    'Six ways to say it. Each template is a real experience with its own pace, palette and motion.',
};

type Props = { searchParams: Promise<{ feeling?: string }> };

export default async function TemplatesPage({ searchParams }: Props) {
  const { feeling } = await searchParams;
  const all = listTemplateSummaries();

  const active = OCCASIONS.some((o) => o.id === feeling) ? (feeling as OccasionId) : undefined;
  const templates = active ? all.filter((t) => t.occasions.includes(active)) : all;

  return (
    <>
      <Header />
      <main className="pt-[4.5rem]">
        <section className="px-[var(--spacing-gutter)] pb-16 pt-[var(--spacing-section)]">
          <div className="mx-auto w-full max-w-[86rem]">
            <SectionHeading
              eyebrow="The library"
              title="Choose a story."
              lead="Every template below is playing itself — the same components, palette and motion the finished card will use. Nothing here is a mockup."
            />

            {/* Filter by feeling. Plain links, so the filter is shareable and
                survives a page refresh. */}
            <Reveal preset="fade">
              <div className="mt-12 flex flex-wrap gap-2">
                <FilterChip href="/templates" active={!active}>
                  Everything
                </FilterChip>
                {OCCASIONS.map((occasion) => (
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
                {templates.length} template{templates.length === 1 ? '' : 's'} suited to{' '}
                <span className="text-ink">{occasionLabel(active)}</span>.
              </p>
            ) : null}

            <RevealGroup
              step={0.08}
              className="mt-14 grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
            >
              {templates.map((template) => (
                <Reveal key={template.id} preset="fade">
                  <TemplateCard template={template} />
                </Reveal>
              ))}
            </RevealGroup>
          </div>
        </section>
      </main>
      <Footer />
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
