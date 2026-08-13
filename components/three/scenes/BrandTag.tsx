'use client';

import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * The tag, built rather than generated.
 *
 * Two attempts at generating this object failed in different ways: the first
 * flattened the folded corner and invented lettering, the second turned the
 * whole card scarlet. `image_to_3d` re-interprets a colour scheme every time it
 * runs, and this design *is* a colour scheme — cream face, rose reverse, and a
 * corner turned back to show it. Reconstruction cannot be asked to hold a brand
 * constant.
 *
 * So the split is the same one the hero bloom settled: **generate the organic
 * thing, author the designed one.** The bouquet beside this is a generated mesh
 * because a rose is easier grown than drawn; the tag is a rounded rectangle, a
 * chamfer, a hole and a torus, and code gets all four exactly right for a few
 * kilobytes instead of seven megabytes.
 *
 * Every colour comes from the brand: `--wm-surface` cream and the rose of the
 * wordmark's fold. Nothing here is sampled from a render.
 */

const CREAM = '#f4efe6';
const ROSE = '#a33b48';
const BRASS = '#b8912f';
const CORD = '#c4ab8a';

/** Tag proportions, in units of its own height. */
const W = 0.62;
const H = 1;
const THICK = 0.014;
const RADIUS = 0.055;
const BEVEL = 0.0025;
/** How far in from the top-right corner the fold is cut. */
const FOLD = 0.26;
const HOLE_R = 0.042;
const HOLE_Y = H / 2 - 0.115;

/**
 * The card outline: a rounded rectangle with its top-right corner sliced off.
 *
 * The slice is the whole point — the flap that folds back over it is the same
 * triangle, which is why both are derived from `FOLD` rather than eyeballed
 * into place separately.
 */
function cardShape(): THREE.Shape {
  const shape = new THREE.Shape();
  const x = W / 2;
  const y = H / 2;

  shape.moveTo(-x + RADIUS, -y);
  shape.lineTo(x - RADIUS, -y);
  shape.quadraticCurveTo(x, -y, x, -y + RADIUS);
  shape.lineTo(x, y - FOLD);
  // The diagonal. No radius here: a turned corner has a crease, not a curve.
  shape.lineTo(x - FOLD, y);
  shape.lineTo(-x + RADIUS, y);
  shape.quadraticCurveTo(-x, y, -x, y - RADIUS);
  shape.lineTo(-x, -y + RADIUS);
  shape.quadraticCurveTo(-x, -y, -x + RADIUS, -y);

  const hole = new THREE.Path();
  hole.absarc(0, HOLE_Y, HOLE_R, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return shape;
}

/**
 * One petal of the blossom, as an ellipse lifted off the centre.
 *
 * The mark is five of these on a 72° step — the same construction as
 * `app/icon.svg`, deliberately, so the tag and the tab icon are the same
 * flower. An earlier attempt drew the whole blossom as one continuous path of
 * quadratic curves and produced a crumpled shape; five ellipses cannot go
 * wrong, and the seams between them are what give the mark its notches.
 */
const PETAL_RX = 0.036;
const PETAL_RY = 0.058;
const PETAL_LIFT = 0.05;

function petalShape(): THREE.Shape {
  const shape = new THREE.Shape();
  shape.absellipse(0, PETAL_LIFT, PETAL_RX, PETAL_RY, 0, Math.PI * 2, false, 0);
  return shape;
}

export function BrandTag(props: React.ComponentProps<'group'>) {
  const geometry = useMemo(() => {
    const card = new THREE.ExtrudeGeometry(cardShape(), {
      depth: THICK,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 2,
      curveSegments: 12,
    });
    card.translate(0, 0, -THICK / 2);
    card.computeVertexNormals();
    return card;
  }, []);

  const petal = useMemo(() => new THREE.ShapeGeometry(petalShape(), 16), []);

  /**
   * Where the blossom sits in z.
   *
   * Arithmetic, because guessing put it *inside* the card: `ExtrudeGeometry`
   * adds `bevelThickness` on top of `depth`, so the front face is not at
   * THICK/2 but at THICK/2 + bevelThickness. A tenth of a millimetre of
   * clearance above that, and no more, or it stops reading as pressed into
   * the stock and starts reading as a sticker.
   */
  const faceZ = THICK / 2 + BEVEL + 0.0012;

  const flap = useMemo(() => {
    // The folded corner: the triangle cut out of the card, lying back on its
    // face. It is rose because what you are seeing is the reverse of the stock.
    const shape = new THREE.Shape();
    shape.moveTo(W / 2, H / 2 - FOLD);
    shape.lineTo(W / 2 - FOLD, H / 2);
    shape.lineTo(W / 2, H / 2);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: THICK * 0.5,
      bevelEnabled: false,
      curveSegments: 1,
    });
    geo.computeVertexNormals();
    return geo;
  }, []);

  const cord = useMemo(() => {
    // A loop through the eyelet, drawn as one curve rather than two strands:
    // at the size this is ever seen, the doubling reads as thickness.
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, HOLE_Y - 0.01, 0),
      new THREE.Vector3(-0.05, HOLE_Y + 0.1, 0.012),
      new THREE.Vector3(-0.035, HOLE_Y + 0.24, 0),
      new THREE.Vector3(0.035, HOLE_Y + 0.24, -0.012),
      new THREE.Vector3(0.05, HOLE_Y + 0.1, 0),
      new THREE.Vector3(0, HOLE_Y - 0.01, 0),
    ]);
    curve.closed = true;
    return new THREE.TubeGeometry(curve, 64, 0.0085, 6, true);
  }, []);

  return (
    <group {...props}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color={CREAM} roughness={0.86} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* The reverse, a hair behind the card, so the rose shows at every edge
          and through the fold's crease rather than being painted on. */}
      <mesh geometry={geometry} position={[0, 0, -THICK * 0.52]}>
        <meshStandardMaterial color={ROSE} roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      <mesh geometry={flap} position={[0, 0, THICK * 0.5]}>
        <meshStandardMaterial color={ROSE} roughness={0.82} metalness={0} side={THREE.DoubleSide} />
      </mesh>

      {/* Blind deboss: the same cream a shade deeper, sitting a hair proud of
          the face. It reads through the light falling across it, which is how
          a real blind deboss works — no ink is involved in one either. */}
      <group position={[0, -0.06, faceZ]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} geometry={petal} rotation={[0, 0, (i / 5) * Math.PI * 2]}>
            <meshStandardMaterial color="#e4dac7" roughness={0.66} metalness={0} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, HOLE_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[HOLE_R + 0.012, 0.011, 10, 28]} />
        <meshStandardMaterial color={BRASS} roughness={0.32} metalness={0.85} />
      </mesh>

      <mesh geometry={cord}>
        <meshStandardMaterial color={CORD} roughness={0.95} metalness={0} />
      </mesh>
    </group>
  );
}
