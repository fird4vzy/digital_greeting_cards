'use client';

import { upload } from '@vercel/blob/client';

/**
 * Порог, после которого файл идёт в хранилище, а не через функцию.
 *
 * Четыре мегабайта — с запасом ниже 4,5 МБ, которыми Vercel ограничивает тело
 * запроса: к самому файлу в форме добавляются границы, имя и остальные поля,
 * и упереться в предел на файле ровно в 4,5 МБ было бы обидно.
 */
const MAX_DIRECT_BYTES = 4 * 1024 * 1024;

import { useRef, useState } from 'react';
import type { CardFile } from '@/lib/db/card-files';

/**
 * Загрузка открытки, написанной руками.
 *
 * Папкой, а не архивом: `webkitdirectory` отдаёт браузеру всю папку вместе с
 * относительными путями в `webkitRelativePath`, поэтому ссылки внутри чужой
 * вёрстки — `./assets/song.mp3` — продолжают работать без её переписывания, и
 * распаковщик архива не нужен вовсе.
 *
 * Файлы уходят **по одному запросу на файл**. Это не осторожность, а
 * необходимость: у Vercel тело запроса ограничено 4,5 МБ, и папка целиком не
 * прошла бы никогда. Поштучно проходит всё, кроме отдельных тяжёлых файлов, и
 * отказ тогда называет конкретный файл, а не роняет всю загрузку.
 */

export type UploadStrings = {
  title: string;
  lead: string;
  pick: string;
  replace: string;
  uploading: string;
  entryLabel: string;
  entryNone: string;
  empty: string;
  summary: string;
  removeAll: string;
  removeConfirm: string;
  showing: string;
  showingEngine: string;
  unitMb: string;
  unitKb: string;
};

const humanSize = (bytes: number, strings: UploadStrings) =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} ${strings.unitMb}`
    : `${Math.max(1, Math.round(bytes / 1024))} ${strings.unitKb}`;

export function CustomCardUpload({
  orderId,
  files: initialFiles,
  entry: initialEntry,
  strings,
}: {
  orderId: string;
  files: CardFile[];
  entry: string | null;
  strings: UploadStrings;
}) {
  const [files, setFiles] = useState(initialFiles);
  const [entry, setEntry] = useState(initialEntry);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const total = files.reduce((sum, file) => sum + file.size, 0);
  const entries = files.filter((file) => /\.html?$/i.test(file.path));

  async function send(picked: FileList | null) {
    if (!picked || picked.length === 0) return;

    setError(null);
    const list = [...picked];
    setProgress({ done: 0, total: list.length });

    const uploaded: CardFile[] = [];

    for (const [index, file] of list.entries()) {
      const body = new FormData();
      body.set('orderId', orderId);
      // `webkitRelativePath` включает саму папку первым сегментом — он лишний:
      // открытка должна открываться с `index.html`, а не с `iLove/index.html`.
      const relative = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
      const path = relative ? relative.split('/').slice(1).join('/') : file.name;
      body.set('path', path);

      // ТЯЖЁЛЫЙ ФАЙЛ ИДЁТ МИМО ФУНКЦИИ.
      //
      // У Vercel тело запроса ограничено 4,5 МБ, и до сих пор на этом всё и
      // заканчивалось: видео и звук трёх работ из семи привязать к заказу было
      // нельзя ничем. Теперь браузер грузит такой файл прямо в хранилище, а
      // сюда отправляет только адрес. Маленькие идут как шли — так папка
      // целиком собирается и там, где хранилище не включали.
      if (file.size > MAX_DIRECT_BYTES) {
        try {
          const { url } = await upload(`cards/${orderId}/${path}`, file, {
            access: 'public',
            contentType: file.type || 'application/octet-stream',
            handleUploadUrl: '/api/admin/card-files/token',
          });
          body.set('url', url);
          body.set('size', String(file.size));
        } catch (error) {
          setError(
            `«${path}» весит ${(file.size / 1024 / 1024).toFixed(1)} МБ и не прошёл в хранилище: ` +
              `${(error as Error).message}. Включите Blob в Vercel и задайте BLOB_READ_WRITE_TOKEN.`,
          );
          break;
        }
      } else {
        body.set('file', file);
      }

      const response = await fetch('/api/admin/card-files', { method: 'POST', body });

      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        setError(payload.error ?? `${response.status}`);
        // Уже загруженное остаётся: половина папки лучше, чем ничего, и
        // оператор видит, на каком файле остановились.
        break;
      }

      uploaded.push(((await response.json()) as { file: CardFile }).file);
      setProgress({ done: index + 1, total: list.length });
    }

    setFiles((current) => {
      const merged = new Map(current.map((file) => [file.path, file]));
      for (const file of uploaded) merged.set(file.path, file);
      return [...merged.values()].sort((a, b) => a.path.localeCompare(b.path));
    });

    setProgress(null);
    if (input.current) input.current.value = '';

    // Вход назначается сам, только если он очевиден и ещё не выбран.
    const guess = uploaded.find((file) => file.path === 'index.html');
    if (!entry && guess) await selectEntry(guess.path);
  }

  async function selectEntry(next: string | null) {
    setError(null);
    const response = await fetch('/api/admin/card-files', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, entry: next }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? `${response.status}`);
      return;
    }

    setEntry(next);
  }

  async function removeAll() {
    if (!window.confirm(strings.removeConfirm)) return;

    setError(null);
    const response = await fetch(`/api/admin/card-files?orderId=${encodeURIComponent(orderId)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      setError(String(response.status));
      return;
    }

    setFiles([]);
    setEntry(null);
  }

  return (
    <div className="space-y-3 text-caption">
      <p className="leading-relaxed text-ink-muted">{strings.lead}</p>

      <p className={entry ? 'text-ink' : 'text-ink-muted'}>
        {entry ? strings.showing : strings.showingEngine}
      </p>

      {files.length > 0 ? (
        <p className="text-ink-soft tabular-nums">
          {strings.summary
            .replace('{count}', String(files.length))
            .replace('{size}', humanSize(total, strings))}
        </p>
      ) : (
        <p className="text-ink-muted">{strings.empty}</p>
      )}

      {entries.length > 0 ? (
        <label className="block">
          <span className="eyebrow mb-1.5 block text-ink-muted">{strings.entryLabel}</span>
          <select
            value={entry ?? ''}
            onChange={(event) => selectEntry(event.target.value || null)}
            className="h-9 w-full rounded-[0.5rem] border border-line-strong bg-white px-3 text-caption text-ink outline-none focus:border-ink"
          >
            <option value="">{strings.entryNone}</option>
            {entries.map((file) => (
              <option key={file.path} value={file.path}>
                {file.path}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <input
        ref={input}
        type="file"
        multiple
        // Не в JSX-типах React, но поддерживается всеми браузерами, где
        // администратор реально работает.
        {...({ webkitdirectory: '' } as Record<string, string>)}
        onChange={(event) => send(event.target.files)}
        className="hidden"
        id={`upload-${orderId}`}
      />

      <div className="space-y-2">
        <label
          htmlFor={`upload-${orderId}`}
          className="block w-full cursor-pointer rounded-[0.5rem] border border-line-strong px-4 py-2 text-center text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
        >
          {progress
            ? strings.uploading
                .replace('{done}', String(progress.done))
                .replace('{total}', String(progress.total))
            : files.length > 0
              ? strings.replace
              : strings.pick}
        </label>

        {files.length > 0 ? (
          <button
            type="button"
            onClick={removeAll}
            className="block w-full rounded-[0.5rem] border border-line px-4 py-2 text-center text-caption text-ink-muted transition-colors hover:border-accent hover:text-accent"
          >
            {strings.removeAll}
          </button>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-[0.5rem] border border-accent/40 bg-accent/[0.06] p-3 leading-relaxed text-ink-soft">
          {error}
        </p>
      ) : null}
    </div>
  );
}
