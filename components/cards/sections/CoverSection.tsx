'use client';

import { motion } from 'framer-motion';
import { Reveal } from '@/components/ui/Reveal';
import { Atmosphere } from '@/components/three/Atmosphere';
import { Motif } from '@/components/cards/primitives/Motif';
import { ScrollHint } from '@/components/cards/primitives/Beat';
import type { SectionOfKind } from '@/lib/card/schema';
import type { MotifId, SceneId } from '@/lib/card/template';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { cn } from '@/lib/utils/cn';

type Props = {
  section: SectionOfKind<'cover'>;
  scene: SceneId;
  motif: MotifId;
};

/**
 * Screen one. The reader has just scanned a QR code standing next to a
 * bouquet; this is the moment that decides whether the product feels like a
 * gift or like a web page.
 *
 * Four variants, one job: hold the name, hold the promise, then get out of
 * the way.
 */
export function CoverSection({ section, scene, motif }: Props) {
  const variant = section.variant ?? 'glow';
  const { reduced } = useMotionPrefs();

  /**
   * `gradient` sets the name in colour that moves along it — the signature of
   * the hand-written card this variant was ported from. It is a real gradient
   * clipped to the glyphs rather than a tinted fill, so the letterforms carry
   * the palette's own accent through three stops and back.
   *
   * The tracking is tighter and the leading shorter than the other covers:
   * this treatment wants the name to read as one mass, and air between the
   * letters would undo it.
   */
  const name =
    variant === 'gradient' ? (
      <Reveal preset="rise" immediate as="span" className="block">
        <span
          data-motion="gradient-text"
          className="card-display block bg-clip-text text-display-xl leading-[0.9] tracking-[-0.045em] text-transparent"
          style={{
            backgroundImage:
              'linear-gradient(90deg, var(--card-ink-muted), var(--card-accent), var(--card-ink-soft), var(--card-ink-muted))',
            backgroundSize: '300%',
            animation: 'cardGradientText 7s ease infinite',
          }}
        >
          {section.recipientName},
        </span>
      </Reveal>
    ) : (
      <Reveal preset="rise" immediate as="span" className="block">
        <span className="card-display block text-display-xl leading-[0.92] tracking-[-0.03em]">
          {section.recipientName},
        </span>
      </Reveal>
    );

  const headline = (
    <Reveal preset="rise" immediate delay={0.35} as="p" className="block">
      <span className="card-display block text-display-sm italic leading-[1.15] text-[var(--card-ink-soft)]">
        {section.headline}
      </span>
    </Reveal>
  );

  const subline = section.subline ? (
    <Reveal preset="fade" immediate delay={0.6} as="p">
      <span className="mt-6 block max-w-[30ch] text-body text-[var(--card-ink-muted)]">
        {section.subline}
      </span>
    </Reveal>
  ) : null;

  return (
    <section
      className={cn(
        'relative flex min-h-[100svh] w-full flex-col overflow-hidden px-[var(--spacing-gutter)]',
        variant === 'washi' ? 'justify-end pb-24' : 'justify-center',
      )}
    >
      {/*
        `film` puts the clip behind everything and washes it out, the way the
        card this variant was ported from does: the video is weather, not
        content — you are meant to read across it, not watch it.

        It plays muted, looping and inline, which is the only combination a
        mobile browser will start on its own; reduced motion gets the poster
        and no movement. There is no play control on purpose, because there is
        nothing here to start or finish.
      */}
      {variant === 'film' && section.video ? (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
          {reduced ? (
            section.video.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={section.video.poster}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : null
          ) : (
            <video
              src={section.video.url}
              poster={section.video.poster}
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
          )}

          {/* The wash. Without it the type is unreadable over half the frames
              a video will ever show, and a card that is legible only sometimes
              is not legible. */}
          <div
            className="absolute inset-0 backdrop-blur-[5px]"
            style={{ background: 'color-mix(in srgb, var(--card-bg) 62%, transparent)' }}
          />
        </div>
      ) : null}

      {/* Ambient layer. Renders CSS-only atmosphere unless the device opts in. */}
      <Atmosphere scene={scene} className="absolute inset-0" priority />

      {/* Palette glow — the light source the whole cover is lit by. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: `radial-gradient(circle, var(--card-glow) 0%, transparent 62%)`,
          opacity: variant === 'glow' ? 1 : 0.55,
        }}
      />

      {variant === 'arch' ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[46%] h-[76vmin] w-[54vmin] max-w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-t-full border border-[var(--card-line)]"
        />
      ) : null}

      {variant === 'washi' ? (
        <Motif
          id={motif}
          className="pointer-events-none absolute -right-6 top-10 h-56 w-56 text-[var(--card-accent)] opacity-30 sm:h-72 sm:w-72"
        />
      ) : null}

      <div
        className={cn(
          'relative mx-auto w-full',
          variant === 'washi' ? 'max-w-[38rem] pl-[8vw] text-left' : 'max-w-[44rem] text-center',
        )}
        // A shadow rather than a heavier wash: the video should still read as a
        // moving picture, and darkening it enough for bare type would flatten
        // it into a texture.
        style={
          variant === 'film'
            ? { textShadow: '0 2px 10px color-mix(in srgb, var(--card-bg) 85%, transparent)' }
            : undefined
        }
      >
        {variant === 'paper' || variant === 'arch' ? (
          <Reveal preset="fade" immediate as="div">
            <span
              aria-hidden="true"
              className="mx-auto mb-10 block h-px w-16 bg-[var(--card-line)]"
            />
          </Reveal>
        ) : null}

        {name}
        <span className="block h-4" />
        {headline}
        {subline}

        {variant === 'washi' ? (
          <span
            aria-hidden="true"
            className="mt-12 block h-24 w-px bg-gradient-to-b from-[var(--card-accent)] to-transparent opacity-60"
          />
        ) : null}
      </div>

      {section.hint ? (
        <motion.div
          className={cn(
            'absolute inset-x-0 bottom-9 flex justify-center',
            variant === 'washi' && 'justify-start pl-[8vw]',
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 1.8, duration: 1 }}
        >
          <ScrollHint label={section.hint} />
        </motion.div>
      ) : null}
    </section>
  );
}
