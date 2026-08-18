'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Dictionary } from '@/lib/i18n/types';
import { cn } from '@/lib/utils/cn';

/**
 * Показывает работу ровно такой, какой её отдали.
 *
 * **Про песочницу.** `sandbox="allow-scripts"` и намеренно **без**
 * `allow-same-origin`: вместе эти два флага отменяют изоляцию, и тогда чужой
 * скрипт получил бы полный доступ к этому домену — то есть к сессионной куке
 * оператора. Порознь `allow-scripts` даёт содержимому opaque origin: скрипты
 * работают, куки и DOM родителя недоступны. Если когда-нибудь понадобится
 * добавить сюда флаг, `allow-same-origin` — единственный, которого нельзя.
 *
 * `allow-popups` оставлен: в «Пойдём?» кнопка «Да» уводит на вторую страницу.
 *
 * **Почему панель сама сворачивается.** Она лежит поверх чужой вёрстки и
 * закрывала заголовок в двух работах из трёх. Развернуть её обратно наведением
 * мыши нельзя: фрейм в другом origin, и события оттуда до родителя не доходят
 * — поэтому в углу остаётся маленькая кнопка, единственное, на что можно
 * навести. Угол выбран потому, что там реже всего оказывается смысл.
 */
export function WorkViewer({
  src,
  title,
  shareUrl,
  qrUrl,
  note,
  strings,
}: {
  src: string;
  title: string;
  shareUrl: string;
  qrUrl: string;
  note?: string;
  strings: Dictionary['ui']['works'];
}) {
  const [copied, setCopied] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Показать, дать прочитать, убраться с дороги.
  useEffect(() => {
    if (panelOpen) return;
    const timer = window.setTimeout(() => setExpanded(false), 4000);
    return () => window.clearTimeout(timer);
  }, [panelOpen]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <div className="relative h-[100svh] w-full overflow-hidden bg-noir">
      <iframe
        src={src}
        title={title}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
        allow="autoplay; fullscreen"
        className="h-full w-full border-0"
      />

      <div
        className="absolute left-3 top-3 z-10 flex items-center"
        onMouseEnter={() => setExpanded(true)}
      >
        {expanded ? (
          <div
            className={cn(
              'flex max-w-[min(92vw,40rem)] flex-wrap items-center gap-x-3 gap-y-2',
              'rounded-full border border-white/10 bg-noir/85 py-2 pl-3 pr-2 text-paper',
              'shadow-[var(--shadow-float)] backdrop-blur-xl',
            )}
          >
            <Link
              href="/works"
              className="shrink-0 rounded-full p-1 text-paper/60 transition-colors hover:text-paper"
              aria-label={strings.back}
            >
              <BackArrow />
            </Link>

            <p className="min-w-0 max-w-[16rem] truncate font-display text-[1.05rem] leading-tight">
              {title}
            </p>

            <button
              type="button"
              onClick={() => setPanelOpen((open) => !open)}
              aria-expanded={panelOpen}
              className="shrink-0 rounded-full px-2 py-1 text-[0.8125rem] text-paper/70 transition-colors hover:text-paper"
            >
              {strings.qr}
            </button>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
              className="shrink-0 rounded-full bg-paper px-3.5 py-1.5 text-[0.8125rem] font-medium text-ink transition-colors hover:bg-white"
            >
              {copied ? strings.copied : strings.copyLink}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            onFocus={() => setExpanded(true)}
            aria-label={strings.back}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full',
              'border border-white/10 bg-noir/50 text-paper/70 backdrop-blur-md',
              'transition-colors hover:bg-noir/85 hover:text-paper',
            )}
          >
            <BackArrow />
          </button>
        )}
      </div>

      {panelOpen && expanded ? (
        <div className="absolute left-3 top-16 z-10 w-[15rem] rounded-[1rem] border border-white/10 bg-noir/90 p-4 text-paper backdrop-blur-xl">
          <div className="rounded-[0.5rem] bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={strings.qr} className="h-full w-full" />
          </div>
          <p className="mt-3 break-all text-[0.7rem] leading-relaxed text-paper/50">{shareUrl}</p>
          <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-[0.75rem] text-paper/70 underline underline-offset-4 transition-colors hover:text-paper"
          >
            {strings.openFull}
          </a>
          {note ? (
            <p className="mt-3 border-t border-white/10 pt-3 text-[0.7rem] leading-relaxed text-paper/40">
              {note}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function BackArrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d="M14 8H3M7 4L3 8l4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
