'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Component, useState, type ReactNode } from 'react';
import { useInView } from '@/lib/hooks/useInView';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';

const TagCanvas = dynamic(() => import('./TagCanvas'), { ssr: false });

/**
 * The gate in front of the only downloaded 3D asset in the product.
 *
 * Same rules as `Atmosphere`, for the same reasons — a still renders first and
 * always, three.js is a dynamic import, it loads only for devices that opted in
 * and only near the viewport, and an error boundary drops the canvas without
 * taking the section with it. What differs is what sits underneath: `Atmosphere`
 * falls back to drifting CSS light because it is decoration, and this falls back
 * to a photograph of the object because it is the subject.
 *
 * **The still is not a placeholder.** It is rendered from this exact model by
 * `scripts/glb-render.mjs`, so a visitor who never loads WebGL sees the same tag
 * at the same angle rather than a stand-in that quietly drifts out of date.
 *
 * The 2 MB model is the reason the gate matters more here than anywhere else.
 * It is affordable on `/shops` — a page a florist opens on wifi, once, to decide
 * whether this is a real company — and it would be indefensible in a card, which
 * is opened next to a bouquet on mobile data and downloads no 3D at all.
 */
export function TagShowcase({
  strings,
}: {
  strings: { alt: string; hint: string };
}) {
  const { rich } = useMotionPrefs();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: '400px' });
  const [failed, setFailed] = useState(false);

  const enabled = rich && !failed && inView;

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] border border-line bg-[#17161a] sm:aspect-[16/10]"
    >
      <Image
        src="/brand/tag-still.webp"
        alt={strings.alt}
        fill
        sizes="(max-width: 62rem) 100vw, 62rem"
        className="object-contain"
        priority={false}
      />

      {enabled ? (
        <CanvasBoundary onError={() => setFailed(true)}>
          {/* Sits over the still rather than replacing it: the canvas paints
              transparent until the model arrives, so the object never blinks
              out and back during the 2 MB fetch. */}
          <div className="absolute inset-0">
            <TagCanvas active={inView} />
          </div>
        </CanvasBoundary>
      ) : null}

      {enabled ? (
        <p className="pointer-events-none absolute bottom-4 left-5 text-[0.72rem] tracking-[0.03em] text-white/45">
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
