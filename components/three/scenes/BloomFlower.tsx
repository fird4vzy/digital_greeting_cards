'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { petalGeometry } from '../geometry';

type Ring = { count: number; radius: number; tilt: number; scale: number; color: number };

/**
 * A flower that opens, holds, and breathes.
 *
 * Built from three rings of the same cached petal geometry — roughly forty
 * flat meshes, no textures, no imported model. The whole thing is under a
 * millisecond of GPU time and reads, at a glance, as a peony.
 */
const RINGS: Ring[] = [
  { count: 7, radius: 0.98, tilt: 1.16, scale: 1.45, color: 0 },
  { count: 8, radius: 0.66, tilt: 0.82, scale: 1.12, color: 1 },
  { count: 6, radius: 0.36, tilt: 0.44, scale: 0.82, color: 2 },
];

export function BloomFlower({ colors }: { colors: string[] }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => petalGeometry('rose'), []);

  const petals = useMemo(
    () =>
      RINGS.flatMap((ring, ringIndex) =>
        Array.from({ length: ring.count }, (_, index) => {
          const angle = (index / ring.count) * Math.PI * 2 + ringIndex * 0.42;
          return {
            key: `${ringIndex}-${index}`,
            position: [
              Math.cos(angle) * ring.radius * 0.34,
              Math.sin(angle) * ring.radius * 0.34,
              ringIndex * 0.11,
            ] as [number, number, number],
            rotation: [ring.tilt * 0.55, 0, angle - Math.PI / 2] as [number, number, number],
            scale: ring.scale,
            color: colors[ring.color % colors.length] ?? '#ffffff',
            phase: ringIndex * 0.8 + index * 0.35,
          };
        }),
      ),
    [colors],
  );

  useFrame((state, delta) => {
    const node = group.current;
    if (!node) return;

    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    node.rotation.z += dt * 0.055;
    node.rotation.x = Math.sin(t * 0.35) * 0.14 - 0.1;
    node.rotation.y = Math.cos(t * 0.28) * 0.16;
    // The breath: barely perceptible, but it is what stops the flower from
    // reading as a static logo.
    node.scale.setScalar(1 + Math.sin(t * 0.5) * 0.02);
  });

  return (
    <group ref={group}>
      {petals.map((petal) => (
        <mesh
          key={petal.key}
          geometry={geometry}
          position={petal.position}
          rotation={petal.rotation}
          scale={petal.scale}
        >
          <meshLambertMaterial
            color={petal.color}
            side={THREE.DoubleSide}
            transparent
            opacity={0.94}
            toneMapped={false}
          />
        </mesh>
      ))}

      <mesh position={[0, 0, 0.34]}>
        <sphereGeometry args={[0.11, 16, 12]} />
        <meshLambertMaterial color={colors[2] ?? '#ffffff'} toneMapped={false} />
      </mesh>
    </group>
  );
}
