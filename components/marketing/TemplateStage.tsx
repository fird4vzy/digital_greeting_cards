'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Blossom, Motif } from '@/components/cards/primitives/Motif';
import { COVER_HEADLINE } from '@/lib/card/copy';
import type { TemplateSummary } from '@/lib/card/template';
import { getPalette, paletteVars, photoColors } from '@/lib/design/palettes';
import { easing } from '@/lib/design/motion';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { photoPlaceholder } from '@/lib/utils/placeholder';
import { cn } from '@/lib/utils/cn';

/**
 * A living template preview.
 *
 * Rather than a static thumbnail, this plays the actual arc of a card —
 * arrive, read, look, be told — in the template's own palette and section
 * variants. It is a miniature of the real experience, not a picture of one,
 * which is the difference between "a template gallery" and "a product".
 *
 * It is not the card runtime: it renders four fixed beats at a fraction of
 * the weight, so a gallery of six previews stays cheap.
 */

const DEMO: Record<string, { name: string; letter: string; final: string; from: string }> = {
  romantic: {
    name: 'Alina',
    letter:
      'Two years ago you were a stranger with strong opinions about coffee. Now you are the person I tell things to before I have finished thinking them.',
    final: 'Some people make ordinary days feel a little less ordinary.',
    from: 'Firdavs',
  },
  birthday: {
    name: 'Marta',
    letter:
      'Another year, and you are still the person who answers the phone at 1am and pretends she was awake.',
    final: 'Here is to another year of you being exactly who you are.',
    from: 'Kasia',
  },
  mom: {
    name: 'Mama',
    letter:
      'I called last Sunday and we talked about the weather for twenty minutes, which is our way of saying the other thing.',
    final: 'Thank you. For all of it, including the parts I never noticed.',
    from: 'Firdavs',
  },
  anniversary: {
    name: 'Daniel',
    letter:
      'Ten years. What I keep coming back to is not the big occasions but the ordinary evenings.',
    final: 'Still you. Still this. Still glad.',
    from: 'Sofia',
  },
  memories: {
    name: 'Lena',
    letter: 'Nobody in our family had done it before. You went first, and you made it look survivable.',
    final: 'Whatever comes next, you have already proved the point.',
    from: 'Tomás',
  },
  sakura: {
    name: 'Haruto',
    letter: 'No occasion. I saw the branch in the window and thought of you.',
    final: 'No reason. That is the whole reason.',
    from: 'Emi',
  },
};

const FALLBACK = DEMO.romantic;
const BEAT_MS = 3400;

export function TemplateStage({
  template,
  /** Pause cycling — used when the stage is a static gallery thumbnail. */
  still = false,
  className,
}: {
  template: TemplateSummary;
  still?: boolean;
  className?: string;
}) {
  const palette = getPalette(template.paletteId);
  const demo = DEMO[template.id] ?? FALLBACK;
  const { reduced } = useMotionPrefs();
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    setBeat(0);
    if (still) return;

    const timer = window.setInterval(() => setBeat((current) => (current + 1) % 4), BEAT_MS);
    return () => window.clearInterval(timer);
  }, [template.id, still]);

  const photos = [0, 1, 2].map((index) =>
    photoPlaceholder(`${template.id}-stage-${index}`, {
      colors: photoColors(palette),
      width: 700,
      height: 900,
    }),
  );

  const transition = { duration: reduced ? 0.25 : 0.85, ease: easing.cinematic };

  const beats = [
    // 1 — the cover
    <div key="cover" className="flex h-full flex-col items-center justify-center px-7 text-center">
      <Motif
        id={template.motif}
        className="absolute -right-4 top-10 h-28 w-28 opacity-25"
        strokeWidth={0.9}
      />
      <p className="font-display text-[2.35rem] leading-[0.95] tracking-[-0.03em]">{demo.name},</p>
      <p className="mt-3 font-display text-[1.05rem] italic leading-snug opacity-70">
        {COVER_HEADLINE}
      </p>
    </div>,

    // 2 — the letter
    <div key="letter" className="flex h-full flex-col justify-center px-7">
      <span className="eyebrow mb-4 opacity-45">The letter</span>
      <p className="text-[0.9rem] leading-[1.75] opacity-85">{demo.letter}</p>
    </div>,

    // 3 — the photographs
    <div key="gallery" className="flex h-full flex-col justify-center gap-3 px-6">
      <span className="eyebrow mb-1 opacity-45">Together</span>
      <div className="grid grid-cols-3 gap-2">
        {photos.map((url, index) => (
          <motion.span
            key={url}
            className="block overflow-hidden rounded-[3px]"
            style={{ aspectRatio: index === 1 ? '3 / 5' : '3 / 4' }}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : 0.12 * index, duration: 0.7, ease: easing.out }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
          </motion.span>
        ))}
      </div>
    </div>,

    // 4 — the last word
    <div key="final" className="flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
      <p className="font-display text-[1.35rem] leading-[1.25] tracking-[-0.02em]">{demo.final}</p>
      <span className="h-px w-10" style={{ background: 'var(--card-line)' }} />
      <p className="font-display text-[1.5rem] leading-none">{demo.from}</p>
      <span className="text-[var(--card-accent)]">
        <Blossom className="h-5 w-5" />
      </span>
    </div>,
  ];

  return (
    <div
      className={cn('card-scope relative h-full w-full overflow-hidden', className)}
      style={paletteVars(palette)}
      data-scheme={palette.scheme}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 block h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle, var(--card-glow) 0%, transparent 62%)' }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={beat}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: reduced ? 1 : 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: reduced ? 1 : 0.99 }}
          transition={transition}
        >
          {beats[beat]}
        </motion.div>
      </AnimatePresence>

      {!still ? (
        <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center gap-1.5">
          {beats.map((_, index) => (
            <span
              key={index}
              className="block h-[3px] rounded-full transition-all duration-500"
              style={{
                width: index === beat ? '1.1rem' : '0.3rem',
                background: index === beat ? 'var(--card-accent)' : 'var(--card-line)',
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
