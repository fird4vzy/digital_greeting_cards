'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowGlyph, ButtonLink } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import type { LocalisedTemplate } from '@/lib/i18n/localise';
import type { Dictionary } from '@/lib/i18n/types';
import { getPalette } from '@/lib/design/palettes';
import { easing } from '@/lib/design/motion';
import { cn } from '@/lib/utils/cn';
import { PhoneFrame } from './PhoneFrame';
import { SectionHeading } from './SectionHeading';
import { TemplateStage } from './TemplateStage';

/**
 * "Choose a story" — the templates section.
 *
 * Every template is playing its own miniature experience, live, in a phone.
 * Selecting one swaps the phone rather than opening a modal, so the section
 * behaves like a viewfinder: the reader sweeps the library without ever
 * leaving the page.
 */
export function StorySection({
  templates,
  strings,
  locale,
}: {
  templates: LocalisedTemplate[];
  strings: Dictionary['ui']['story'];
  locale: string;
}) {
  const [activeId, setActiveId] = useState(templates[0]?.id ?? '');
  const active = templates.find((template) => template.id === activeId) ?? templates[0];

  if (!active) return null;

  return (
    <section className="relative overflow-hidden bg-paper-warm px-[var(--spacing-gutter)] py-[var(--spacing-section)]">
      <div className="mx-auto w-full max-w-[86rem]">
        <SectionHeading
          eyebrow={strings.eyebrow}
          title={strings.title}
          lead={strings.lead}
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-20">
          {/* The library */}
          <div className="order-2 lg:order-1">
            <ul className="divide-y divide-line">
              {templates.map((template) => {
                const palette = getPalette(template.paletteId);
                const isActive = template.id === active.id;

                return (
                  <li key={template.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveId(template.id)}
                      onFocus={() => setActiveId(template.id)}
                      onClick={() => setActiveId(template.id)}
                      aria-pressed={isActive}
                      className="group relative block w-full py-6 text-left sm:py-7"
                    >
                      {isActive ? (
                        <motion.span
                          layoutId="story-marker"
                          className="absolute -left-4 top-1/2 hidden h-9 w-[2px] -translate-y-1/2 bg-accent sm:block"
                          transition={{ duration: 0.45, ease: easing.out }}
                        />
                      ) : null}

                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h3
                          className={cn(
                            'font-display text-title leading-none transition-colors duration-500',
                            isActive ? 'text-ink' : 'text-ink-muted group-hover:text-ink',
                          )}
                        >
                          {template.name}
                        </h3>
                        <span className="eyebrow text-ink-faint">
                          {template.occasions[0]?.replace('-', ' ')}
                        </span>

                        <span className="ml-auto flex items-center gap-1.5">
                          {palette.swatches.map((swatch) => (
                            <span
                              key={swatch}
                              className="block h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                              style={{ background: swatch }}
                            />
                          ))}
                        </span>
                      </div>

                      <p
                        className={cn(
                          'mt-2.5 max-w-[46ch] text-caption transition-colors duration-500',
                          isActive ? 'text-ink-soft' : 'text-ink-muted',
                        )}
                      >
                        {template.tagline}
                      </p>

                      <p
                        className={cn(
                          'mt-2 text-caption text-ink-faint transition-opacity duration-500',
                          isActive ? 'opacity-100' : 'opacity-0',
                        )}
                      >
                        {template.animationStyle}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Reveal preset="fade">
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <ButtonLink href={`/templates/${active.id}`} variant="secondary">
                  {strings.previewPrefix} {active.name}
                  <ArrowGlyph />
                </ButtonLink>
                <ButtonLink href="/templates" variant="ghost">
                  {strings.allTemplates}
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          {/* The viewfinder */}
          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <Reveal preset="image">
              <PhoneFrame label={`Preview of the ${active.name} template`}>
                <TemplateStage template={active} locale={locale} />
              </PhoneFrame>
            </Reveal>
            <p className="mt-5 text-center text-caption text-ink-muted">
              {strings.livePreview}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
