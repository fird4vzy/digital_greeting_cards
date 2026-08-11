'use client';

import { useEffect, useState } from 'react';

/**
 * Single source of truth for "should this device animate, and how hard".
 *
 * `reduced` mirrors prefers-reduced-motion. `rich` additionally accounts for
 * device capability, and is what gates the 3D layer: a low-core phone gets the
 * same story told with CSS and imagery instead of WebGL.
 *
 * Both start conservative (reduced = false, rich = false) so the server render
 * and the first client paint agree, then upgrade after mount.
 */
export type MotionPrefs = {
  reduced: boolean;
  rich: boolean;
  /** True once the client has actually measured — useful to avoid flashes. */
  ready: boolean;
};

function measureRichness(): boolean {
  if (typeof window === 'undefined') return false;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const cores = navigator.hardwareConcurrency ?? 4;
  // Non-standard but widely available on Android/Chrome; absent on iOS.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;

  if (cores <= 3) return false;
  if (typeof memory === 'number' && memory <= 3) return false;

  // Data saver on means the user is explicitly asking us to be cheap.
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (connection?.saveData) return false;
  if (connection?.effectiveType && /2g/.test(connection.effectiveType)) return false;

  return true;
}

export function useMotionPrefs(): MotionPrefs {
  const [prefs, setPrefs] = useState<MotionPrefs>({ reduced: false, rich: false, ready: false });

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      setPrefs({ reduced: query.matches, rich: measureRichness(), ready: true });
    };

    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return prefs;
}
