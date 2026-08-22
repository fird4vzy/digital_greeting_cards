'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
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
  const { rich } = useMotionPrefs();
  const { ref, inView } = useInView<HTMLDivElement>({ once: false, rootMargin: '300px' });
  const [failed, setFailed] = useState(false);
  const progress = useRef(0);

  useEffect(() => {
    if (!rich) return undefined;

    let frame = 0;
    const measure = () => {
      const node = sectionRef.current;
      if (node) {
        const rect = node.getBoundingClientRect();
        const travel = rect.height - window.innerHeight;
        const raw = travel > 0 ? -rect.top / travel : 0;
        const clamped = Math.min(1, Math.max(0, raw));
        progress.current = range[0] + clamped * (range[1] - range[0]);
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
      {enabled ? (
        <WebGLBoundary onError={() => setFailed(true)}>
          <BouquetAssemblyCanvas
            colors={colors ?? BOUQUET_COLORS}
            progress={progress}
            active={inView}
          />
        </WebGLBoundary>
      ) : null}
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
