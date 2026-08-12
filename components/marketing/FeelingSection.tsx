import Link from 'next/link';
import { Motif } from '@/components/cards/primitives/Motif';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { SectionHeading } from './SectionHeading';
import { type OccasionId } from '@/lib/card/taxonomy';
import type { Dictionary } from '@/lib/i18n/types';
import { localisedOccasions, type LocalisedOccasion } from '@/lib/i18n/localise';
import { getPalette, moodyColors, type PaletteId } from '@/lib/design/palettes';
import { photoPlaceholder } from '@/lib/utils/placeholder';
import { cn } from '@/lib/utils/cn';

/**
 * "Choose a feeling" — the entry point into the product.
 *
 * People do not shop for templates, they shop for a feeling, so this comes
 * before any mention of design. Each card is generated from the palette its
 * templates actually use: the colour you pick here is the colour you get.
 *
 * Laid out as three explicit rows rather than one auto-flowing grid. Cards
 * vary by *width*, never by height, which keeps the baselines clean while
 * still reading as an editorial spread instead of a product listing.
 */

const FEELING_PALETTE: Record<OccasionId, PaletteId> = {
  love: 'duskRose',
  birthday: 'champagne',
  'for-mom': 'linen',
  anniversary: 'midnightBrass',
  friendship: 'champagne',
  celebration: 'duskRose',
  'just-because': 'washi',
};



const ROWS: { height: string; items: { id: OccasionId; span: string }[] }[] = [
  {
    height: 'h-[19rem] sm:h-[24rem] lg:h-[28rem]',
    items: [
      { id: 'love', span: 'col-span-6 lg:col-span-5' },
      { id: 'birthday', span: 'col-span-3 lg:col-span-4' },
      { id: 'for-mom', span: 'col-span-3 lg:col-span-3' },
    ],
  },
  {
    height: 'h-[13rem] sm:h-[16rem] lg:h-[19rem]',
    items: [
      { id: 'anniversary', span: 'col-span-2 lg:col-span-4' },
      { id: 'friendship', span: 'col-span-2 lg:col-span-4' },
      { id: 'celebration', span: 'col-span-2 lg:col-span-4' },
    ],
  },
  {
    height: 'h-[10rem] sm:h-[12rem] lg:h-[14rem]',
    items: [{ id: 'just-because', span: 'col-span-6 lg:col-span-12' }],
  },
];

export function FeelingSection({ dict }: { dict: Dictionary }) {
  const occasions = localisedOccasions(dict);
  const byId = new Map(occasions.map((entry) => [entry.id, entry]));

  return (
    <section className="relative px-[var(--spacing-gutter)] py-[var(--spacing-section)]">
      <div className="mx-auto w-full max-w-[86rem]">
        <SectionHeading
          eyebrow={dict.ui.feeling.eyebrow}
          title={dict.ui.feeling.title}
          lead={dict.ui.feeling.lead}
        />

        <div className="mt-16 space-y-4 lg:space-y-6">
          {ROWS.map((row, rowIndex) => (
            <RevealGroup
              key={rowIndex}
              step={0.07}
              className="grid grid-cols-6 gap-4 lg:grid-cols-12 lg:gap-6"
            >
              {row.items.map((item) => (
                <Reveal key={item.id} preset="fade" className={cn(item.span, row.height)}>
                  <FeelingCard occasion={byId.get(item.id)!} exploreLabel={dict.ui.feeling.explore} />
                </Reveal>
              ))}
            </RevealGroup>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeelingCard({ occasion, exploreLabel }: { occasion: LocalisedOccasion; exploreLabel: string }) {
  const palette = getPalette(FEELING_PALETTE[occasion.id] ?? 'duskRose');

  // Under-exposed: these carry white type across the full bleed.
  const colors = moodyColors(palette);

  return (
    <Link
      href={`/templates?feeling=${occasion.id}`}
      className="group relative block h-full overflow-hidden rounded-[var(--radius-petal)] bg-paper-deep"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photoPlaceholder(`feeling-${occasion.id}`, { colors, width: 1100, height: 1100 })}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full scale-[1.06] object-cover saturate-[0.82] transition-transform duration-[1600ms] ease-[var(--ease-out-expo)] group-hover:scale-100"
      />

      {/* Legibility scrim, weighted to the bottom where the type sits. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-noir/80 via-noir/25 to-noir/5"
      />

      <Motif
        id={occasion.motif}
        strokeWidth={0.9}
        className="absolute right-4 top-4 h-10 w-10 text-paper/35 transition-colors duration-700 ease-[var(--ease-out-expo)] group-hover:text-paper/70 sm:h-12 sm:w-12"
      />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 lg:p-7">
        <h3 className="font-display text-[clamp(1.3rem,1.1rem+0.7vw,1.9rem)] leading-none text-paper">
          {occasion.label}
        </h3>
        <p className="mt-2 max-w-[28ch] text-caption leading-snug text-paper/65">
          {occasion.line}
        </p>
      </div>

      <span className="eyebrow absolute right-5 bottom-5 hidden items-center gap-1.5 text-paper/0 transition-colors duration-500 group-hover:text-paper/85 sm:flex">
        {exploreLabel}
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
          <path
            d="M2 8h11M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Link>
  );
}
