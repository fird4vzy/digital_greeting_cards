'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import { BouquetFallback } from '@/components/three/BouquetFallback';
import { useInView } from '@/lib/hooks/useInView';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import { cn } from '@/lib/utils/cn';

const BouquetAssemblyCanvas = dynamic(() => import('@/components/three/BouquetAssemblyCanvas'), {
  ssr: false,
});

/** `BRAND_PARTICLES` from the hero — outer ring deepened for a dark stage. */
const BOUQUET_COLORS = ['#b2585c', '#c1836a', '#e7c9c6'];

type Props = {
  /** The section the bouquet belongs to; scroll through it drives assembly. */
  sectionRef: React.RefObject<HTMLElement | null>;
  className?: string;
  /** Maps section scroll 0→1 onto scene progress. Default: the whole range. */
  range?: [number, number];
  colors?: string[];
};

/**
 * THE GATE, same rules as `Atmosphere`
 * ====================================
 * Nothing here is load-bearing for the page: if WebGL never arrives, or the
 * visitor asked for less motion, or the device is modest, the section is
 * simply a section. The canvas is an enhancement that fades in on top.
 *
 * Scroll is read into a ref inside a rAF loop rather than into state. Putting
 * it in state re-renders the tree sixty times a second and the canvas is the
 * one thing on the page that cannot afford that.
 */
export function BouquetStage({ sectionRef, className, range = [0, 1], colors }: Props) {
  const { rich, ready } = useMotionPrefs();
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, rootMargin: '300px' });
  const layer = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const progress = useRef(0);

  useEffect(() => {
    if (!rich) return undefined;

    let frame = 0;
    let lastFade = -1;

    const measure = () => {
      const node = sectionRef.current;
      if (node) {
        const rect = node.getBoundingClientRect();
        const height = window.innerHeight;
        const travel = rect.height - height;
        const raw = travel > 0 ? -rect.top / travel : 0;
        const clamped = Math.min(1, Math.max(0, raw));
        progress.current = range[0] + clamped * (range[1] - range[0]);

        // Сцена гаснет ДО того, как снизу подойдёт непрозрачная секция.
        //
        // Слой лежит позади страницы, поэтому следующая секция с заливкой
        // наезжает на букет и срезает его по своей верхней кромке — на
        // экране это выглядит швом поперёк цветов, а не глубиной. Образец
        // решает это тем же способом: канвас уводится в ноль на подходе.
        // Симметрично — проявление на входе, чтобы сцена не возникала резко.
        const enter = Math.min(1, Math.max(0, (height - rect.top) / (height * 0.35)));
        const exit = Math.min(1, Math.max(0, (rect.bottom - height * 0.25) / (height * 0.45)));
        const fade = Math.round(Math.min(enter, exit) * 100);

        if (fade !== lastFade && layer.current) {
          lastFade = fade;
          layer.current.style.opacity = String(fade / 100);
        }
      }

      frame = window.requestAnimationFrame(measure);
    };

    frame = window.requestAnimationFrame(measure);
    return () => window.cancelAnimationFrame(frame);
  }, [rich, sectionRef, range]);

  const enabled = rich && !failed && inView;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-10', className)}
    >
      {/* Внутренний слой несёт прозрачность из rAF-цикла; внешний остаётся
          чистым, чтобы `max-md` приглушение не спорило с ней за один стиль. */}
      <div ref={layer} className="h-full w-full max-md:opacity-60">
      {enabled ? (
        <WebGLBoundary onError={() => setFailed(true)}>
          <BouquetAssemblyCanvas
            colors={colors ?? BOUQUET_COLORS}
            progress={progress}
            active={inView}
          />
        </WebGLBoundary>
      ) : ready ? (
        // Сцены не будет — reduced motion, слабое устройство или упавший
        // WebGL. Раньше все трое получали пустой тёмный экран; теперь тот же
        // букет одной линией, из образца. `ready` отсекает первый кадр
        // гидратации, когда prefs ещё не прочитаны и rich временно false.
        <BouquetFallback />
      ) : null}
      </div>
    </div>
  );
}

/** Drops the canvas on a context loss or driver bug without taking the page. */
class WebGLBoundary extends Component<{ children: ReactNode; onError: () => void }, { dead: boolean }> {
  state = { dead: false };

  static getDerivedStateFromError() {
    return { dead: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.dead ? null : this.props.children;
  }
}
