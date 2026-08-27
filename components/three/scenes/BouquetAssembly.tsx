'use client';

import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { curvedPetalGeometry } from '../geometry';
import { useStudioEnvironment } from '../useStudioEnvironment';
import { BrandTag } from './BrandTag';

/**
 * A BOUQUET THAT ASSEMBLES AS YOU SCROLL
 * ======================================
 * Seven `BloomFlower` heads, the same five-ring table and the same
 * `curvedPetalGeometry` — this is that flower, multiplied and given a
 * timeline. Scroll drives one number and every transform is a pure function
 * of it, so the sequence plays backwards on the way up without any extra
 * state to keep in sync.
 *
 * Two decisions worth knowing about:
 *
 *   1. **Petals scatter around their own head, not around the world.** The
 *      first version threw them ±17 units apart, which looked like an empty
 *      screen for the first third of the scroll: everything was off-camera or
 *      sub-pixel. They now sit in a ~2-unit cloud around the position they are
 *      heading for, so there is a recognisable flower at every scroll offset.
 *   2. **One matrix write per petal per frame, three draw calls total.** 266
 *      petals as meshes would be 266 draw calls; grouped into three
 *      `instancedMesh` by ring colour it is three. The per-frame cost is
 *      arithmetic, not state.
 *
 * `progress` is a ref, not a prop value: scroll must not re-render React.
 */

type Props = {
  colors: string[];
  /** 0 → scattered petals, 1 → wrapped bouquet with the tag tied on. */
  progress: RefObject<number>;
};

/** The ring table from `BloomFlower`, unchanged. */
const RINGS = [
  { count: 9, radius: 1.14, tilt: 1.34, scale: 1.62, color: 0 },
  { count: 8, radius: 0.94, tilt: 1.08, scale: 1.38, color: 0 },
  { count: 8, radius: 0.7, tilt: 0.78, scale: 1.12, color: 1 },
  { count: 7, radius: 0.48, tilt: 0.5, scale: 0.88, color: 1 },
  { count: 6, radius: 0.28, tilt: 0.26, scale: 0.62, color: 2 },
] as const;

const FLOWERS = 7;

/**
 * ПУТЬ КАМЕРЫ — из образца, дословно.
 *
 * Камера не стоит: она облетает сборку. Ключи — `[прогресс, где камера, куда
 * смотрит]`. Именно это и отличало нашу сборку от образца сильнее всего:
 * статичная камера показывает, как объект меняется, движущаяся — как за ним
 * идут. Первое читается схемой, второе сценой.
 */
const CAM_KEYS: [number, THREE.Vector3, THREE.Vector3][] = [
  [0.0, new THREE.Vector3(0, 0.9, 5.0), new THREE.Vector3(0, 1.0, 0)],
  [0.35, new THREE.Vector3(0.5, 1.3, 6.0), new THREE.Vector3(0, 1.4, 0)],
  [0.55, new THREE.Vector3(0, 1.6, 7.2), new THREE.Vector3(0, 1.3, 0)],
  [0.8, new THREE.Vector3(1.9, 1.1, 6.6), new THREE.Vector3(0.5, 0.5, 0)],
  [1.0, new THREE.Vector3(0.9, 1.4, 7.0), new THREE.Vector3(0.2, 0.8, 0)],
];

/**
 * Сглаживание прогресса.
 *
 * Образец гонит сцену не к значению прокрутки, а К ЦЕЛИ: `p += (target - p) *
 * 0.1` каждый кадр. Разница видна сразу — без этого сборка идёт один в один
 * за колесом мыши, дёргается на каждом щелчке и останавливается мгновенно;
 * со сглаживанием у неё есть инерция, и она доигрывает, когда прокрутка уже
 * встала. Это и есть «собирается красивее».
 */
const EASING = 0.1;
const HEAD = 0.72;
const BASE = new THREE.Vector3(0, -0.35, 0);
const UP = new THREE.Vector3(0, 1, 0);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Deterministic noise — the same seed must give the same bouquet every load. */
function makeRandom(seed: number) {
  let s = seed;
  return () => (s = (1103515245 * s + 12345) % 2147483648) / 2147483648;
}
const wobble = (seed: number) => (Math.sin(seed * 127.1) * 43758.5453) % 1;

type Petal = {
  flower: number;
  color: number;
  home: THREE.Vector3;
  burst: THREE.Vector3;
  rotation: [number, number, number];
  scale: number;
  spin: THREE.Euler;
  delay: number;
};

type Flower = {
  spread: THREE.Vector3;
  tight: THREE.Vector3;
  tilt: THREE.Euler;
  world: THREE.Vector3;
  quat: THREE.Quaternion;
};

export function BouquetAssembly({ colors, progress }: Props) {
  useStudioEnvironment(colors);

  /** Сглаженное значение: гонится к `progress`, а не равно ему. */
  const eased = useRef(0);
  /**
   * Первый кадр берёт цель как есть.
   *
   * Между актами сцена размонтируется и монтируется заново, а второй акт
   * начинается с 0.55. Без этого сглаживание погнало бы его от нуля и
   * переиграло всю первую половину сборки за секунду — на экране это выглядит
   * как сбой, а не как продолжение.
   */
  const primed = useRef(false);

  /**
   * Лёгкий параллакс от мыши — из образца.
   *
   * В ref, а не в состоянии: движение мыши не должно перерисовывать дерево.
   * На тач-устройствах события просто не приходят, и множитель остаётся нулём.
   */
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const track = (event: PointerEvent) => {
      pointer.current.x = event.clientX / window.innerWidth - 0.5;
      pointer.current.y = event.clientY / window.innerHeight - 0.5;
    };

    window.addEventListener('pointermove', track, { passive: true });
    return () => window.removeEventListener('pointermove', track);
  }, []);

  const geometry = useMemo(() => curvedPetalGeometry(), []);
  const stemGeometry = useMemo(() => new THREE.CylinderGeometry(0.026, 0.045, 1, 6, 1), []);
  const stamenGeometry = useMemo(() => new THREE.SphereGeometry(0.022, 8, 6), []);

  const { flowers, petals, groups, stamens, leaves } = useMemo(() => {
    const random = makeRandom(20260819);
    const flowerList: Flower[] = [];
    const petalList: Petal[] = [];

    for (let f = 0; f < FLOWERS; f += 1) {
      const t = (f - (FLOWERS - 1) / 2) / ((FLOWERS - 1) / 2);

      flowerList.push({
        spread: new THREE.Vector3(t * 1.9, 1.15 + random() * 0.8, (random() - 0.5) * 1.5),
        tight: new THREE.Vector3(
          t * 1.02,
          1.62 + (1 - Math.abs(t)) * 0.52 + random() * 0.14,
          (random() - 0.5) * 0.7,
        ),
        tilt: new THREE.Euler(-0.16 + (random() - 0.5) * 0.24, t * 0.28, t * 0.3),
        world: new THREE.Vector3(),
        quat: new THREE.Quaternion(),
      });

      RINGS.forEach((ring, ri) => {
        for (let i = 0; i < ring.count; i += 1) {
          const j = wobble(ri * 17 + i + f * 3.3);
          const angle = (i / ring.count) * Math.PI * 2 + ri * 0.42 + j * 0.09;

          // Spherical offset, so the cloud is a shell around the head rather
          // than a box the corners of which leave the frame first.
          const azimuth = random() * Math.PI * 2;
          const polar = Math.acos(random() * 2 - 1);
          const radius = 1.5 + random() * 1.3;

          petalList.push({
            flower: f,
            color: ring.color,
            home: new THREE.Vector3(
              Math.cos(angle) * ring.radius * 0.34,
              Math.sin(angle) * ring.radius * 0.34,
              (RINGS.length - ri) * -0.075 + j * 0.02,
            ),
            burst: new THREE.Vector3(
              Math.sin(polar) * Math.cos(azimuth) * radius,
              Math.sin(polar) * Math.sin(azimuth) * radius,
              Math.cos(polar) * radius * 0.7,
            ),
            rotation: [ring.tilt * 0.55 + j * 0.12, j * 0.16, angle - Math.PI / 2 + j * 0.1],
            scale: ring.scale * (1 + j * 0.09) * 0.58,
            spin: new THREE.Euler(random() * 6.3, random() * 6.3, random() * 6.3),
            delay: f * 0.02 + ri * 0.012,
          });
        }
      });
    }

    const stamenList: { flower: number; local: THREE.Vector3 }[] = [];
    for (let f = 0; f < FLOWERS; f += 1) {
      for (let i = 0; i < 12; i += 1) {
        const a = (i / 12) * Math.PI * 2;
        const r = 0.05 + wobble(i * 3.7) * 0.03;
        stamenList.push({
          flower: f,
          local: new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0.3 + wobble(i) * 0.04),
        });
      }
    }

    const leafList: { flower: number; height: number; side: number; rot: number; scale: number }[] = [];
    for (let f = 0; f < FLOWERS; f += 1) {
      for (let k = 0; k < 2; k += 1) {
        leafList.push({
          flower: f,
          height: 0.5 + k * 0.52,
          side: k ? 1 : -1,
          rot: random() * 6.3,
          scale: 0.5 + random() * 0.2,
        });
      }
    }

    return {
      flowers: flowerList,
      petals: petalList,
      groups: [0, 1, 2].map((c) => petalList.filter((p) => p.color === c)),
      stamens: stamenList,
      leaves: leafList,
    };
  }, []);

  const petalRefs = [
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
    useRef<THREE.InstancedMesh>(null),
  ];
  const stamenRef = useRef<THREE.InstancedMesh>(null);
  const leafRef = useRef<THREE.InstancedMesh>(null);
  const stemRefs = useRef<(THREE.Mesh | null)[]>([]);
  const wrapRef = useRef<THREE.Mesh>(null);
  const ribbonRef = useRef<THREE.Mesh>(null);
  const tagRef = useRef<THREE.Group>(null);
  const cordRef = useRef<THREE.Mesh>(null);

  // Scratch objects, allocated once. Allocating inside useFrame is how a
  // scene that runs fine for ten seconds starts stuttering at thirty.
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      flowerMatrix: new THREE.Matrix4(),
      localMatrix: new THREE.Matrix4(),
      quat: new THREE.Quaternion(),
      from: new THREE.Quaternion(),
      to: new THREE.Quaternion(),
      position: new THREE.Vector3(),
      offset: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      base: new THREE.Vector3(),
      head: new THREE.Vector3(),
      euler: new THREE.Euler(),
      one: new THREE.Vector3(1, 1, 1),
      look: new THREE.Vector3(),
      tagFrom: new THREE.Vector3(5.5, 2.6, 2.5),
      // Радиус обёртки на высоте бирки — 0.83; бирка садится на 0.97, то есть
      // лежит на бумаге, а не висит в метре от неё. Старая точка 1.71 от оси
      // была измеренной ошибкой, записанной в STATUS.
      tagTo: new THREE.Vector3(0.8, -0.3, 0.55),
      // Край обёртки на том же азимуте — точка, к которой привязан шнурок.
      cordAnchor: new THREE.Vector3(0.84, 0.15, 0.58),
      hole: new THREE.Vector3(),
    }),
    [],
  );

  useFrame(({ camera }) => {
    // Сцена идёт К цели, а не В цель: инерция из образца.
    const target = clamp01(progress.current ?? 0);
    if (!primed.current) {
      primed.current = true;
      eased.current = target;
    }
    eased.current += (target - eased.current) * EASING;
    const p = eased.current;
    const s = scratch;

    const gather = ease(seg(p, 0.42, 0.62));
    const grow = ease(seg(p, 0.16, 0.46));
    const leafT = ease(seg(p, 0.3, 0.52));

    flowers.forEach((flower, i) => {
      s.head.lerpVectors(flower.spread, flower.tight, gather).add(BASE);
      flower.world.copy(s.head);
      flower.quat.setFromEuler(flower.tilt);

      const stem = stemRefs.current[i];
      if (!stem) return;
      s.base.set(BASE.x + flower.tight.x * 0.28, BASE.y - 1.2, BASE.z + flower.tight.z * 0.28);
      s.dir.copy(s.head).sub(s.base);
      const length = Math.max(0.001, s.dir.length() * grow);
      s.dir.normalize();
      stem.quaternion.setFromUnitVectors(UP, s.dir);
      stem.scale.set(1, length, 1);
      stem.position.copy(s.base).addScaledVector(s.dir, length / 2);
    });

    groups.forEach((list, gi) => {
      const mesh = petalRefs[gi].current;
      if (!mesh) return;

      list.forEach((petal, index) => {
        const flower = flowers[petal.flower];
        const t = ease(seg(p, petal.delay, 0.34 + petal.delay));
        const open = ease(seg(p, 0.2 + petal.delay, 0.52 + petal.delay));

        // A bud is the same petals pulled in and curled over; interpolating
        // both is cheaper and reads better than a second geometry.
        const pull = mix(0.46, 1, open);
        const curl = mix(1.75, 1, open);

        s.euler.set(petal.rotation[0] * curl, petal.rotation[1], petal.rotation[2]);
        s.to.setFromEuler(s.euler);
        s.from.setFromEuler(petal.spin);
        s.quat.copy(s.from).slerp(s.to, t);

        s.position.copy(petal.home).multiplyScalar(pull * HEAD);
        s.offset.copy(s.position).add(petal.burst);
        s.position.lerpVectors(s.offset, s.position, t);
        s.scale.setScalar(petal.scale * HEAD * (0.62 + 0.38 * t));

        s.localMatrix.compose(s.position, s.quat, s.scale);
        s.flowerMatrix.compose(flower.world, flower.quat, s.one);
        mesh.setMatrixAt(index, s.matrix.multiplyMatrices(s.flowerMatrix, s.localMatrix));
      });

      mesh.instanceMatrix.needsUpdate = true;
    });

    const stamenMesh = stamenRef.current;
    if (stamenMesh) {
      const t = ease(seg(p, 0.28, 0.6));
      stamens.forEach((stamen, i) => {
        const flower = flowers[stamen.flower];
        s.position.copy(stamen.local).multiplyScalar(HEAD);
        s.localMatrix.compose(s.position, s.quat.identity(), s.scale.setScalar(t * HEAD));
        s.flowerMatrix.compose(flower.world, flower.quat, s.one);
        stamenMesh.setMatrixAt(i, s.matrix.multiplyMatrices(s.flowerMatrix, s.localMatrix));
      });
      stamenMesh.instanceMatrix.needsUpdate = true;
    }

    const leafMesh = leafRef.current;
    if (leafMesh) {
      leaves.forEach((leaf, i) => {
        const flower = flowers[leaf.flower];
        s.position.set(
          flower.world.x * 0.5 + leaf.side * 0.2,
          BASE.y - 1.2 + leaf.height * 1.5 * leafT,
          flower.world.z * 0.5,
        );
        s.euler.set(1.3, leaf.rot, leaf.side * 0.95);
        s.quat.setFromEuler(s.euler);
        s.scale.setScalar(leaf.scale * leafT);
        leafMesh.setMatrixAt(i, s.localMatrix.compose(s.position, s.quat, s.scale));
      });
      leafMesh.instanceMatrix.needsUpdate = true;
    }

    const wrap = wrapRef.current;
    if (wrap) {
      const t = ease(seg(p, 0.6, 0.74));
      wrap.visible = t > 0.001;
      wrap.scale.setScalar(t);
      wrap.position.set(0, BASE.y - 0.35, 0);
      wrap.rotation.y = p * 1.1;
    }

    const ribbon = ribbonRef.current;
    if (ribbon) {
      const t = ease(seg(p, 0.7, 0.8));
      ribbon.visible = t > 0.001;
      ribbon.scale.setScalar(t);
      ribbon.position.set(0, BASE.y - 0.95, 0);
    }

    const tag = tagRef.current;
    if (tag) {
      const t = ease(seg(p, 0.76, 0.93));
      tag.visible = t > 0.001;
      tag.position.lerpVectors(s.tagFrom, s.tagTo, t);
      // Settles into the way something on a cord actually hangs, rather than
      // square to the camera.
      tag.rotation.set((1 - t) * 1.6, -0.45 + (1 - t) * 3.4, (1 - t) * -0.7 + 0.1);
      tag.scale.setScalar(0.42 * Math.max(0.001, t));

      // Шнурок: от края обёртки до отверстия бирки. Без него бирка висела
      // в воздухе даже вплотную к бумаге: ничто не объясняло, на чём она
      // держится. Появляется, когда бирка почти долетела и её поворот осел.
      const cord = cordRef.current;
      if (cord) {
        const show = t > 0.72;
        cord.visible = show;
        if (show) {
          s.hole.set(0, 0.16, 0).add(tag.position);
          s.dir.copy(s.hole).sub(s.cordAnchor);
          const length = Math.max(0.001, s.dir.length());
          s.dir.normalize();
          cord.quaternion.setFromUnitVectors(UP, s.dir);
          cord.scale.set(1, length, 1);
          cord.position.copy(s.cordAnchor).addScaledVector(s.dir, length / 2);
        }
      }
    }

    // Камера идёт по ключам образца.
    let from = CAM_KEYS[0];
    let to = CAM_KEYS[CAM_KEYS.length - 1];
    for (let i = 0; i < CAM_KEYS.length - 1; i += 1) {
      if (p >= CAM_KEYS[i][0] && p <= CAM_KEYS[i + 1][0]) {
        from = CAM_KEYS[i];
        to = CAM_KEYS[i + 1];
        break;
      }
    }

    const persp = camera as THREE.PerspectiveCamera;
    const k = ease(seg(p, from[0], to[0]));
    persp.position.lerpVectors(from[1], to[1], k);
    s.look.lerpVectors(from[2], to[2], k);

    // Текст живёт слева, поэтому букет не стоит по центру кадра — на широких
    // окнах он сдвигается вправо. Числа из образца.
    const width = window.innerWidth;
    const shift = width > 1100 ? -1.35 : width > 880 ? -0.7 : 0;

    // Узкое окно: камера отъезжает вдоль своего луча, пока букет не влезет по
    // ширине. Формула образца; при aspect >= 1.5 множитель равен единице.
    const fit = Math.max(1, 1.5 / Math.max(persp.aspect, 0.35));
    persp.position.sub(s.look).multiplyScalar(fit).add(s.look);

    // На телефоне ещё и вниз: текст занимает верх экрана.
    if (persp.aspect < 0.85) s.look.y += 1.15;

    persp.position.x += pointer.current.x * 0.45 + shift;
    persp.position.y += -pointer.current.y * 0.3;
    s.look.x += shift;
    persp.lookAt(s.look);
  });

  return (
    <group>
      {groups.map((list, i) => (
        <instancedMesh
          key={i}
          ref={petalRefs[i]}
          args={[geometry, undefined, list.length]}
          frustumCulled={false}
        >
          <meshPhysicalMaterial
            color={colors[i] ?? '#e7c9c6'}
            side={THREE.DoubleSide}
            roughness={0.72}
            metalness={0}
            sheen={0.5}
            sheenRoughness={0.42}
            sheenColor="#e7c9c6"
            envMapIntensity={0.55}
            transparent
            opacity={0.97}
          />
        </instancedMesh>
      ))}

      <instancedMesh ref={stamenRef} args={[stamenGeometry, undefined, stamens.length]} frustumCulled={false}>
        <meshPhysicalMaterial color={colors[2] ?? '#efe7db'} roughness={0.35} sheen={0.6} />
      </instancedMesh>

      <instancedMesh ref={leafRef} args={[geometry, undefined, leaves.length]} frustumCulled={false}>
        <meshStandardMaterial color="#6f7c64" roughness={0.85} side={THREE.DoubleSide} />
      </instancedMesh>

      {flowers.map((_, i) => (
        <mesh
          key={i}
          ref={(node) => {
            stemRefs.current[i] = node;
          }}
          geometry={stemGeometry}
        >
          <meshStandardMaterial color="#5f6b57" roughness={0.9} />
        </mesh>
      ))}

      <mesh ref={wrapRef} visible={false}>
        <cylinderGeometry args={[1.02, 0.3, 1.7, 22, 1, true]} />
        <meshStandardMaterial color="#ede3d3" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      <mesh ref={ribbonRef} visible={false} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.042, 8, 26]} />
        <meshStandardMaterial color="#ac8b57" roughness={0.42} metalness={0.35} />
      </mesh>

      {/* Шнурок бирки — тот же латунный тон, что у ленты. */}
      <mesh ref={cordRef} visible={false}>
        <cylinderGeometry args={[0.008, 0.008, 1, 6]} />
        <meshStandardMaterial color="#ac8b57" roughness={0.5} metalness={0.25} />
      </mesh>

      {/* The tag is the existing component, not a new one: the brand is a set
          of exact colours and this is where they already live. */}
      <group ref={tagRef} visible={false}>
        <BrandTag />
      </group>
    </group>
  );
}
