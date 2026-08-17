'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CardAudio } from '@/lib/card/schema';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

/**
 * Music for the whole card, in the corner, off until it is asked for.
 *
 * **It never starts by itself.** A card is opened standing next to a bouquet —
 * in a shop, at a desk, on a bus — and sound that begins on its own is the one
 * thing that can turn a gift into an embarrassment. Browsers would block it
 * anyway; refusing on purpose means the refusal survives the day they stop.
 *
 * Nothing is downloaded until then either: `preload="none"` keeps a three
 * megabyte track off the connection of everyone who never presses it, which is
 * most people.
 *
 * The disc turns while it plays. That is the only indicator, and it is enough —
 * a progress bar would invite somebody to scrub a song they did not choose.
 */
export function CardPlayer({ audio, label }: { audio: CardAudio; label: string }) {
  const { reduced } = useMotionPrefs();
  const element = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = useCallback(() => {
    const node = element.current;
    if (!node) return;

    if (node.paused) {
      void node.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    } else {
      node.pause();
      setPlaying(false);
    }
  }, []);

  // A card left open in a background tab should not keep singing.
  useEffect(() => {
    const stop = () => {
      if (document.visibilityState === 'hidden') {
        element.current?.pause();
        setPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', stop);
    return () => document.removeEventListener('visibilitychange', stop);
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
      <audio ref={element} src={audio.url} loop preload="none" onEnded={() => setPlaying(false)} />

      <button
        type="button"
        onClick={toggle}
        aria-label={audio.title ? `${label}: ${audio.title}` : label}
        aria-pressed={playing}
        className="grid h-12 w-12 place-content-center rounded-full border border-[var(--card-line)] shadow-[var(--shadow-float)] backdrop-blur-sm transition-transform duration-300 hover:scale-105"
        style={{
          background: 'color-mix(in srgb, var(--card-bg) 82%, transparent)',
          animation: playing && !reduced ? 'cardSpin 4s linear infinite' : undefined,
        }}
      >
        <span
          aria-hidden="true"
          className="block h-6 w-6 rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 50%, var(--card-bg) 0 22%, var(--card-accent) 23% 100%)`,
          }}
        />
      </button>

      {audio.title ? (
        <span className="hidden text-caption text-[var(--card-ink-muted)] sm:block">
          {audio.title}
        </span>
      ) : null}
    </div>
  );
}
