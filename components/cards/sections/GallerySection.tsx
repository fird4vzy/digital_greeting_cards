'use client';

import { CardPhoto } from '@/components/cards/primitives/CardPhoto';
import { Beat, BeatLabel } from '@/components/cards/primitives/Beat';
import { Reveal } from '@/components/ui/Reveal';
import type { SectionOfKind } from '@/lib/card/schema';
import { cn } from '@/lib/utils/cn';

/**
 * Photographs, four ways.
 *
 * Every variant is a different *editing* decision rather than a different
 * layout engine: stack gives each photo a full page, mosaic makes an
 * asymmetric spread, filmstrip turns the set into something you scrub with a
 * thumb, and polaroid lays them out as if dropped on a table.
 */
export function GallerySection({ section }: { section: SectionOfKind<'gallery'> }) {
  const variant = section.variant ?? 'stack';
  const photos = section.photos ?? [];
  if (photos.length === 0) return null;

  const header = section.title ? (
    <Reveal preset="fade">
      <BeatLabel>{section.title}</BeatLabel>
    </Reveal>
  ) : null;

  if (variant === 'filmstrip') {
    return (
      <section className="py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[42rem] px-[var(--spacing-gutter)]">{header}</div>

        <div
          className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[var(--spacing-gutter)] pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="group"
          aria-label={section.title ?? 'Photographs'}
        >
          {photos.map((photo, index) => (
            <div key={photo.id} className="w-[76vw] max-w-[26rem] shrink-0 snap-center">
              <CardPhoto photo={photo} ratio="4 / 5" priority={index === 0} sizes="76vw" />
              <p className="mt-3 text-caption text-[var(--card-ink-muted)]">
                <span className="tabular-nums">{String(index + 1).padStart(2, '0')}</span>
                {photo.caption ? <span className="ml-3">{photo.caption}</span> : null}
              </p>
            </div>
          ))}
        </div>

        {section.caption ? (
          <p className="mx-auto mt-2 max-w-[42rem] px-[var(--spacing-gutter)] text-caption text-[var(--card-ink-muted)]">
            {section.caption}
          </p>
        ) : null}
      </section>
    );
  }

  if (variant === 'polaroid') {
    return (
      <Beat innerClassName="max-w-[46rem]">
        {header}
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-8">
          {photos.map((photo, index) => (
            <Reveal
              key={photo.id}
              preset="fade"
              delay={(index % 2) * 0.08}
              className={cn(index % 2 === 1 && 'mt-10')}
            >
              <div
                className="bg-[color-mix(in_srgb,var(--card-bg)_88%,#fff)] p-2.5 pb-9 shadow-[var(--shadow-float)]"
                style={{ rotate: `${index % 2 === 0 ? -2.2 : 1.8}deg` }}
              >
                <CardPhoto photo={photo} ratio="1 / 1" sizes="(max-width: 640px) 45vw, 22rem" />
                {photo.caption ? (
                  <p className="mt-2 px-1 text-center text-caption text-[var(--card-ink-muted)]">
                    {photo.caption}
                  </p>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </Beat>
    );
  }

  if (variant === 'mosaic') {
    return (
      <Beat innerClassName="max-w-[52rem]">
        {header}
        <div className="mt-8 grid grid-cols-6 gap-3 sm:gap-5">
          {photos.map((photo, index) => {
            // A repeating 4-photo rhythm: tall, wide, small, small.
            const slot = index % 4;
            const span =
              slot === 0
                ? 'col-span-6 sm:col-span-4'
                : slot === 1
                  ? 'col-span-6 sm:col-span-2 sm:mt-12'
                  : 'col-span-3';
            const ratio = slot === 0 ? '4 / 3' : slot === 1 ? '3 / 4' : '1 / 1';
            return (
              <Reveal key={photo.id} preset="fade" className={span}>
                <CardPhoto photo={photo} ratio={ratio} sizes="(max-width: 640px) 90vw, 32rem" />
              </Reveal>
            );
          })}
        </div>
      </Beat>
    );
  }

  // stack — one photograph at a time, full bleed, captions offset into the margin.
  return (
    <section className="py-24 sm:py-32">
      <div className="mx-auto w-full max-w-[42rem] px-[var(--spacing-gutter)]">{header}</div>

      <div className="mt-6 space-y-16 sm:space-y-24">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={cn(
              'relative mx-auto w-full',
              index % 2 === 0 ? 'max-w-[34rem]' : 'max-w-[26rem] sm:ml-[auto] sm:mr-[12%]',
            )}
          >
            <CardPhoto
              photo={photo}
              ratio={index % 3 === 0 ? '4 / 5' : '3 / 4'}
              sizes="(max-width: 640px) 100vw, 34rem"
              className="px-[var(--spacing-gutter)] sm:px-0"
            />
          </div>
        ))}
      </div>

      {section.caption ? (
        <p className="mx-auto mt-10 max-w-[34rem] px-[var(--spacing-gutter)] text-caption text-[var(--card-ink-muted)]">
          {section.caption}
        </p>
      ) : null}
    </section>
  );
}
