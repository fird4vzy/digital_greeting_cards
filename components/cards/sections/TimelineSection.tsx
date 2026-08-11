'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Beat, BeatLabel } from '@/components/cards/primitives/Beat';
import { Reveal, RevealGroup } from '@/components/ui/Reveal';
import { CardPhoto } from '@/components/cards/primitives/CardPhoto';
import type { SectionOfKind } from '@/lib/card/schema';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/**
 * The timeline. `thread` draws a line that fills as you scroll — the single
 * scroll-linked effect in the card runtime, because here the progress *is*
 * the content. `ledger` is the typographic version: dates in a column, no
 * ornament, for templates that want to read as printed matter.
 */
export function TimelineSection({ section }: { section: SectionOfKind<'timeline'> }) {
  const variant = section.variant ?? 'thread';
  const entries = section.entries ?? [];
  const ref = useRef<HTMLDivElement | null>(null);
  const { reduced } = useMotionPrefs();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 75%', 'end 55%'],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const scaleY = useTransform(progress, (value) => (reduced ? 1 : value));

  if (entries.length === 0) return null;

  if (variant === 'ledger') {
    return (
      <Beat innerClassName="max-w-[40rem]">
        {section.title ? (
          <Reveal preset="fade">
            <BeatLabel>{section.title}</BeatLabel>
          </Reveal>
        ) : null}

        <RevealGroup step={0.1} className="mt-8 divide-y divide-[var(--card-line)]">
          {entries.map((entry) => (
            <Reveal key={entry.id} preset="fade" className="grid grid-cols-[5.5rem_1fr] gap-5 py-6 sm:grid-cols-[8rem_1fr]">
              <span className="eyebrow pt-1.5 text-[var(--card-ink-muted)] tabular-nums">
                {entry.date}
              </span>
              <div>
                <h3 className="card-display text-[1.35rem] leading-snug text-[var(--card-ink)]">
                  {entry.title}
                </h3>
                {entry.text ? (
                  <p className="mt-2 text-body text-[var(--card-ink-soft)]">{entry.text}</p>
                ) : null}
                {entry.photo ? (
                  <CardPhoto photo={entry.photo} ratio="3 / 2" className="mt-4" sizes="(max-width: 640px) 70vw, 24rem" />
                ) : null}
              </div>
            </Reveal>
          ))}
        </RevealGroup>
      </Beat>
    );
  }

  // thread
  return (
    <Beat innerClassName="max-w-[38rem]">
      {section.title ? (
        <Reveal preset="fade">
          <BeatLabel>{section.title}</BeatLabel>
        </Reveal>
      ) : null}

      <div ref={ref} className="relative mt-10 pl-8 sm:pl-12">
        <span aria-hidden="true" className="absolute left-[3px] top-2 h-full w-px bg-[var(--card-line)]" />
        <motion.span
          aria-hidden="true"
          className="absolute left-[3px] top-2 h-full w-px origin-top bg-[var(--card-accent)]"
          style={{ scaleY }}
        />

        <RevealGroup step={0.12} className="space-y-12">
          {entries.map((entry) => (
            <Reveal key={entry.id} preset="fade" className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-8 top-[0.55rem] h-[7px] w-[7px] rounded-full bg-[var(--card-accent)] sm:-left-12"
                style={{ marginLeft: '0px' }}
              />
              <span className="eyebrow block text-[var(--card-ink-muted)] tabular-nums">{entry.date}</span>
              <h3 className="card-display mt-2 text-[1.5rem] leading-snug text-[var(--card-ink)]">
                {entry.title}
              </h3>
              {entry.text ? (
                <p className="mt-2 text-body text-[var(--card-ink-soft)]">{entry.text}</p>
              ) : null}
              {entry.photo ? (
                <CardPhoto photo={entry.photo} ratio="3 / 2" className="mt-4" sizes="(max-width: 640px) 70vw, 22rem" />
              ) : null}
            </Reveal>
          ))}
        </RevealGroup>
      </div>
    </Beat>
  );
}
