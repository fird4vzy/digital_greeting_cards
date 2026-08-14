'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Beat, BeatLabel } from '@/components/cards/primitives/Beat';
import { Reveal } from '@/components/ui/Reveal';
import { useInView } from '@/lib/hooks/useInView';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import type { SectionOfKind } from '@/lib/card/schema';
import { cn } from '@/lib/utils/cn';
import type { CardStrings } from '@/lib/card/copy';

/**
 * A recording, where a letter would otherwise carry the weight.
 *
 * **Nothing is fetched until the recipient asks for it.** `preload="none"` and
 * a poster, and the `<video>` is not even mounted until the beat is near the
 * viewport. That is not an optimisation, it is the beat's reason to exist at
 * all: this card is opened standing next to a bouquet, usually on mobile data,
 * often before the person has found a vase. Every other beat in the product
 * costs kilobytes; this one can cost ten megabytes, and it must never spend
 * them on somebody who scrolled past.
 *
 * Autoplay is muted, inline and in-view only — the three conditions every
 * mobile browser requires before it will start a clip at all — and reduced
 * motion turns it off entirely, leaving the controls. Scrolling away pauses it,
 * the same rule the WebGL layer follows.
 */
export function VideoSection({
  section,
  strings,
}: {
  section: SectionOfKind<'video'>;
  strings: CardStrings;
}) {
  const variant = section.variant ?? 'full';
  const { video } = section;
  const { reduced, ready } = useMotionPrefs();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '200px' });
  const element = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  // Mounted only once it is worth mounting. Before that the poster stands in,
  // and the browser has been asked for nothing at all.
  const mounted = inView || started;

  const play = useCallback(() => {
    setStarted(true);
    // The ref is null on the click that mounts the element, so the play call
    // waits for the next paint rather than being dropped.
    requestAnimationFrame(() => {
      const node = element.current;
      if (!node) return;
      node.muted = false;
      void node.play().catch(() => {
        // Refused (no gesture credited, codec, autoplay policy). The controls
        // are already on screen, so there is nothing to recover — pressing
        // play again is the whole fallback.
      });
    });
  }, []);

  useEffect(() => {
    const node = element.current;
    if (!node || started) return;

    // Ambient autoplay: silent, and only while it is actually on screen.
    if (inView && ready && !reduced) {
      void node.play().catch(() => {});
    } else if (!inView) {
      node.pause();
    }
  }, [inView, ready, reduced, started]);

  const aspect =
    video.width && video.height ? `${video.width} / ${video.height}` : '9 / 16';

  const frame = (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-[1.25rem]',
        // A window is darker than the wall around it. On the `screen` variant
        // the box is near-black even in a light palette, which is what stops
        // the clip reading as an illustration pasted onto paper.
        variant === 'screen'
          ? 'bg-[color-mix(in_srgb,var(--card-ink)_92%,#000)]'
          : 'bg-[color-mix(in_srgb,var(--card-bg)_80%,#000)]',
      )}
      style={{ aspectRatio: aspect }}
    >
      {video.poster ? (
        // Deliberately a plain <img>: the poster may be an absolute URL on
        // storage this deployment has not been configured to optimise, and a
        // card that has already been printed onto a tag must not stop working
        // because of an image-domain setting.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={video.poster}
          alt={video.alt ?? ''}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {mounted ? (
        <video
          ref={element}
          src={video.url}
          poster={video.poster}
          className="absolute inset-0 h-full w-full object-cover"
          preload="none"
          muted={!started}
          loop={!started}
          playsInline
          controls={started}
          aria-label={video.alt ?? section.title ?? strings.video.title}
        >
          {strings.video.unsupported}
        </video>
      ) : null}

      {!started ? (
        <button
          type="button"
          onClick={play}
          className="absolute inset-0 grid place-content-center bg-black/10 transition-colors duration-500 hover:bg-black/20"
          aria-label={strings.video.play}
        >
          <span className="grid h-16 w-16 place-content-center rounded-full bg-[var(--card-bg)]/85 shadow-[var(--shadow-float)] backdrop-blur-sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ml-1 h-6 w-6">
              <path d="M8 5.5v13l11-6.5z" fill="var(--card-ink)" />
            </svg>
          </span>
        </button>
      ) : null}
    </div>
  );

  const caption = video.caption ? (
    <p className="mt-4 text-caption text-[var(--card-ink-muted)]">{video.caption}</p>
  ) : null;

  /**
   * `screen` is the original's own framing: the title above in the display
   * face, the clip in a near-black box lit from behind by the palette, and a
   * small pulsing cue underneath.
   *
   * The dark box is the point. Every other beat in a light template sits on
   * paper; this one deliberately does not, because a video is a window and a
   * window is darker than the wall around it. Without that the clip reads as
   * an illustration pasted onto the page.
   */
  if (variant === 'screen') {
    return (
      <section className="py-24 sm:py-32">
        <div className="mx-auto w-full max-w-[34rem] px-[var(--spacing-gutter)] text-center">
          {section.title ? (
            <Reveal preset="rise" as="h2" className="block">
              <span className="card-display block text-[clamp(2.375rem,1.5rem+3.5vw,3.75rem)] leading-none text-[var(--card-ink-soft)]">
                {section.title}
              </span>
            </Reveal>
          ) : null}

          <Reveal preset="fade" delay={0.3} className="mt-6 block">
            <div
              className="overflow-hidden rounded-[1.25rem]"
              style={{
                boxShadow:
                  '0 30px 80px color-mix(in srgb, var(--card-ink) 26%, transparent), 0 0 55px color-mix(in srgb, var(--card-accent-soft) 24%, transparent)',
              }}
            >
              {frame}
            </div>
          </Reveal>

          <Reveal preset="fade" delay={0.7} className="block">
            <p
              data-motion="pulse-text"
              className="mt-4 text-[0.625rem] uppercase tracking-[0.2em] text-[var(--card-ink-muted)]"
              style={{
                animation: reduced ? undefined : 'cardPulseText 2.5s ease-in-out infinite',
              }}
            >
              {strings.video.play}
            </p>
          </Reveal>

          {caption}
        </div>
      </section>
    );
  }

  if (variant === 'framed') {
    return (
      <Beat innerClassName="max-w-[30rem]">
        {section.title ? (
          <Reveal preset="fade">
            <BeatLabel>{section.title}</BeatLabel>
          </Reveal>
        ) : null}

        <Reveal preset="fade" className="mt-8">
          <div className="bg-[color-mix(in_srgb,var(--card-bg)_88%,#fff)] p-3 pb-6 shadow-[var(--shadow-float)]">
            {frame}
            {caption}
          </div>
        </Reveal>
      </Beat>
    );
  }

  // full — the clip gets the screen, the way the stack gallery gives each
  // photograph a page of its own.
  return (
    <section className="py-24 sm:py-32">
      {section.title ? (
        <div className="mx-auto w-full max-w-[42rem] px-[var(--spacing-gutter)]">
          <Reveal preset="fade">
            <BeatLabel>{section.title}</BeatLabel>
          </Reveal>
        </div>
      ) : null}

      <Reveal preset="fade" className="mt-6">
        <div className="mx-auto w-full max-w-[34rem] px-[var(--spacing-gutter)] sm:px-0">
          {frame}
          {caption}
        </div>
      </Reveal>
    </section>
  );
}
