'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { petalGeometry, type PetalKind } from '../geometry';

type Props = {
  count: number;
  colors: string[];
  kind: PetalKind;
  /** Petals fall, embers rise. */
  direction?: 'down' | 'up';
  speed?: number;
  opacity?: number;
};

type Particle = {
  x: number;
  y: number;
  z: number;
  scale: number;
  spin: THREE.Euler;
  spinRate: THREE.Vector3;
  fall: number;
  swayPhase: number;
  swayAmp: number;
};

const dummy = new THREE.Object3D();
const color = new THREE.Color();

/**
 * The workhorse of the atmosphere layer: one InstancedMesh carrying every
 * petal, ember or mote on screen.
 *
 * Cost control:
 *  - a single draw call regardless of count
 *  - geometry is shared and cached across every scene in the session
 *  - `count` is chosen by the caller from the device profile (mobile gets ~40)
 *  - CPU work per frame is one matrix compose per instance, which stays under
 *    a millisecond at these counts even on an older phone
 */
export function PetalDrift({
  count,
  colors,
  kind,
  direction = 'down',
  speed = 1,
  opacity = 0.9,
}: Props) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const viewport = useThree((state) => state.viewport);
  const geometry = useMemo(() => petalGeometry(kind), [kind]);

  // Spawn volume is a little wider and much taller than the viewport so
  // particles enter and leave off-screen rather than popping at the edge.
  const bounds = useMemo(
    () => ({ x: viewport.width * 0.75 + 1, y: viewport.height * 0.65 + 1.5, z: 3 }),
    [viewport.width, viewport.height],
  );

  const particles = useMemo<Particle[]>(() => {
    const random = mulberry32(count * 7919 + kind.length);
    return Array.from({ length: count }, () => ({
      x: (random() * 2 - 1) * bounds.x,
      y: (random() * 2 - 1) * bounds.y,
      z: (random() * 2 - 1) * bounds.z,
      scale: 0.55 + random() * 0.85,
      spin: new THREE.Euler(random() * Math.PI, random() * Math.PI, random() * Math.PI),
      spinRate: new THREE.Vector3(
        (random() - 0.5) * 0.5,
        (random() - 0.5) * 0.7,
        (random() - 0.5) * 0.4,
      ),
      fall: 0.16 + random() * 0.3,
      swayPhase: random() * Math.PI * 2,
      swayAmp: 0.12 + random() * 0.34,
    }));
    // Bounds intentionally excluded: resizing should not respawn the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, kind]);

  useLayoutEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;

    const random = mulberry32(count + 13);
    for (let i = 0; i < count; i += 1) {
      const hex = colors[Math.floor(random() * colors.length)] ?? colors[0] ?? '#ffffff';
      instanced.setColorAt(i, color.set(hex));
    }
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  }, [colors, count]);

  useFrame((state, delta) => {
    const instanced = mesh.current;
    if (!instanced) return;

    // Guard against tab-restore delta spikes teleporting the whole field.
    const dt = Math.min(delta, 0.05);
    const time = state.clock.elapsedTime;
    const sign = direction === 'down' ? -1 : 1;

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.y += sign * p.fall * speed * dt;

      if (sign < 0 && p.y < -bounds.y) p.y = bounds.y;
      if (sign > 0 && p.y > bounds.y) p.y = -bounds.y;

      p.spin.x += p.spinRate.x * dt;
      p.spin.y += p.spinRate.y * dt;
      p.spin.z += p.spinRate.z * dt;

      dummy.position.set(
        p.x + Math.sin(time * 0.4 + p.swayPhase) * p.swayAmp,
        p.y,
        p.z,
      );
      dummy.rotation.copy(p.spin);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    }

    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <meshLambertMaterial
        side={THREE.DoubleSide}
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/** Small deterministic PRNG so a scene looks identical between renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
