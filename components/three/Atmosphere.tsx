'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import type { SceneId } from '@/lib/card/template';
import { useInView } from '@/lib/hooks/useInView';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { cn } from '@/lib/utils/cn';

const SceneCanvas = dynamic(() => import('./SceneCanvas'), { ssr: false });

const FALLBACK_COLORS = ['#e79a9a', '#c96b74', '#f3cfc6'];

type Props = {
  scene: SceneId;
  className?: string;
  intensity?: 'full' | 'soft';
  /** Cover sections load as soon as they mount; later beats wait for scroll. */
  priority?: boolean;
  /** Marketing surfaces are not inside a `.card-scope`, so they pass colours. */
  colors?: string[];
};

/**
 * THE 3D GATE
 * ===========
 * Every WebGL scene in the product is mounted through here, and the rules are
 * the same everywhere:
 *
 *   1. A CSS-only atmosphere renders first and always. It is never a blank
 *      box waiting for a canvas — if WebGL never arrives, nothing looks broken.
 *   2. three.js is a dynamic import, so it is absent from the initial bundle
 *      and never blocks first paint.
 *   3. It only loads for devices that opted in (`rich`): reduced-motion,
 *      low-core, low-memory and data-saver users keep the CSS layer.
 *   4. It only loads once the section is near the viewport.
 *   5. If the canvas throws — context loss, driver bug, blocked WebGL — the
 *      boundary drops it and the CSS layer is still standing.
 */
export function Atmosphere({ scene, className, intensity = 'full', priority = false, colors }: Props) {
  const { rich } = useMotionPrefs();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: priority ? '0px' : '300px' });
  const resolved = usePaletteColors(ref, colors);
  const [failed, setFailed] = useState(false);

  const enabled = scene !== 'none' && rich && !failed && (priority || inView);

  return (
    <div ref={ref} aria-hidden="true" className={cn('pointer-events-none overflow-hidden', className)}>
      <CssAtmosphere scene={scene} colors={resolved} intensity={intensity} />

      {enabled ? (
        <WebGLBoundary onError={() => setFailed(true)}>
          <div className="absolute inset-0">
            <SceneCanvas scene={scene} colors={resolved} intensity={intensity} active={inView || priority} />
          </div>
        </WebGLBoundary>
      ) : null}
    </div>
  );
}

/**
 * The always-on layer. Soft drifting light, built from three blurred radial
 * gradients — visually related to the particle field, but free.
 */
function CssAtmosphere({
  scene,
  colors,
  intensity,
}: {
  scene: SceneId;
  colors: string[];
  intensity: 'full' | 'soft';
}) {
  if (scene === 'none') return null;

  const opacity = intensity === 'soft' ? 0.28 : 0.45;

  const blobs = [
    { size: '58vmin', top: '8%', left: '12%', color: colors[0], duration: '17s', delay: '0s' },
    { size: '44vmin', top: '58%', left: '68%', color: colors[1], duration: '23s', delay: '-6s' },
    { size: '36vmin', top: '34%', left: '46%', color: colors[2], duration: '19s', delay: '-11s' },
  ];

  return (
    <div className="absolute inset-0" style={{ opacity }}>
      {blobs.map((blob, index) => (
        <span
          key={index}
          className="absolute block rounded-full blur-[60px] will-change-transform"
          style={{
            width: blob.size,
            height: blob.size,
            top: blob.top,
            left: blob.left,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            animation: `drift ${blob.duration} ease-in-out ${blob.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Reads the active card palette off the DOM so scenes stay data-driven. */
function usePaletteColors(
  ref: React.RefObject<HTMLElement | null>,
  override?: string[],
): string[] {
  const [colors, setColors] = useState<string[]>(override ?? FALLBACK_COLORS);

  useEffect(() => {
    if (override) {
      setColors(override);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const styles = getComputedStyle(node);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;

    setColors([
      read('--card-particle-1', FALLBACK_COLORS[0]),
      read('--card-particle-2', FALLBACK_COLORS[1]),
      read('--card-particle-3', FALLBACK_COLORS[2]),
    ]);
    // `override` is a literal array at every call site; comparing by identity
    // would resubscribe on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, override?.join('|')]);

  return colors;
}

/** Drops the canvas on any rendering error; the CSS layer carries on. */
class WebGLBoundary extends Component<{ children: ReactNode; onError: () => void }, { dead: boolean }> {
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
