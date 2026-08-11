import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { palettes, photoColors } from '@/lib/design/palettes';
import { photoPlaceholder } from '@/lib/utils/placeholder';
import { SectionHeading } from './SectionHeading';

/**
 * "Add your memories" — what actually goes into a card.
 *
 * Shown as the raw ingredients on a work surface rather than as a feature
 * list, because the point is that the specifics are the product: the flower
 * she mentioned once, the date nobody else remembers.
 */

const INGREDIENTS = [
  {
    label: 'Their name',
    body: 'Alina',
    display: true,
    tilt: '-1.6deg',
    span: 'sm:col-span-4',
  },
  {
    label: 'A date',
    body: 'March 2023 — the coffee argument',
    tilt: '1.2deg',
    span: 'sm:col-span-5',
  },
  {
    label: 'Something only you would know',
    body: 'She said peonies look like they are mid-sentence.',
    tilt: '-0.8deg',
    span: 'sm:col-span-3',
  },
  {
    label: 'The message',
    body: 'I have started this eleven times. Every version sounded either too small or too much, so here is the plain one.',
    tilt: '0.9deg',
    span: 'sm:col-span-7',
  },
  {
    label: 'A memory',
    body: 'The train we missed. Best four hours of that year.',
    tilt: '-1.1deg',
    span: 'sm:col-span-5',
  },
] as const;

const PHOTOS = [0, 1, 2, 3].map((index) =>
  photoPlaceholder(`memories-${index}`, {
    colors: photoColors(palettes.duskRose),
    width: 600,
    height: 750,
  }),
);

export function MemoriesSection() {
  return (
    <section className="relative px-[var(--spacing-gutter)] py-[var(--spacing-section)]">
      <div className="mx-auto w-full max-w-[86rem]">
        <SectionHeading
          eyebrow="Step three"
          title="Add your memories."
          lead="A name, a message, photographs, the dates that only mean something to the two of you. We turn them into the card; you just have to remember them."
        />

        <RevealGroup step={0.09} className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-12 sm:gap-5">
          {INGREDIENTS.map((item) => (
            <Reveal key={item.label} preset="fade" className={item.span}>
              <div
                className="h-full rounded-[1.25rem] border border-line bg-white/70 p-6 shadow-[var(--shadow-lift)] transition-transform duration-700 ease-[var(--ease-out-expo)] hover:rotate-0 sm:p-7"
                style={{ rotate: item.tilt }}
              >
                <span className="eyebrow text-accent">{item.label}</span>
                <p
                  className={
                    'display' in item && item.display
                      ? 'mt-4 font-display text-display-sm leading-none text-ink'
                      : 'mt-3.5 text-body leading-relaxed text-pretty text-ink-soft'
                  }
                >
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}

          <Reveal preset="fade" className="sm:col-span-5">
            <div
              className="h-full rounded-[1.25rem] border border-line bg-white/70 p-6 shadow-[var(--shadow-lift)] sm:p-7"
              style={{ rotate: '1.4deg' }}
            >
              <span className="eyebrow text-accent">Photographs</span>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {PHOTOS.map((url, index) => (
                  <span
                    key={url}
                    className="block overflow-hidden rounded-[4px]"
                    style={{ aspectRatio: '3 / 4', rotate: `${index % 2 ? 2 : -2}deg` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  );
}
