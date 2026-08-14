'use client';

import { motion, useScroll, useSpring } from 'framer-motion';
import type { CardConfig } from '@/lib/card/schema';
import { keepSupported } from '@/lib/card/compose';
import { cardStrings } from '@/lib/card/copy';
import { getPalette, paletteVars } from '@/lib/design/palettes';
import { resolveTemplate } from '@/templates';
import type { TemplateSummary } from '@/lib/card/template';
import { cn } from '@/lib/utils/cn';
import { SectionRenderer } from './sections';

/**
 * THE RENDERER
 *
 * Takes structured card data plus a template id and produces the published
 * experience. It is the only consumer of the template registry at runtime, and
 * it contains no card-specific or template-specific markup whatsoever:
 *
 *   config.sections  →  filtered by what the template supports
 *                    →  each dispatched to a shared section component
 *                    →  styled entirely by CSS custom properties
 *
 * That is why a new template costs one file and no changes here.
 */
export function CardRenderer({
  config,
  className,
  /** Preview mode inside the builder: no progress rail, no min-height games. */
  embedded = false,
  template: provided,
}: {
  config: CardConfig;
  className?: string;
  embedded?: boolean;
  /**
   * The card's template, when the caller had to look it up asynchronously.
   *
   * This component runs in the browser, so on its own it can only read the
   * compiled registry — a template an operator built lives in the database and
   * is invisible from here. Server pages resolve it and hand it over. Without
   * that, a card on a stored template would quietly fall back to the default
   * template's palette and scene, which reads as a design bug rather than a
   * lookup that could not happen.
   */
  template?: TemplateSummary;
}) {
  const template = provided ?? resolveTemplate(config.templateId);
  const palette = getPalette(config.paletteId ?? template.paletteId);
  const sections = keepSupported(config.sections, template.supportedSections);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.3 });

  // The card's locale, never the reader's: a Russian card stays Russian on an
  // English phone, and its chrome has to follow its content.
  const strings = cardStrings(config.locale);

  const senderInitial = (config.sender.name?.trim()?.charAt(0) || '♥').toUpperCase();

  return (
    <div
      className={cn('card-scope grain relative isolate min-h-[100svh] w-full', className)}
      style={paletteVars(palette)}
      data-template={template.id}
      data-scheme={palette.scheme}
    >
      {!embedded ? (
        <motion.div
          aria-hidden="true"
          className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-[var(--card-accent)]"
          style={{ scaleX: progress }}
        />
      ) : null}

      {sections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          context={{ scene: template.scene, motif: template.motif, senderInitial, strings }}
        />
      ))}
    </div>
  );
}
