'use client';

import type { CardSection } from '@/lib/card/schema';
import type { MotifId, SceneId } from '@/lib/card/template';
import { ClosingSection } from './ClosingSection';
import { CoverSection } from './CoverSection';
import { EnvelopeSection } from './EnvelopeSection';
import { FinalSection } from './FinalSection';
import { GallerySection } from './GallerySection';
import { IntroSection } from './IntroSection';
import { LetterSection } from './LetterSection';
import { MemoriesSection } from './MemoriesSection';
import { QuoteSection } from './QuoteSection';
import { TimelineSection } from './TimelineSection';
import { WishesSection } from './WishesSection';

/**
 * THE SECTION REGISTRY
 *
 * One exhaustive switch is the whole dispatch layer. Because `CardSection` is
 * a discriminated union, TypeScript fails the build if a new section kind is
 * added to the schema without a component to render it — the registry can
 * never silently fall out of sync with the data model.
 */
export type SectionContext = {
  scene: SceneId;
  motif: MotifId;
  senderInitial: string;
};

export function SectionRenderer({
  section,
  context,
}: {
  section: CardSection;
  context: SectionContext;
}) {
  switch (section.type) {
    case 'cover':
      return <CoverSection section={section} scene={context.scene} motif={context.motif} />;
    case 'envelope':
      return <EnvelopeSection section={section} senderInitial={context.senderInitial} />;
    case 'intro':
      return <IntroSection section={section} />;
    case 'letter':
      return <LetterSection section={section} />;
    case 'gallery':
      return <GallerySection section={section} />;
    case 'timeline':
      return <TimelineSection section={section} />;
    case 'memories':
      return <MemoriesSection section={section} />;
    case 'quote':
      return <QuoteSection section={section} />;
    case 'wishes':
      return <WishesSection section={section} />;
    case 'final':
      return <FinalSection section={section} scene={context.scene} />;
    case 'closing':
      return <ClosingSection section={section} />;
    default: {
      // Exhaustiveness guard — unreachable while the registry is complete.
      const never: never = section;
      void never;
      return null;
    }
  }
}
