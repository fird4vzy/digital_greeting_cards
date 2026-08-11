'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { heartGeometry } from '../geometry';
import { useStudioEnvironment } from '../useStudioEnvironment';

/**
 * The romantic template's centrepiece: a heart in cast glass, turning slowly.
 *
 * Cut crystal rather than smooth glass: the geometry is faceted (see
 * `heartGeometry`) and lit by two coloured rim lights plus a 64×32 environment
 * map generated in memory. Facets catch the lights individually as it turns,
 * which is what reads as glass — smooth transmission needs a real HDRI to
 * avoid looking like tinted plastic, and an HDRI is a megabyte of network on a
 * page someone opens standing next to a bouquet.
 */
export function GlassHeart({ colors }: { colors: string[] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => heartGeometry(), []);
  const viewport = useThree((state) => state.viewport);

  useStudioEnvironment(colors);

  // Sized against the *narrow* axis and capped, so it stays a small pendant
  // floating above the name rather than a centrepiece the headline has to
  // compete with. A phone is ~2 world units wide; a laptop is ~7.
  const scale = Math.min(Math.min(viewport.width, viewport.height) * 0.2, 0.62);
  const lift = viewport.height * 0.26;

  useFrame((state, delta) => {
    const node = mesh.current;
    if (!node) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    node.rotation.y += dt * 0.26;
    node.rotation.z = Math.sin(t * 0.42) * 0.07;
    node.position.y = lift + Math.sin(t * 0.62) * 0.08;
  });

  return (
    <group>
      <mesh ref={mesh} geometry={geometry} scale={scale} position={[0, lift, 0]}>
        <meshPhysicalMaterial
          flatShading
          color={colors[0] ?? '#ffffff'}
          transparent
          opacity={0.72}
          roughness={0.14}
          metalness={0.08}
          ior={1.5}
          iridescence={1}
          iridescenceIOR={1.4}
          iridescenceThicknessRange={[120, 520]}
          clearcoat={1}
          clearcoatRoughness={0.06}
          envMapIntensity={2.2}
          specularIntensity={1}
        />
      </mesh>

      {/* Two close, coloured points give the moving specular that sells a
          polished surface; the environment map does the refraction. */}
      <pointLight position={[1.4, lift + 1.1, 2]} intensity={4} color={colors[2] ?? '#ffffff'} distance={9} />
      <pointLight position={[-1.6, lift - 0.4, 1.4]} intensity={2.4} color={colors[1] ?? '#ffffff'} distance={8} />
    </group>
  );
}
