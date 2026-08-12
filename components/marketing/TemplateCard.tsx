import Link from 'next/link';
import { PhoneFrame } from './PhoneFrame';
import { TemplateStage } from './TemplateStage';
import { ArrowGlyph } from '@/components/ui/Button';
import type { LocalisedTemplate } from '@/lib/i18n/localise';
import type { Dictionary } from '@/lib/i18n/types';
import { getPalette } from '@/lib/design/palettes';
import { moodLabel, occasionLabel } from '@/lib/i18n/localise';

/**
 * One template in the gallery: a live miniature above the specification the
 * brief asks every template to carry — mood, motion, palette and the sections
 * it can actually render.
 */
export function TemplateCard({
  template,
  strings,
  dict,
  locale,
}: {
  template: LocalisedTemplate;
  strings: Dictionary['ui']['templates'];
  dict: Dictionary;
  locale: string;
}) {
  const palette = getPalette(template.paletteId);

  return (
    <article className="group flex h-full flex-col">
      <Link href={`/templates/${template.id}`} className="block">
        <PhoneFrame
          className="max-w-[15rem] transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5"
          label={`Preview of ${template.name}`}
        >
          <TemplateStage template={template} locale={locale} />
        </PhoneFrame>
      </Link>

      <div className="mt-8 flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-title leading-none text-ink">
            <Link href={`/templates/${template.id}`} className="transition-colors hover:text-accent">
              {template.name}
            </Link>
          </h2>
          <span className="flex shrink-0 items-center gap-1.5">
            {palette.swatches.map((swatch) => (
              <span
                key={swatch}
                title={swatch}
                className="block h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                style={{ background: swatch }}
              />
            ))}
          </span>
        </div>

        <p className="mt-3 text-caption text-ink-soft">{template.tagline}</p>
        <p className="mt-4 flex-1 text-caption leading-relaxed text-ink-muted">
          {template.description}
        </p>

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-caption">
          <Row label={strings.mood}>
            {template.moods.map((mood) => moodLabel(mood, dict)).join(' · ')}
          </Row>
          <Row label={strings.motion}>{template.animationStyle}</Row>
          <Row label={strings.suits}>
            {template.occasions.map((occasion) => occasionLabel(occasion, dict)).join(' · ')}
          </Row>
          <Row label={strings.sections}>
            {template.supportedSections.map(capitalise).join(' · ')}
          </Row>
        </dl>

        <Link
          href={`/templates/${template.id}`}
          className="group/link mt-6 inline-flex items-center gap-2 text-caption text-ink transition-colors hover:text-accent"
        >
          {strings.openPreview}
          <ArrowGlyph className="group-hover/link:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-3">
      <dt className="eyebrow pt-[0.15rem] text-ink-faint">{label}</dt>
      <dd className="text-ink-soft">{children}</dd>
    </div>
  );
}

function capitalise(value: string): string {
  const clean = value.replace(/-/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
