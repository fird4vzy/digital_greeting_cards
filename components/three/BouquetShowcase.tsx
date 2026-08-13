'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useState, type ReactNode } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

const BouquetCanvas = dynamic(() => import('./BouquetCanvas'), { ssr: false });

/**
 * The hero object on `/shops`: the bouquet with the tag tied to it.
 *
 * It replaced a photograph, and the reason is not that the render is prettier —
 * it is not. The photograph showed a tag that no longer exists: it was made
 * before the design was chosen, so it carried a plain white rectangle while
 * everything else on the site had moved on. A generated image cannot be
 * re-shot. This can, because the tag in it is a component.
 *
 * Same gate as everywhere else — a still first and always, three.js behind a
 * dynamic import, only for devices that opted in, only near the viewport, and a
 * boundary that drops the canvas without taking the hero down. This one has
 * `priority` on the still: it is the first thing on the page, and a hero that
 * arrives late is a hero nobody saw.
 */
export function BouquetShowcase({
  strings,
}: {
  strings: { alt: string; hint: string };
}) {
  const { rich } = useMotionPrefs();
  // A hero is on screen at load, so this only ever gates a visitor who lands
  // further down the page. The margin still matters on a phone in landscape.
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '200px' });
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const enabled = rich && !failed && inView;

  return (
    <div ref={ref} className="relative aspect-square w-full">
      <Image
        src="/brand/bouquet-still.webp"
        alt={strings.alt}
        fill
        sizes="(max-width: 62rem) 100vw, 30rem"
        priority
        className="object-contain transition-opacity duration-700"
        style={{ opacity: ready ? 0 : 1 }}
      />

      {enabled ? (
        <CanvasBoundary onError={() => setFailed(true)}>
          <div className="absolute inset-0">
            <BouquetCanvas active={inView} onReady={() => setReady(true)} />
          </div>
        </CanvasBoundary>
      ) : null}

      {enabled && ready ? (
        <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 text-[0.7rem] tracking-[0.04em] text-ink-faint">
          {strings.hint}
        </p>
      ) : null}
    </div>
  );
}

/** Drops the canvas on any rendering error; the still is still standing. */
class CanvasBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { dead: boolean }
> {
  state = { dead: false };

  static getDerivedStateFromError() {
    return { dead: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.dead) return null;
    return this.props.children;
  }
}
