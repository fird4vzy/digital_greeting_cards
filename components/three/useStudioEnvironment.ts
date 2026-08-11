'use client';

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

/**
 * A studio environment, generated in memory.
 *
 * Transmissive materials have nothing to refract without an environment map,
 * which is why a glass mesh lit only by lights reads as tinted plastic. The
 * usual fix is an HDRI download — a megabyte or two over the network for a
 * decorative element, on a page someone opens next to a bouquet.
 *
 * Instead this paints a small equirectangular gradient with a few soft
 * highlights and runs it through PMREM so roughness filtering behaves. It is
 * 64×32 pixels, built once per scene, and it is the difference between glass
 * and plastic.
 */
export function useStudioEnvironment(colors: string[]): void {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const key = colors.join('|');

  useEffect(() => {
    const width = 64;
    const height = 32;
    const data = new Uint8Array(width * height * 4);

    const sky = new THREE.Color(colors[2] ?? '#ffffff');
    const horizon = new THREE.Color(colors[0] ?? '#ffffff');
    const ground = new THREE.Color('#0b0507');
    const scratch = new THREE.Color();

    // Three highlights at different elevations give the surface something to
    // catch as it turns — the moving specular is what reads as "polished".
    const highlights = [
      { u: 0.18, v: 0.22, r: 0.16, power: 2.6 },
      { u: 0.62, v: 0.34, r: 0.11, power: 1.9 },
      { u: 0.88, v: 0.15, r: 0.08, power: 2.2 },
    ];

    for (let y = 0; y < height; y += 1) {
      const v = y / (height - 1);

      for (let x = 0; x < width; x += 1) {
        const u = x / (width - 1);

        // Vertical gradient: sky → horizon → ground.
        if (v < 0.5) scratch.copy(sky).lerp(horizon, v * 2);
        else scratch.copy(horizon).lerp(ground, (v - 0.5) * 2);

        for (const spot of highlights) {
          // Wrap horizontally so the seam does not show as a dark band.
          const du = Math.min(Math.abs(u - spot.u), 1 - Math.abs(u - spot.u));
          const dv = Math.abs(v - spot.v);
          const distance = Math.sqrt(du * du + dv * dv);
          if (distance < spot.r) {
            const falloff = 1 - distance / spot.r;
            scratch.addScalar(falloff * falloff * spot.power * 0.5);
          }
        }

        const index = (y * width + x) * 4;
        data[index] = Math.min(255, scratch.r * 255);
        data[index + 1] = Math.min(255, scratch.g * 255);
        data[index + 2] = Math.min(255, scratch.b * 255);
        data[index + 3] = 255;
      }
    }

    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const pmrem = new THREE.PMREMGenerator(gl);
    const target = pmrem.fromEquirectangular(texture);
    scene.environment = target.texture;

    return () => {
      scene.environment = null;
      target.dispose();
      pmrem.dispose();
      texture.dispose();
    };
    // `colors` is a fresh array each render; compare by value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, gl, key]);
}
