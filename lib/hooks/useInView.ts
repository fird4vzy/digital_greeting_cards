'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  /** Keep reporting true once seen. Default true — reveals should not replay. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
};

/**
 * Thin IntersectionObserver wrapper used to gate expensive work (WebGL canvases,
 * autoplaying media) rather than to drive reveals — Framer Motion's
 * `whileInView` handles those.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  once = true,
  rootMargin = '200px',
  threshold = 0,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return { ref, inView } as const;
}
