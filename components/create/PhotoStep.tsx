'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { Photo } from '@/lib/card/schema';
import type { Dictionary } from '@/lib/i18n/types';
import { prepareImage } from '@/lib/utils/image';
import { cn } from '@/lib/utils/cn';

const MAX_PHOTOS = 12;

/**
 * Photo selection.
 *
 * Everything happens on the device: files are decoded, downscaled to a 1600px
 * long edge and re-encoded before a single byte is uploaded. A shop's wifi and
 * a customer's data plan both benefit, and the card stays fast to open.
 */
export function PhotoStep({
  photos,
  onChange,
  strings,
}: {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  strings: Dictionary['ui']['create']['steps']['photos'];
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const add = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      setBusy(true);

      const room = MAX_PHOTOS - photos.length;
      const accepted = Array.from(files).slice(0, Math.max(0, room));

      const prepared = await Promise.all(
        accepted.map((file, index) => prepareImage(file, `photo-${Date.now()}-${index}`)),
      );

      onChange([...photos, ...prepared.filter((photo): photo is Photo => photo !== null)]);
      setBusy(false);
    },
    [photos, onChange],
  );

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void add(event.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-dashed px-6 py-14 text-center transition-colors duration-400',
          dragging ? 'border-ink bg-white' : 'border-line-strong bg-white/40',
        )}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true" className="h-8 w-8 text-ink-faint">
          <g fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <rect x="4" y="7" width="24" height="18" rx="3" />
            <path d="M4 20l6-5 5 4 5-6 8 7" />
            <circle cx="11" cy="13" r="2" />
          </g>
        </svg>

        <p className="text-caption text-ink-muted">{strings.drop}</p>

        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            void add(event.target.files);
            event.target.value = '';
          }}
        />

        <Button
          variant="secondary"
          onClick={() => input.current?.click()}
          disabled={busy || photos.length >= MAX_PHOTOS}
        >
          {busy ? strings.preparing : photos.length >= MAX_PHOTOS ? strings.enough : strings.choose}
        </Button>
      </div>

      {photos.length > 0 ? (
        <>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {photos.map((photo, index) => (
              <div key={photo.id} className="group relative overflow-hidden rounded-[0.6rem]">
                <span className="block" style={{ aspectRatio: '3 / 4' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((candidate) => candidate.id !== photo.id))}
                  aria-label={strings.remove.replace('{index}', String(index + 1))}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-noir/70 text-paper opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100"
                >
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <p className="mt-4 text-caption text-ink-muted">
            {strings.count.replace('{count}', String(photos.length))}
          </p>
        </>
      ) : null}
    </div>
  );
}
