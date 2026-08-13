'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { curvedPetalGeometry } from '../geometry';
import { useStudioEnvironment } from '../useStudioEnvironment';

type Ring = { count: number; radius: number; tilt: number; scale: number; color: number };

/**
 * A flower that opens, holds, and breathes.
 *
 * Still no imported model and no texture — five rings of one cached petal
 * geometry, which is the same bargain the rest of the 3D layer makes. What
 * changed is that it now looks like a flower instead of an arrangement of
 * paper cut-outs, and every part of that came from a specific fault:
 *
 *   - The petals were flat. `curvedPetalGeometry` cups and bends them, so a
 *     highlight has somewhere to travel.
 *   - The material was `meshLambertMaterial`, which has no specular term at
 *     all. Petals are not matte — they are thin and slightly waxy, and the
 *     word for that in a renderer is *sheen*.
 *   - Sheen needs something to reflect. The 64×32 in-memory studio map the
 *     glass heart already uses costs nothing and is the difference between a
 *     surface and a silhouette.
 *   - Three rings sat 0.11 apart in z, which is nearly coplanar. Five rings,
 *     staggered further and jittered per petal, give it a body.
 *   - The centre was one sphere. A real bloom has a crowd of stamens, and a
 *     dozen tiny spheres read as one at any size the hero shows it.
 *
 * Cost is still a fraction of a millisecond: about fifty meshes, no textures,
 * nothing downloaded. And the whole layer is behind the same gate as before —
 * a device that does not opt into WebGL never sees any of it.
 */
const RINGS: Ring[] = [
  { count: 9, radius: 1.14, tilt: 1.34, scale: 1.62, color: 0 },
  { count: 8, radius: 0.94, tilt: 1.08, scale: 1.38, color: 0 },
  { count: 8, radius: 0.7, tilt: 0.78, scale: 1.12, color: 1 },
  { count: 7, radius: 0.48, tilt: 0.5, scale: 0.88, color: 1 },
  { count: 6, radius: 0.28, tilt: 0.26, scale: 0.62, color: 2 },
];

/** Deterministic jitter: the same flower every load, just not a mechanical one. */
function wobble(seed: number): number {
  return (Math.sin(seed * 127.1) * 43758.5453) % 1;
}

export function BloomFlower({ colors }: { colors: string[] }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => curvedPetalGeometry(), []);

  useStudioEnvironment(colors);

  const petals = useMemo(
    () =>
      RINGS.flatMap((ring, ringIndex) =>
        Array.from({ length: ring.count }, (_, index) => {
          const seed = ringIndex * 17 + index;
          const j = wobble(seed);
          const angle = (index / ring.count) * Math.PI * 2 + ringIndex * 0.42 + j * 0.09;

          return {
            key: `${ringIndex}-${index}`,
            position: [
              Math.cos(angle) * ring.radius * 0.34,
              Math.sin(angle) * ring.radius * 0.34,
              // Outer rings sit back, inner rings forward: the bloom is a bowl,
              // not a disc.
              (RINGS.length - ringIndex) * -0.075 + j * 0.02,
            ] as [number, number, number],
            rotation: [
              ring.tilt * 0.55 + j * 0.12,
              j * 0.16,
              angle - Math.PI / 2 + j * 0.1,
            ] as [number, number, number],
            scale: ring.scale * (1 + j * 0.09),
            color: colors[ring.color % colors.length] ?? '#ffffff',
          };
        }),
      ),
    [colors],
  );

  // A ring of stamens, tilted out of the centre.
  const stamens = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const r = 0.05 + wobble(index * 3.7) * 0.03;
        return {
          key: index,
          position: [Math.cos(angle) * r, Math.sin(angle) * r, 0.3 + wobble(index) * 0.04] as [
            number,
            number,
            number,
          ],
        };
      }),
    [],
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
          <meshPhysicalMaterial
            color={petal.color}
            side={THREE.DoubleSide}
            roughness={0.62}
            metalness={0}
            // The petal is thin enough to glow where the light passes through
            // it, which is most of why a real bloom looks alive.
            sheen={1}
            sheenRoughness={0.35}
            sheenColor={new THREE.Color('#ffffff')}
            // Deliberately not `transmission`. Real petals do glow where light
            // passes through them and transmission is how you say that — but
            // it costs a whole extra render pass, and there are thirty-eight
            // of these. Sheen on a curved surface carries most of the same
            // impression for none of the frame budget.
            transparent
            opacity={0.97}
          />
        </mesh>
      ))}

      {stamens.map((stamen) => (
        <mesh key={stamen.key} position={stamen.position}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshPhysicalMaterial
            color={colors[2] ?? '#ffffff'}
            roughness={0.35}
            sheen={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
