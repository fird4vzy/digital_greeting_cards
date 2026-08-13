import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { SectionHeading } from '@/components/marketing/SectionHeading';
import { PhoneFrame } from '@/components/marketing/PhoneFrame';
import { TemplateStage } from '@/components/marketing/TemplateStage';
import { EarningsCalculator } from '@/components/shops/EarningsCalculator';
import { ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { copyFor } from '@/lib/card/copy';
import { localiseTemplate } from '@/lib/i18n/localise';
import { getI18n } from '@/lib/i18n/server';
import { toSummary } from '@/lib/card/template';
import { OFFER } from '@/lib/shops/offer';
import { resolveTemplate } from '@/templates';

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getI18n();

  return {
    title: dict.ui.shops.metaTitle,
    description: dict.ui.shops.metaDescription,
  };
}

/**
 * The page for flower shops.
 *
 * A different audience from the rest of the site, so a different argument.
 * The landing page sells a feeling to someone buying a gift; this sells a
 * margin to someone running a counter, and it leads with the two things they
 * actually weigh — what it pays and how long it takes — before it shows them
 * anything pretty.
 *
 * Deliberately built as a page of its own rather than as a rewrite of the
 * homepage. The homepage is what a shop forwards to *its* customer, and it is
 * written for exactly that; rewriting it for an audience nobody has spoken to
 * yet would be optimising blind.
 */
export default async function ShopsPage() {
  const { locale, dict } = await getI18n();
  const t = dict.ui.shops;

  // A real template playing itself, not a screenshot: the product's whole
  // claim is that these are alive, and a florist deciding whether to sell it
  // should see the thing rather than a picture of the thing.
  // `toSummary` is load-bearing, not tidiness: a full TemplateDefinition
  // carries its `compose` function, and React refuses to hand a function to a
  // client component. The summary is the same object without it.
  const template = localiseTemplate(toSummary(resolveTemplate('romantic')), dict);
  const demo = copyFor('love', locale);

  const telegramUrl = `https://t.me/${OFFER.telegram.replace('@', '')}`;

  return (
    <>
      <Header
        locale={locale}
        strings={{ ...dict.ui.nav, language: dict.ui.localeSwitcher.label }}
      />

      <main id="main">
        {/* 1 — what it pays and what it costs in effort, before anything else */}
        <section className="px-[var(--spacing-gutter)] pb-16 pt-32 sm:pt-40">
          <div className="mx-auto max-w-[62rem]">
            <SectionHeading eyebrow={t.hero.eyebrow} title={t.hero.title} lead={t.hero.lead} />

            <Reveal preset="fade">
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={telegramUrl}>{t.hero.cta}</ButtonLink>
                <ButtonLink href="/templates/romantic" variant="secondary">
                  {t.hero.secondary}
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {/* The whole proposition in one frame: flowers, a tag, a code. A
              florist understands the business from this before reading a
              word of it, which no paragraph on this page manages. */}
          <Reveal preset="fade">
            <div className="mx-auto mt-14 max-w-[62rem] overflow-hidden rounded-[1.5rem] border border-line">
              <Image
                src="/brand/bouquet-tag.webp"
                alt={t.hero.imageAlt}
                width={1600}
                height={1073}
                priority
                sizes="(max-width: 62rem) 100vw, 62rem"
                className="h-auto w-full"
              />
            </div>
          </Reveal>
        </section>

        {/* 2 — the numbers, on the florist's own figures */}
        <section className="px-[var(--spacing-gutter)] py-16">
          <div className="mx-auto max-w-[62rem]">
            <SectionHeading eyebrow={t.earnings.eyebrow} title={t.earnings.title} lead={t.earnings.lead} />

            <div className="mt-10">
              <EarningsCalculator
                locale={locale}
                strings={{
                  bouquetPrice: t.earnings.bouquetPrice,
                  cardsPerMonth: t.earnings.cardsPerMonth,
                  cardPrice: t.earnings.cardPrice,
                  perCard: t.earnings.perCard,
                  perMonth: t.earnings.perMonth,
                  fee: t.earnings.fee,
                  feeNote: t.earnings.feeNote,
                }}
              />
            </div>

            <Reveal preset="fade">
              <p className="mt-6 rounded-full border border-accent/25 bg-accent/[0.06] px-5 py-3 text-center text-caption text-ink-soft">
                {t.earnings.free.replace('{count}', String(OFFER.freeCards))}
              </p>
            </Reveal>
          </div>
        </section>

        {/* 3 — the product, playing itself */}
        <section className="px-[var(--spacing-gutter)] py-16">
          <div className="mx-auto grid max-w-[62rem] items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div>
              <SectionHeading eyebrow={t.product.eyebrow} title={t.product.title} lead={t.product.lead} />
              <Reveal preset="fade">
                <p className="mt-6 text-caption text-ink-muted">{t.product.note}</p>
              </Reveal>
            </div>

            <Reveal preset="fade">
              <PhoneFrame className="mx-auto max-w-[15rem]">
                <TemplateStage
                  template={template}
                  locale={locale}
                  content={{
                    name: 'Манзура',
                    letter: demo.intro,
                    final: demo.finalHeadline,
                    from: 'Фирдавс',
                    photos: [],
                  }}
                />
              </PhoneFrame>
            </Reveal>
          </div>
        </section>

        {/* 4 — the workflow, with real timings */}
        <section className="px-[var(--spacing-gutter)] py-16">
          <div className="mx-auto max-w-[62rem]">
            <SectionHeading eyebrow={t.workflow.eyebrow} title={t.workflow.title} lead={t.workflow.lead} />

            <ol className="mt-10 grid gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line sm:grid-cols-3">
              {t.workflow.steps.map((step, index) => (
                <li key={index} className="bg-paper p-6">
                  <span className="eyebrow text-accent">{step.time}</span>
                  <h3 className="mt-3 font-display text-title leading-none text-ink">{step.title}</h3>
                  <p className="mt-3 text-caption leading-relaxed text-ink-soft">{step.body}</p>
                </li>
              ))}
            </ol>

            <Reveal preset="fade">
              <p className="mt-6 text-caption text-ink-muted">{t.workflow.total}</p>
            </Reveal>
          </div>
        </section>

        {/* 5 — the questions a shop actually asks, answered plainly */}
        <section className="px-[var(--spacing-gutter)] py-16">
          <div className="mx-auto max-w-[46rem]">
            <SectionHeading eyebrow={t.objections.eyebrow} title={t.objections.title} />

            <dl className="mt-10 divide-y divide-line border-y border-line">
              {t.objections.items.map((item, index) => (
                <div key={index} className="py-6">
                  <dt className="font-display text-[1.15rem] leading-snug text-ink">{item.q}</dt>
                  <dd className="mt-2.5 text-caption leading-relaxed text-ink-soft">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* 6 — a conversation, not a signup form. The first shops close in one */}
        <section className="px-[var(--spacing-gutter)] pb-32 pt-16">
          <div className="mx-auto max-w-[46rem] rounded-[1.5rem] border border-line-strong bg-white/70 p-9 text-center sm:p-12">
            <SectionHeading
              eyebrow={t.contact.eyebrow}
              title={t.contact.title}
              lead={t.contact.lead}
              align="center"
            />

            <Reveal preset="fade">
              <div className="mt-9 flex flex-col items-center gap-4">
                <ButtonLink href={telegramUrl}>{t.contact.cta}</ButtonLink>
                <p className="text-caption text-ink-faint">{t.contact.note}</p>
                <Link
                  href={telegramUrl}
                  className="text-caption text-ink-muted underline underline-offset-4 hover:text-ink"
                >
                  {OFFER.telegram}
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer strings={dict.ui.footer} />
    </>
  );
}
