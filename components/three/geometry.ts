import * as THREE from 'three';

/**
 * Procedural geometry for the atmosphere layer.
 *
 * Everything here is built from `THREE.Shape` rather than loaded from a GLTF:
 * a petal is a handful of bezier control points, so it costs nothing to ship,
 * nothing to download, and it triangulates to a few dozen faces. The entire
 * 3D layer of this product adds zero asset bytes to the bundle.
 */

/** A single flower petal — wide at the base, tapered, gently curved. */
export function petalShape(width = 0.5, length = 1): THREE.Shape {
  const shape = new THREE.Shape();
  const w = width / 2;

  shape.moveTo(0, 0);
  shape.bezierCurveTo(w, length * 0.16, w * 1.08, length * 0.62, 0, length);
  shape.bezierCurveTo(-w * 1.08, length * 0.62, -w, length * 0.16, 0, 0);

  return shape;
}

/** A rounder, blunter sakura petal with the characteristic notched tip. */
export function sakuraPetalShape(width = 0.6, length = 0.82): THREE.Shape {
  const shape = new THREE.Shape();
  const w = width / 2;

  shape.moveTo(0, 0);
  shape.bezierCurveTo(w * 1.1, length * 0.2, w, length * 0.78, w * 0.22, length);
  shape.quadraticCurveTo(0, length * 0.86, -w * 0.22, length);
  shape.bezierCurveTo(-w, length * 0.78, -w * 1.1, length * 0.2, 0, 0);

  return shape;
}

/** The classic heart curve, used for the romantic template's centrepiece. */
export function heartShape(scale = 1): THREE.Shape {
  const shape = new THREE.Shape();
  const s = scale;

  shape.moveTo(0, -0.75 * s);
  shape.bezierCurveTo(0.72 * s, -0.2 * s, 1.05 * s, 0.42 * s, 0.52 * s, 0.72 * s);
  shape.bezierCurveTo(0.24 * s, 0.88 * s, 0.05 * s, 0.72 * s, 0, 0.55 * s);
  shape.bezierCurveTo(-0.05 * s, 0.72 * s, -0.24 * s, 0.88 * s, -0.52 * s, 0.72 * s);
  shape.bezierCurveTo(-1.05 * s, 0.42 * s, -0.72 * s, -0.2 * s, 0, -0.75 * s);

  return shape;
}

/**
 * Geometry cache. Scenes mount and unmount as the reader scrolls; rebuilding
 * the same extrusion each time is wasteful and causes a visible hitch on
 * mid-range phones.
 */
const cache = new Map<string, THREE.BufferGeometry>();

function cached(key: string, build: () => THREE.BufferGeometry): THREE.BufferGeometry {
  const hit = cache.get(key);
  if (hit) return hit;
  const geometry = build();
  cache.set(key, geometry);
  return geometry;
}

export type PetalKind = 'rose' | 'sakura' | 'mote';

/**
 * A petal with a curl in it.
 *
 * `petalGeometry` returns the flat cut-out, which is right for petals that
 * tumble past the camera at a distance — the drift and the sakura fall. It is
 * wrong for the bloom in the hero, which is held still and looked at: flat
 * petals under any light read as paper cut-outs, and no material fixes a shape
 * that has no thickness to catch a highlight on.
 *
 * So the same outline is tessellated more finely and pushed out of its plane
 * twice: a cup across the width, and a backward bend along the length. That is
 * all a real petal does, and it is what gives the surface something for the
 * light to run along.
 */
export function curvedPetalGeometry(cup = 0.34, bend = 0.22): THREE.BufferGeometry {
  return cached(`petal-curved-${cup}-${bend}`, () => {
    // 24 segments rather than 8: the curve is only as smooth as the mesh under
    // it, and this geometry is cached once for every petal in the scene.
    const geometry = new THREE.ShapeGeometry(petalShape(), 24);
    geometry.translate(0, -0.45, 0);
    geometry.scale(0.42, 0.42, 0.42);

    const position = geometry.attributes.position as THREE.BufferAttribute;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < position.count; i += 1) {
      xs.push(position.getX(i));
      ys.push(position.getY(i));
    }
    const halfWidth = Math.max(...xs.map(Math.abs)) || 1;
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const span = maxY - minY || 1;

    for (let i = 0; i < position.count; i += 1) {
      const x = position.getX(i);
      const y = position.getY(i);
      // Across the petal: a parabola, deepest at the edges.
      const across = (x / halfWidth) ** 2 * cup;
      // Along it: nothing at the base, most at the tip, so the petal leans
      // back the way a bloom opens.
      const along = ((y - minY) / span) ** 2 * bend;
      position.setZ(i, across + along);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  });
}

export function petalGeometry(kind: PetalKind): THREE.BufferGeometry {
  return cached(`petal-${kind}`, () => {
    if (kind === 'mote') {
      // Embers and dust motes: a hexagon is indistinguishable from a circle at
      // this size and costs a quarter of the triangles.
      return new THREE.CircleGeometry(0.09, 6);
    }

    const shape = kind === 'sakura' ? sakuraPetalShape() : petalShape();
    const geometry = new THREE.ShapeGeometry(shape, 8);
    // Origin at the centre of mass so instances tumble around themselves
    // rather than pivoting about their base.
    geometry.translate(0, -0.45, 0);
    geometry.scale(0.42, 0.42, 0.42);
    return geometry;
  });
}

/**
 * A deliberately low-segment extrusion, un-indexed so every face gets its own
 * normal. Flat facets each catch the lights at a different angle, which is
 * what actually reads as cut crystal — a smooth transmissive mesh needs a real
 * HDRI to look like anything but tinted plastic, and this does not.
 */
export function heartGeometry(): THREE.BufferGeometry {
  return cached('heart', () => {
    const geometry = new THREE.ExtrudeGeometry(heartShape(1), {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.14,
      bevelThickness: 0.16,
      curveSegments: 7,
    });

    const faceted = geometry.toNonIndexed();
    faceted.computeVertexNormals();
    faceted.center();
    geometry.dispose();

    return faceted;
  });
}

export function disposeGeometryCache(): void {
  cache.forEach((geometry) => geometry.dispose());
  cache.clear();
}
