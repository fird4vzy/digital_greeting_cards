'use client';

import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { easing } from '@/lib/design/motion';
import type { SectionOfKind } from '@/lib/card/schema';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { cn } from '@/lib/utils/cn';

/**
 * The gate.
 *
 * Built with CSS 3D rather than WebGL on purpose: an envelope is four flat
 * planes and a hinge, which CSS transforms render with crisp edges, real text
 * antialiasing and no shader compile — on a mid-range phone it is both better
 * looking and roughly free. The WebGL budget is spent on the ambient scenes,
 * where geometry actually helps.
 *
 * The story below always exists in the DOM; this beat adds ceremony, it does
 * not hold content hostage. That keeps the card readable without JavaScript.
 */
export function EnvelopeSection({
  section,
  senderInitial,
}: {
  section: SectionOfKind<'envelope'>;
  senderInitial: string;
}) {
  const variant = section.variant ?? 'wax';
  const { reduced } = useMotionPrefs();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLElement | null>(null);

  const handleOpen = useCallback(() => {
    if (open) return;
    setOpen(true);

    // Hand the reader off to the next beat once the flap has settled.
    const delay = reduced ? 120 : 1250;
    window.setTimeout(() => {
      const next = rootRef.current?.nextElementSibling;
      next?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }, delay);
  }, [open, reduced]);

  const flapTransition = { duration: reduced ? 0.2 : 0.9, ease: easing.weighted };
  const letterTransition = { duration: reduced ? 0.2 : 1.1, delay: reduced ? 0 : 0.35, ease: easing.out };

  /**
   * `heart` is not an envelope at all.
   *
   * Ported from the hand-written card this template reproduces, where the gate
   * is a heart built out of one rotated square and two circles, with the letter
   * tucked behind it. Tapping shrinks the heart and sends the letter up out of
   * it — the note escaping rather than the packet opening, which is a different
   * promise from a wax seal and belongs to a different kind of card.
   *
   * The geometry is the original's, in its own units: a 125px square turned
   * −45° with one corner left square, and two 125px circles offset by half its
   * width. Those numbers are what make the lobes meet the point cleanly, so
   * they are kept rather than re-derived.
   */
  if (variant === 'heart') {
    return (
      <section
        ref={rootRef}
        className="relative flex min-h-[100svh] w-full flex-col items-center justify-center gap-10 px-[var(--spacing-gutter)] py-20"
      >
        <motion.button
          type="button"
          onClick={handleOpen}
          aria-label={section.prompt ?? 'Open it'}
          data-motion="gentle-float"
          className="relative block cursor-pointer focus-visible:outline-offset-8"
          style={{
            width: 200,
            height: 185,
            animation: reduced ? undefined : 'cardGentleFloat 4s ease-in-out infinite',
          }}
        >
          <motion.span
            aria-hidden="true"
            className="absolute block"
            style={{
              width: 125,
              height: 125,
              left: 37,
              top: 25,
              borderRadius: '18px 18px 18px 0',
              background:
                'linear-gradient(145deg, var(--card-accent-soft), var(--card-accent))',
              boxShadow:
                '0 25px 55px color-mix(in srgb, var(--card-accent) 30%, transparent), 0 0 65px color-mix(in srgb, var(--card-accent-soft) 40%, transparent)',
            }}
            initial={false}
            animate={{ rotate: -45, scale: open ? 0.78 : 1 }}
            whileHover={reduced || open ? undefined : { rotate: -45, scale: 1.08 }}
            whileTap={reduced ? undefined : { rotate: -45, scale: 0.94 }}
            transition={{ duration: reduced ? 0.2 : 0.8, ease: [0.68, -0.55, 0.27, 1.55] }}
          >
            {/* The two lobes. Circles, offset by half the square's width. */}
            {[
              { top: -62, left: 0 },
              { top: 0, left: 62 },
            ].map((offset, index) => (
              <span
                key={index}
                className="absolute block rounded-full"
                style={{
                  width: 125,
                  height: 125,
                  ...offset,
                  background:
                    'linear-gradient(145deg, var(--card-accent-soft), var(--card-accent))',
                }}
              />
            ))}

            {/* The note, behind the heart until it is let out. */}
            <motion.span
              className="absolute z-10 grid place-content-center rounded-[10px]"
              style={{
                width: 100,
                height: 70,
                left: 12,
                top: 28,
                background:
                  'linear-gradient(135deg, color-mix(in srgb, var(--card-bg) 96%, #fff), var(--card-bg))',
                boxShadow: '0 8px 25px color-mix(in srgb, var(--card-ink) 14%, transparent)',
              }}
              initial={false}
              animate={{
                rotate: 45,
                y: open ? -90 : 0,
                scale: open ? 1.12 : 1,
              }}
              transition={{ duration: reduced ? 0.2 : 1, ease: [0.68, -0.55, 0.27, 1.55] }}
            >
              <span
                aria-hidden="true"
                className="text-[2rem] leading-none text-[var(--card-accent)]"
              >
                ♡
              </span>
            </motion.span>
          </motion.span>
        </motion.button>

        <motion.p
          data-motion="pulse-text"
          className="text-[0.6875rem] uppercase tracking-[0.25em] text-[var(--card-ink-muted)]"
          style={{ animation: reduced ? undefined : 'cardPulseText 2.5s ease-in-out infinite' }}
          animate={{ opacity: open ? 0 : undefined }}
          transition={{ duration: 0.4 }}
        >
          {section.prompt ?? 'Open it'}
        </motion.p>

        {section.note ? (
          <p className="max-w-[28ch] text-center text-caption text-[var(--card-ink-muted)]">
            {section.note}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-[100svh] w-full flex-col items-center justify-center gap-12 px-[var(--spacing-gutter)] py-20"
    >
      <div className="[perspective:1400px]">
        <motion.button
          type="button"
          onClick={handleOpen}
          aria-label={open ? 'Envelope opened' : (section.prompt ?? 'Open the envelope')}
          className="group relative block w-[min(78vw,22rem)] cursor-pointer rounded-[3px] focus-visible:outline-offset-8"
          style={{ aspectRatio: '3 / 2', transformStyle: 'preserve-3d' }}
          whileHover={reduced || open ? undefined : { y: -6 }}
          animate={open ? { y: reduced ? 0 : -8, scale: reduced ? 1 : 0.98 } : { y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: easing.out }}
        >
          {/* The letter, rising out of the envelope once the flap lifts. */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-[6%] bottom-[8%] block origin-bottom rounded-[2px] shadow-[var(--shadow-float)]"
            style={{
              height: '86%',
              background:
                'linear-gradient(175deg, color-mix(in srgb, var(--card-bg) 92%, #fff) 0%, var(--card-bg) 100%)',
              border: '1px solid var(--card-line)',
            }}
            initial={{ y: '12%', opacity: 0 }}
            animate={open ? { y: '-46%', opacity: 1 } : { y: '12%', opacity: 0 }}
            transition={letterTransition}
          >
            <span className="flex h-full w-full flex-col justify-center gap-2.5 px-6 pb-10">
              {[92, 78, 86, 64].map((width, index) => (
                <span
                  key={index}
                  className="block h-px bg-[var(--card-line)]"
                  style={{ width: `${width}%` }}
                />
              ))}
            </span>
          </motion.span>

          {/* Envelope body. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 block rounded-[3px] shadow-[var(--shadow-float)]"
            style={{
              background: 'var(--card-accent-soft)',
              border: '1px solid color-mix(in srgb, var(--card-ink) 14%, transparent)',
            }}
          />

          {/* Front pocket — the V that reads as an envelope. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 block rounded-[3px]"
            style={{
              background:
                'linear-gradient(160deg, color-mix(in srgb, var(--card-accent-soft) 88%, #fff) 0%, var(--card-accent-soft) 60%)',
              clipPath: 'polygon(0 32%, 50% 74%, 100% 32%, 100% 100%, 0 100%)',
              borderTop: 'none',
            }}
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 block opacity-40"
            style={{
              clipPath: 'polygon(0 32%, 50% 74%, 100% 32%, 100% 100%, 0 100%)',
              background:
                'linear-gradient(to bottom, color-mix(in srgb, var(--card-ink) 10%, transparent), transparent 24%)',
            }}
          />

          {/* Flap — hinged at the top edge. */}
          <motion.span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 block"
            style={{
              height: '66%',
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              background:
                'linear-gradient(to bottom, color-mix(in srgb, var(--card-accent-soft) 82%, #fff) 0%, var(--card-accent-soft) 100%)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
              boxShadow: '0 10px 22px -18px rgba(0,0,0,0.55)',
            }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: open ? -172 : 0 }}
            transition={flapTransition}
          />

          {/* Seal. Wax for romantic templates, a ribbon knot or washi tape
              elsewhere — same hit area, different ceremony. */}
          <motion.span
            aria-hidden="true"
            className={cn(
              'absolute left-1/2 top-[58%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center',
              variant === 'washi' ? 'h-9 w-24 rounded-[2px]' : 'h-14 w-14 rounded-full',
            )}
            style={{
              background:
                variant === 'washi'
                  ? 'color-mix(in srgb, var(--card-accent) 22%, var(--card-bg))'
                  : 'var(--card-accent)',
              color: variant === 'washi' ? 'var(--card-ink)' : 'var(--card-bg)',
              boxShadow: variant === 'washi' ? 'none' : '0 6px 18px -8px rgba(0,0,0,0.6)',
              opacity: variant === 'washi' ? 0.9 : 1,
            }}
            animate={
              open
                ? { scale: reduced ? 1 : 0.4, opacity: 0, rotate: reduced ? 0 : -25 }
                : { scale: 1, opacity: variant === 'washi' ? 0.9 : 1, rotate: 0 }
            }
            transition={{ duration: reduced ? 0.2 : 0.55, ease: easing.soft }}
          >
            {variant === 'ribbon' ? (
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 13c-3-4-8-4-8-1s5 3 8-1zm0 0c3-4 8-4 8-1s-5 3-8-1zm0 0v8" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="card-display text-[1.05rem] leading-none">{senderInitial}</span>
            )}
          </motion.span>
        </motion.button>
      </div>

      <motion.p
        className="eyebrow text-[var(--card-ink-muted)]"
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        {section.prompt ?? 'Open it'}
      </motion.p>

      {section.note ? (
        <p className="max-w-[28ch] text-center text-caption text-[var(--card-ink-muted)]">{section.note}</p>
      ) : null}
    </section>
  );
}
