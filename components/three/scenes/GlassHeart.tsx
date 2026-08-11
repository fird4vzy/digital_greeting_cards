'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type * as THREE from 'three';
import { heartGeometry } from '../geometry';

/**
 * The romantic template's centrepiece: a heart in cast glass, turning slowly.
 *
 * Reflections come from an inline `Environment` built out of Lightformers and
 * baked in a single frame — no HDRI download, no CDN dependency, ~64px cube
 * target. That keeps a genuinely refractive material affordable enough to ship
 * on a phone, and it is only ever mounted on devices that opted into the rich
 * tier.
 */
export function GlassHeart({ colors }: { colors: string[] }) {
  const mesh = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => heartGeometry(), []);

  useFrame((state, delta) => {
    const node = mesh.current;
    if (!node) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    node.rotation.y += dt * 0.26;
    node.rotation.z = Math.sin(t * 0.42) * 0.07;
    node.position.y = Math.sin(t * 0.62) * 0.08;
  });

  return (
    <group>
      <mesh ref={mesh} geometry={geometry} scale={1.15}>
        <meshPhysicalMaterial
          transmission={0.98}
          thickness={1.15}
          roughness={0.09}
          ior={1.46}
          iridescence={0.45}
          iridescenceIOR={1.32}
          clearcoat={1}
          clearcoatRoughness={0.12}
          color={colors[2] ?? '#ffffff'}
          attenuationColor={colors[1] ?? colors[0] ?? '#ffffff'}
          attenuationDistance={1.6}
          envMapIntensity={1.35}
          toneMapped={false}
        />
      </mesh>

      <Environment resolution={64} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.6}
          color={colors[0] ?? '#ffffff'}
          position={[3, 3, 4]}
          scale={[7, 7, 1]}
        />
        <Lightformer
          form="circle"
          intensity={1.9}
          color={colors[2] ?? '#ffffff'}
          position={[-4, 1, 2]}
          scale={[5, 5, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.2}
          color={colors[1] ?? '#ffffff'}
          position={[0, -4, -3]}
          scale={[9, 4, 1]}
        />
      </Environment>
    </group>
  );
}
