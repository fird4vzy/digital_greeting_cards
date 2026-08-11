import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { BouquetSection } from '@/components/marketing/BouquetSection';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { FeelingSection } from '@/components/marketing/FeelingSection';
import { Hero } from '@/components/marketing/Hero';
import { MemoriesSection } from '@/components/marketing/MemoriesSection';
import { StorySection } from '@/components/marketing/StorySection';
import { listTemplateSummaries } from '@/templates';

/**
 * The landing page.
 *
 * Six beats, in the order someone actually makes this decision: feel
 * something → find the story that fits → realise how personal it can get →
 * understand how it reaches them → act.
 */
export default function HomePage() {
  const templates = listTemplateSummaries();

  return (
    <>
      <Header overlay />
      <main id="main">
        <Hero />
        <FeelingSection />
        <StorySection templates={templates} />
        <MemoriesSection />
        <BouquetSection />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
