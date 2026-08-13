'use client';

import { Canvas } from '@react-three/fiber';
import { Center, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';

/**
 * The tag, as the object it is.
 *
 * The only imported mesh in the product, and the only canvas a visitor is meant
 * to touch — every other scene in `components/three/` is ambient, procedural and
 * `pointer-events: none`. A florist has held a thousand bouquets and never this
 * tag, so it is the one thing worth handing them rather than photographing.
 *
 * Loaded exclusively through `TagShowcase`, which decides whether this file is
 * fetched at all. three, R3F, drei and the 2 MB model are all behind that gate.
 *
 * **Conventions are the loader's problem here, not ours.** three's GLTFLoader
 * already sets `flipY = false` on glTF textures and tags the base colour as
 * sRGB. Hand-rolled WebGL has to choose both deliberately — getting the first
 * one wrong is what put a black band across this tag in an earlier viewer; see
 * `scripts/glb-render.mjs`.
 */
export type TagCanvasProps = {
  /** Rendering pauses when the section scrolls away. */
  active?: boolean;
};

function TagModel() {
  const { scene } = useGLTF('/3d/tag.glb');

  // `Center` rather than a hand-tuned offset: the exporter's origin is its own
  // business, and a model swapped in later should not move the camera.
  //
  // The scale is arithmetic, not taste. The model is 1.895 units tall; the
  // camera sits 3.4 away at a 38° vertical field, so it sees 2×3.4×tan(19°) ≈
  // 2.34 units. 0.95 puts the tag at about 77% of the frame, which leaves room
  // for the cord to swing as it turns. The first guess was 2.1 and would have
  // run the tag off both edges at 170%.
  return (
    <Center>
      <primitive object={scene} scale={0.95} />
    </Center>
  );
}

export default function TagCanvas({ active = true }: TagCanvasProps) {
  const visible = usePageVisible();
  const running = active && visible;

  return (
    <Canvas
      // Antialiasing on: this is a single hard-surface object held close, and
      // its silhouette is the whole point. The particle fields can do without.
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      dpr={[1, 2]}
      camera={{ position: [0.6, 0.15, 3.4], fov: 38, near: 0.1, far: 40 }}
      frameloop={running ? 'always' : 'never'}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Studio lighting rather than an environment map: drei's `Environment`
          presets fetch an HDRI from a CDN, and nothing here downloads from
          anywhere but this origin. */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} />
      <directionalLight position={[-4, 1, -2]} intensity={0.7} color="#c9a7a0" />
      <directionalLight position={[0, -3, 2]} intensity={0.35} color="#f0dcd6" />

      <Suspense fallback={null}>
        <TagModel />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        // Rotation only. Zoom would swallow the page's scroll on a phone, and
        // panning an object this small just loses it off the edge.
        autoRotate={running}
        autoRotateSpeed={0.85}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.82}
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
