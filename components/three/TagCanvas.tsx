'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { BrandTag } from './scenes/BrandTag';

/**
 * The tag, as the object it is.
 *
 * The only canvas a visitor is meant to touch — every other scene in
 * `components/three/` is ambient, procedural and `pointer-events: none`. A
 * florist has held a thousand bouquets and never this tag, so it is the one
 * thing worth handing over rather than photographing.
 *
 * The tag itself is built in code, not loaded. A generated mesh stood here
 * first and cost 2 MB; `BrandTag` is a few kilobytes, carries the exact brand
 * colours, and changes when the design does instead of needing regenerating.
 * See the note in that file for why two attempts at generating it failed.
 */
export type TagCanvasProps = {
  /** Rendering pauses when the section scrolls away. */
  active?: boolean;
};

export default function TagCanvas({ active = true }: TagCanvasProps) {
  const visible = usePageVisible();
  const running = active && visible;

  return (
    <Canvas
      // Antialiasing on: a single hard-surface object held close, whose
      // silhouette is the whole point. The particle fields can do without.
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      dpr={[1, 2]}
      camera={{ position: [0.35, 0.1, 2.1], fov: 40, near: 0.1, far: 40 }}
      frameloop={running ? 'always' : 'never'}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Studio lighting rather than an environment map: drei's `Environment`
          presets fetch an HDRI from a CDN, and nothing here loads from any
          origin but this one. The key is deliberately raking, because a blind
          deboss is only visible in light that crosses it. */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2.5, 3.5, 4]} intensity={2.3} />
      <directionalLight position={[-3, 0.5, -2]} intensity={0.55} color="#c9a7a0" />
      <directionalLight position={[0, -2.5, 1.5]} intensity={0.3} color="#f0dcd6" />

      <BrandTag />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        // Rotation only. Zoom would swallow the page's scroll on a phone, and
        // panning an object this small just loses it off the edge.
        autoRotate={running}
        autoRotateSpeed={0.9}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.8}
      />
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
