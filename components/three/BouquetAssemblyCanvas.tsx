'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState, type RefObject } from 'react';
import { BouquetAssembly } from './scenes/BouquetAssembly';

export type BouquetAssemblyCanvasProps = {
  colors: string[];
  /** Scroll position through the host section, 0 → 1. A ref, not state. */
  progress: RefObject<number>;
  /** Rendering pauses when the section scrolls away. */
  active?: boolean;
};

/**
 * The canvas for the scroll-assembled bouquet.
 *
 * Loaded only through `next/dynamic({ ssr: false })` from `BouquetStage`, so
 * three, R3F and this scene stay in their own async chunk — the same rule as
 * `SceneCanvas`.
 *
 * Lighting is deliberately half of what a first pass wants. The brand palette
 * was chosen against cream paper; on a dark stage, with an environment map and
 * a white sheen on top, every petal clipped to white. Exposure 0.82, one
 * modest key, and the sheen tinted rather than white — the colours are the
 * brand's, they just are not blown out any more.
 */
export default function BouquetAssemblyCanvas({
  colors,
  progress,
  active = true,
}: BouquetAssemblyCanvasProps) {
  const visible = usePageVisible();
  const running = active && visible;

  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.2, 6.2], fov: 38, near: 0.1, far: 100 }}
      frameloop={running ? 'always' : 'never'}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 0.82;
      }}
      style={{ pointerEvents: 'none', touchAction: 'pan-y' }}
      aria-hidden="true"
    >
      <hemisphereLight args={['#ffe4d4', '#2a1c20', 0.42]} />
      <directionalLight position={[4, 7, 5]} intensity={1.05} color="#fff2e2" />
      <pointLight position={[-4.5, 2, -4]} intensity={14} distance={24} color="#c1836a" />
      <pointLight position={[3, -1, 3]} intensity={5} distance={18} color="#efe7db" />

      <BouquetAssembly colors={colors} progress={progress} />
    </Canvas>
  );
}

/** Stops the loop when the tab is backgrounded — battery, mostly. */
function usePageVisible(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === 'visible');
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  return visible;
}
