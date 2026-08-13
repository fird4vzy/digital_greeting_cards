'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { BrandTag } from './scenes/BrandTag';

/**
 * The whole proposition as one object: the bouquet, with the tag tied to it.
 *
 * Two models, joined here rather than generated together. The bouquet is a
 * generated mesh because a rose is easier grown than drawn; the tag is built in
 * code because a brand is a set of exact colours and generation kept
 * reinterpreting them — see `scenes/BrandTag.tsx`. Assembling them in the scene
 * graph means the tag can be redesigned without regenerating a bouquet, which
 * is the right seam: the flowers will not change and the tag will.
 *
 * The canvas is transparent. This sits on the page's own paper, not on a dark
 * stage, so the object reads as an illustration in the layout rather than a
 * video embedded in it.
 */
export type BouquetCanvasProps = {
  /** Rendering pauses when the section scrolls away. */
  active?: boolean;
  onReady?: () => void;
};

/* Measured from the model, not guessed: it stands 1.896 units tall, its tie
   sits about a third up from the bottom, and a real tag is roughly a sixth of
   a bouquet's height. */
const TAG_SCALE = 0.32;
const TIE = { x: 0.24, y: -0.3, z: 0.34 };

function Scene({ onReady }: { onReady?: () => void }) {
  const { scene } = useGLTF('/3d/bouquet.glb');

  useEffect(() => {
    onReady?.();
  }, [onReady, scene]);

  return (
    <group position={[0, -0.15, 0]}>
      <primitive object={scene} />

      {/* Hung at the wrap, turned out towards the reader and tilted the way
          something on a string hangs — square to the camera would read as
          pasted on. */}
      <group position={[TIE.x, TIE.y, TIE.z]} rotation={[0.12, 0.42, -0.14]}>
        <BrandTag scale={TAG_SCALE} />
      </group>
    </group>
  );
}

export default function BouquetCanvas({ active = true, onReady }: BouquetCanvasProps) {
  const visible = usePageVisible();
  const running = active && visible;

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      dpr={[1, 1.75]}
      camera={{ position: [0.5, 0.25, 3.9], fov: 34, near: 0.1, far: 40 }}
      frameloop={running ? 'always' : 'never'}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Warm daylight from the left, the way the photographs on this site are
          lit, with a cool bounce opposite so the kraft does not go muddy in
          shadow. No environment map: drei's presets fetch an HDRI from a CDN. */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[-3, 4, 3.5]} intensity={2.4} color="#fff4e6" />
      <directionalLight position={[3.5, 1, 2]} intensity={0.8} color="#e8d5cf" />
      <directionalLight position={[0, -2, 1.5]} intensity={0.45} color="#f6f2ec" />

      <Suspense fallback={null}>
        <Scene onReady={onReady} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate={running}
        autoRotateSpeed={0.55}
        minPolarAngle={Math.PI * 0.32}
        maxPolarAngle={Math.PI * 0.62}
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
