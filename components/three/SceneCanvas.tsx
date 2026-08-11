'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import type { SceneId } from '@/lib/card/template';
import { BloomFlower } from './scenes/BloomFlower';
import { GlassHeart } from './scenes/GlassHeart';
import { PetalDrift } from './scenes/PetalDrift';

export type SceneCanvasProps = {
  scene: SceneId;
  colors: string[];
  /** `soft` halves the particle count and dims the field for closing beats. */
  intensity?: 'full' | 'soft';
  /** Rendering pauses whenever the host section is off-screen. */
  active?: boolean;
};

/**
 * The only module in the app that imports three.js.
 *
 * It is loaded exclusively through `next/dynamic({ ssr: false })` from
 * `Atmosphere`, so three, R3F and drei land in their own async chunk that no
 * page pays for on first load — including the published cards, where the
 * chunk is fetched after the cover has already painted.
 */
export default function SceneCanvas({
  scene,
  colors,
  intensity = 'full',
  active = true,
}: SceneCanvasProps) {
  const visible = usePageVisible();
  const density = useDensity();

  if (scene === 'none') return null;

  const soft = intensity === 'soft';
  const count = Math.round(density * (soft ? 0.55 : 1));
  const running = active && visible;

  return (
    <Canvas
      // A glass heart needs real antialiasing; petal fields are soft-edged
      // enough that turning it off is invisible and meaningfully cheaper.
      gl={{
        antialias: scene === 'heart',
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      dpr={[1, scene === 'heart' ? 1.5 : 1.75]}
      camera={{ position: [0, 0, 6], fov: 42, near: 0.1, far: 30 }}
      frameloop={running ? 'always' : 'never'}
      style={{ pointerEvents: 'none', touchAction: 'pan-y' }}
      aria-hidden="true"
    >
      <ambientLight intensity={1.35} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} />
      <directionalLight position={[-4, -2, 2]} intensity={0.4} color={colors[1] ?? '#ffffff'} />

      {scene === 'petals' && (
        <PetalDrift kind="rose" count={count} colors={colors} speed={1} opacity={soft ? 0.6 : 0.85} />
      )}

      {scene === 'sakura' && (
        <PetalDrift
          kind="sakura"
          count={Math.round(count * 1.2)}
          colors={colors}
          speed={0.8}
          opacity={soft ? 0.65 : 0.92}
        />
      )}

      {scene === 'embers' && (
        <PetalDrift
          kind="mote"
          count={Math.round(count * 1.35)}
          colors={colors}
          direction="up"
          speed={0.85}
          opacity={soft ? 0.55 : 0.8}
        />
      )}

      {scene === 'heart' && (
        <>
          <GlassHeart colors={colors} />
          <PetalDrift
            kind="rose"
            count={Math.round(count * 0.55)}
            colors={colors}
            speed={0.9}
            opacity={0.55}
          />
        </>
      )}

      {scene === 'bloom' && (
        <>
          <group scale={1.55} position={[0, 0.1, 0]}>
            <BloomFlower colors={colors} />
          </group>
          <PetalDrift
            kind="rose"
            count={Math.round(count * 0.4)}
            colors={colors}
            speed={0.7}
            opacity={0.45}
          />
        </>
      )}
    </Canvas>
  );
}

/** Particle budget, chosen from viewport width as a proxy for device class. */
function useDensity(): number {
  const [density, setDensity] = useState(44);

  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth;
      if (width < 480) setDensity(36);
      else if (width < 900) setDensity(56);
      else setDensity(84);
    };

    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, []);

  return density;
}

/** Stops the render loop when the tab is backgrounded — battery, mostly. */
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
