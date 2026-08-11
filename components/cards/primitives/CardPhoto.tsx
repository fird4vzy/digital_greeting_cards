'use client';

import { motion } from 'framer-motion';
import { settleImage, viewportOnce } from '@/lib/design/motion';
import { useMotionPrefs } from '@/lib/hooks/useMotionPrefs';
import type { Photo } from '@/lib/card/schema';
import { cn } from '@/lib/utils/cn';

/**
 * The only place a photograph is rendered inside a card.
 *
 * Uses a plain <img> deliberately: card photos arrive as customer-uploaded
 * URLs or as generated data-URI placeholders, and next/image cannot optimise
 * the latter. Aspect ratio is reserved from the stored intrinsic size so there
 * is no layout shift either way. When uploads move behind a CDN this is the
 * single component to swap.
 */
export function CardPhoto({
  photo,
  className,
  imageClassName,
  ratio,
  priority = false,
  animate = true,
  sizes,
}: {
  photo: Photo;
  className?: string;
  imageClassName?: string;
  /** Force an aspect ratio, e.g. '4 / 5'. Defaults to the photo's own. */
  ratio?: string;
  priority?: boolean;
  animate?: boolean;
  sizes?: string;
}) {
  const { reduced } = useMotionPrefs();
  const aspect = ratio ?? (photo.width && photo.height ? `${photo.width} / ${photo.height}` : '4 / 5');

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.url}
      alt={photo.alt ?? photo.caption ?? ''}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchPriority={priority ? 'high' : 'auto'}
      decoding="async"
      draggable={false}
      className={cn('h-full w-full object-cover', imageClassName)}
      style={{ objectPosition: photo.focal }}
    />
  );

  return (
    <figure className={cn('relative m-0', className)}>
      <div
        className="relative overflow-hidden bg-[color-mix(in_srgb,var(--card-ink)_8%,transparent)]"
        style={{ aspectRatio: aspect }}
      >
        {animate && !reduced ? (
          <motion.div
            className="h-full w-full"
            variants={settleImage(reduced)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
          >
            {image}
          </motion.div>
        ) : (
          image
        )}
      </div>
      {photo.caption ? (
        <figcaption className="mt-3 text-caption text-[var(--card-ink-muted)]">
          {photo.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
