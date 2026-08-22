import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { BouquetSection } from '@/components/marketing/BouquetSection';
import { BouquetScrollStage } from '@/components/marketing/BouquetScrollStage';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { FeelingSection } from '@/components/marketing/FeelingSection';
import { Hero } from '@/components/marketing/Hero';
import { MemoriesSection } from '@/components/marketing/MemoriesSection';
import { StorySection } from '@/components/marketing/StorySection';
import { localiseTemplates } from '@/lib/i18n/localise';
import { getI18n } from '@/lib/i18n/server';
import { listAllTemplateSummaries } from '@/lib/card/registry';

/**
 * The landing page.
 *
 * Six beats, in the order someone actually makes this decision: feel
 * something → find the story that fits → realise how personal it can get →
 * understand how it reaches them → act.
 *
 * The dictionary is read once here and handed down as props. Client
 * components never import a dictionary, so a browser only downloads the
 * strings that are actually on the page — in one language, not three.
 */
export default async function HomePage() {
  const { locale, dict } = await getI18n();
  const templates = localiseTemplates(await listAllTemplateSummaries(), dict);

  return (
    <>
      <Header
        overlay
        locale={locale}
        strings={{ ...dict.ui.nav, language: dict.ui.localeSwitcher.label }}
      />
      <main id="main">
        <Hero strings={dict.ui.hero} />
        {/* Собирающийся букет живёт позади этой секции: она прозрачная и
            выше экрана, то есть есть и чему просвечивать, и откуда взяться прогрессу.
            Убрать сцену = снять эту обёртку. */}
        <BouquetScrollStage>
          <FeelingSection dict={dict} />
        </BouquetScrollStage>
        <StorySection templates={templates} strings={dict.ui.story} locale={locale} />
        <MemoriesSection dict={dict} />
        <BouquetSection dict={dict} />
        <ClosingCta strings={dict.ui.closing} />
      </main>
      <Footer strings={dict.ui.footer} />
    </>
  );
}
