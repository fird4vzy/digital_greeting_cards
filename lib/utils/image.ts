'use client';

import type { Photo } from '@/lib/card/schema';

/**
 * Client-side image preparation.
 *
 * Phone cameras produce 4–12 MB files; a card with six of them would be a
 * 50 MB request body and a miserable experience on shop wifi. Downscaling to
 * a long edge of 1600px and re-encoding as JPEG in the browser turns that into
 * roughly 200–400 KB per photo, before anything leaves the device.
 *
 * The result is a data URL, which is what the current file-backed store keeps.
 * When uploads move to object storage this is the one function that changes:
 * it returns a `Photo`, and every consumer only cares about the URL.
 */

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export async function prepareImage(file: File, id: string): Promise<Photo | null> {
  if (!file.type.startsWith('image/')) return null;

  const bitmap = await loadBitmap(file);
  if (!bitmap) return null;

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) return null;

  context.drawImage(bitmap, 0, 0, width, height);
  if ('close' in bitmap) bitmap.close();

  return {
    id,
    url: canvas.toDataURL('image/jpeg', QUALITY),
    width,
    height,
    alt: '',
  };
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fall through to the <img> path — some browsers reject certain formats.
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    image.src = url;
  });
}
