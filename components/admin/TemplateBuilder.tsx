'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  saveTemplate,
  deleteTemplate,
  importFromRepository,
  importFromFiles,
} from '@/app/admin/templates/actions';
import { SECTION_KINDS, type SectionKind } from '@/lib/card/schema';
import type { TemplateRecipe } from '@/lib/card/recipe';

/**
 * THE BUILDER
 *
 * Every control on this form is a choice from a list the renderer actually
 * implements — palettes, scenes, beats, and the looks each beat knows. There
 * is no free text except the id and the copy, which is the whole reason a
 * template can be built here at all: the operator is picking from the same
 * vocabulary a developer picks from in `templates/`, so nothing they assemble
 * can render into something nobody built.
 *
 * The beat list is ordered as the arc runs, and the *reorder* pair at the end
 * is the one thing that was not obvious before a template was ported by hand:
 * moving the video ahead of the letter is what separates *Aloud* from
 * *Nocturne*, and without it this form could only make colour variations.
 */

type Vocabulary = {
  palettes: { id: string; name: string; swatches: readonly string[] }[];
  scenes: { id: string; label: string }[];
  motifs: { id: string; label: string }[];
  beats: { id: string; label: string; looks: { id: string; label: string }[] }[];
  occasions: { id: string; label: string }[];
  moods: { id: string; label: string }[];
};

export type BuilderStrings = {
  newTemplate: string;
  identity: string;
  idLabel: string;
  idHint: string;
  look: string;
  palette: string;
  scene: string;
  motif: string;
  suits: string;
  moods: string;
  beats: string;
  beatsHint: string;
  order: string;
  orderHint: string;
  orderNone: string;
  orderMove: string;
  orderBefore: string;
  copy: string;
  copyHint: string;
  name: string;
  tagline: string;
  description: string;
  animationStyle: string;
  save: string;
  saving: string;
  saved: string;
  remove: string;
  removeConfirm: string;
  existing: string;
  none: string;
  preview: string;
  importTitle: string;
  importHint: string;
  importAction: string;
  importing: string;
  unmapped: string;
  importOr: string;
  importFiles: string;
  importFilesHint: string;
  importNoFiles: string;
};

const EMPTY = (defaults: Vocabulary) => ({
  id: '',
  paletteId: defaults.palettes[0]?.id ?? 'duskRose',
  scene: 'petals' as string,
  motif: 'petals' as string,
  occasions: [] as string[],
  moods: [] as string[],
  supportedSections: ['cover', 'envelope', 'intro', 'letter', 'final', 'closing'] as SectionKind[],
  sectionVariants: {} as Record<string, string | undefined>,
  reorder: null as { move: string; before: string } | null,
  strings: { en: { name: '', tagline: '', description: '', animationStyle: '' } },
});

export function TemplateBuilder({
  vocabulary,
  stored,
  strings: t,
}: {
  vocabulary: Vocabulary;
  stored: TemplateRecipe[];
  strings: BuilderStrings;
}) {
  const [form, setForm] = useState(() => EMPTY(vocabulary));
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const [repoUrl, setRepoUrl] = useState('');
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [rationale, setRationale] = useState('');

  /** Both routes end here: a recipe fills the form, it is never saved. */
  function applyImport(result: Awaited<ReturnType<typeof importFromRepository>>) {
    if (!result.ok) {
      setFailed(true);
      setMessage(result.error);
      return;
    }

    const { unmapped: gaps, rationale: why, strings: copy, ...recipe } = result.recipe;

    setForm((current) => ({
      ...current,
      ...recipe,
      sectionVariants: recipe.sectionVariants as Record<string, string | undefined>,
      strings: { en: copy },
    }));
    setUnmapped(gaps);
    setRationale(why);
    setFailed(false);
    setMessage(null);
  }

  function runImport() {
    setMessage(null);
    setUnmapped([]);
    setRationale('');
    startTransition(async () => applyImport(await importFromRepository(repoUrl)));
  }

  /**
   * Reads a dropped folder in the browser and posts only its text.
   *
   * Photographs, audio and video are skipped before anything leaves the page:
   * they are what a *card* carries, not a template, and a 3 MB song sent to a
   * server action to be discarded is waste twice over. The folder's own name
   * becomes the suggested id, because that is what the operator already calls
   * this thing.
   */
  function runFileImport(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    setMessage(null);
    setUnmapped([]);
    setRationale('');

    startTransition(async () => {
      const readable = Array.from(fileList).filter((file) =>
        /\.(html?|css|js)$/i.test(file.name),
      );

      if (readable.length === 0) {
        setFailed(true);
        setMessage(t.importNoFiles);
        return;
      }

      // HTML first: it is the structure, and the budget is spent in order.
      readable.sort((a, b) => Number(b.name.endsWith('.html')) - Number(a.name.endsWith('.html')));

      const files = await Promise.all(
        readable.map(async (file) => ({
          path: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
          text: await file.text(),
        })),
      );

      const first = files[0]?.path ?? '';
      const folder = first.includes('/') ? first.split('/')[0] : 'imported';

      applyImport(await importFromFiles(files, folder));
    });
  }

  const set = <K extends keyof ReturnType<typeof EMPTY>>(
    key: K,
    value: ReturnType<typeof EMPTY>[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  function submit() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveTemplate({
        ...form,
        // Strip variants for beats that are not played: a stale look on a
        // dropped beat would be stored and then quietly re-applied if the beat
        // came back.
        sectionVariants: Object.fromEntries(
          Object.entries(form.sectionVariants).filter(
            ([kind, look]) => look && form.supportedSections.includes(kind as SectionKind),
          ),
        ),
        reorder:
          form.reorder && form.reorder.move && form.reorder.before ? form.reorder : null,
      });

      setFailed(!result.ok);
      setMessage(result.ok ? t.saved : result.error);
      if (result.ok) setForm(EMPTY(vocabulary));
    });
  }

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_18rem]">
      <div className="flex flex-col gap-9">
        {/* The importer fills this form; it never saves. The mapping is a
            judgement and some of it will be wrong, so it lands where an
            operator can correct it before anything is stored. */}
        <Group title={t.importTitle} hint={t.importHint}>
          <div className="flex flex-wrap gap-3">
            <input
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/user/repo"
              className={`${inputClass} max-w-[26rem] flex-1`}
            />
            <button
              type="button"
              disabled={pending || !repoUrl.trim()}
              onClick={runImport}
              className="rounded-full border border-line-strong px-5 py-2 text-caption text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-40"
            >
              {pending ? t.importing : t.importAction}
            </button>
          </div>

          <p className="mt-5 text-caption text-ink-muted">{t.importOr}</p>

          <label className="mt-3 inline-flex cursor-pointer items-center gap-3 rounded-full border border-dashed border-line-strong px-5 py-2.5 text-caption text-ink-soft transition-colors hover:border-ink hover:text-ink">
            <input
              type="file"
              multiple
              // Chromium and WebKit both take a whole folder this way. Firefox
              // ignores it and offers multi-select, which is the same job with
              // one more click rather than a dead control.
              {...({ webkitdirectory: '', directory: '' } as Record<string, string>)}
              className="sr-only"
              onChange={(event) => {
                runFileImport(event.target.files);
                event.target.value = '';
              }}
            />
            {t.importFiles}
          </label>

          <p className="mt-2 text-[0.72rem] text-ink-muted">{t.importFilesHint}</p>

          {unmapped.length > 0 ? (
            // Полоса сбоку заменена на тонкую рамку по кругу: двухпиксельный
            // цветной борт с одной стороны — самый узнаваемый штамп панелей,
            // собранных наспех, и он ничего не сообщает сверх заливки. Заливка
            // и так говорит, что это предупреждение.
            <div className="mt-5 rounded-[0.6rem] border border-accent/30 bg-accent/[0.06] px-4 py-3">
              <p className="text-caption text-ink">{t.unmapped}</p>
              <ul className="mt-2 space-y-1">
                {unmapped.map((item, index) => (
                  <li key={index} className="text-caption text-ink-muted">
                    — {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {rationale ? (
            <p className="mt-4 max-w-[60ch] text-caption text-ink-muted">{rationale}</p>
          ) : null}
        </Group>

        <Group title={t.identity}>
          <Field label={t.idLabel} hint={t.idHint}>
            <input
              value={form.id}
              onChange={(event) => set('id', event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              className={inputClass}
              placeholder="midnight-letter"
            />
          </Field>
        </Group>

        <Group title={t.look}>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label={t.palette}>
              <select
                value={form.paletteId}
                onChange={(event) => set('paletteId', event.target.value)}
                className={inputClass}
              >
                {vocabulary.palettes.map((palette) => (
                  <option key={palette.id} value={palette.id}>
                    {palette.name}
                  </option>
                ))}
              </select>
              <span className="mt-2 flex gap-1.5">
                {vocabulary.palettes
                  .find((palette) => palette.id === form.paletteId)
                  ?.swatches.map((swatch) => (
                    <span
                      key={swatch}
                      className="block h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                      style={{ background: swatch }}
                    />
                  ))}
              </span>
            </Field>

            <Field label={t.scene}>
              <select
                value={form.scene}
                onChange={(event) => set('scene', event.target.value)}
                className={inputClass}
              >
                {vocabulary.scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>
                    {scene.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t.motif}>
              <select
                value={form.motif}
                onChange={(event) => set('motif', event.target.value)}
                className={inputClass}
              >
                {vocabulary.motifs.map((motif) => (
                  <option key={motif.id} value={motif.id}>
                    {motif.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Group>

        <Group title={t.suits}>
          <Chips
            options={vocabulary.occasions}
            selected={form.occasions}
            onToggle={(id) => set('occasions', toggle(form.occasions, id))}
          />
          <p className="eyebrow mt-6 text-ink-muted">{t.moods}</p>
          <Chips
            options={vocabulary.moods}
            selected={form.moods}
            onToggle={(id) => set('moods', toggle(form.moods, id))}
          />
        </Group>

        <Group title={t.beats} hint={t.beatsHint}>
          <ul className="divide-y divide-line border-y border-line">
            {SECTION_KINDS.map((kind) => {
              const on = form.supportedSections.includes(kind);

              return (
                <li key={kind} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3">
                  <label className="flex min-w-[10rem] items-center gap-2.5 text-caption text-ink">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        set(
                          'supportedSections',
                          toggle(form.supportedSections, kind) as SectionKind[],
                        )
                      }
                      className="h-4 w-4 accent-[var(--color-accent)]"
                    />
                    <span title={kind}>{vocabulary.beats.find((beat) => beat.id === kind)?.label ?? kind}</span>
                  </label>

                  <select
                    value={form.sectionVariants[kind] ?? ''}
                    disabled={!on}
                    onChange={(event) =>
                      set('sectionVariants', {
                        ...form.sectionVariants,
                        [kind]: event.target.value || undefined,
                      })
                    }
                    className={`${inputClass} max-w-[12rem] disabled:opacity-40`}
                  >
                    <option value="">—</option>
                    {(vocabulary.beats.find((beat) => beat.id === kind)?.looks ?? []).map(
                      (look) => (
                        <option key={look.id} value={look.id}>
                          {look.label}
                        </option>
                      ),
                    )}
                  </select>
                </li>
              );
            })}
          </ul>
        </Group>

        <Group title={t.order} hint={t.orderHint}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t.orderMove}>
              <select
                value={form.reorder?.move ?? ''}
                onChange={(event) =>
                  set(
                    'reorder',
                    event.target.value
                      ? { move: event.target.value, before: form.reorder?.before ?? 'letter' }
                      : null,
                  )
                }
                className={inputClass}
              >
                <option value="">{t.orderNone}</option>
                {form.supportedSections.map((kind) => (
                  <option key={kind} value={kind}>
                    {vocabulary.beats.find((beat) => beat.id === kind)?.label ?? kind}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t.orderBefore}>
              <select
                value={form.reorder?.before ?? ''}
                disabled={!form.reorder}
                onChange={(event) =>
                  set(
                    'reorder',
                    form.reorder ? { ...form.reorder, before: event.target.value } : null,
                  )
                }
                className={`${inputClass} disabled:opacity-40`}
              >
                {form.supportedSections.map((kind) => (
                  <option key={kind} value={kind}>
                    {vocabulary.beats.find((beat) => beat.id === kind)?.label ?? kind}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Group>

        <Group title={t.copy} hint={t.copyHint}>
          <div className="grid gap-5">
            {(['name', 'tagline', 'animationStyle'] as const).map((key) => (
              <Field key={key} label={t[key]}>
                <input
                  value={form.strings.en[key]}
                  onChange={(event) =>
                    set('strings', {
                      en: { ...form.strings.en, [key]: event.target.value },
                    })
                  }
                  className={inputClass}
                />
              </Field>
            ))}
            <Field label={t.description}>
              <textarea
                rows={4}
                value={form.strings.en.description}
                onChange={(event) =>
                  set('strings', {
                    en: { ...form.strings.en, description: event.target.value },
                  })
                }
                className={`${inputClass} resize-none`}
              />
            </Field>
          </div>
        </Group>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-full bg-ink px-6 py-2.5 text-caption text-paper transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {pending ? t.saving : t.save}
          </button>
          {message ? (
            <p className={`text-caption ${failed ? 'text-accent-deep' : 'text-ink-muted'}`}>
              {message}
            </p>
          ) : null}
        </div>
      </div>

      <aside>
        <p className="eyebrow text-ink-muted">{t.existing}</p>
        {stored.length === 0 ? (
          <p className="mt-4 text-caption text-ink-muted">{t.none}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {stored.map((recipe) => (
              <li key={recipe.id} className="rounded-[0.75rem] border border-line bg-white/50 p-4">
                <p className="text-caption text-ink">{recipe.strings.en.name}</p>
                <code className="text-[0.7rem] text-ink-muted">{recipe.id}</code>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Link
                    href={`/templates/${recipe.id}`}
                    className="text-[0.72rem] text-ink-muted underline-offset-4 hover:text-ink hover:underline"
                  >
                    {t.preview}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(t.removeConfirm)) return;
                      startTransition(async () => {
                        await deleteTemplate(recipe.id);
                      });
                    }}
                    className="text-[0.72rem] text-ink-muted underline-offset-4 hover:text-accent-deep hover:underline"
                  >
                    {t.remove}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}

const inputClass =
  'w-full rounded-[0.5rem] border border-line-strong bg-white/60 px-3 py-2 text-caption text-ink outline-none transition-colors focus:border-ink focus:bg-white';

function Group({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="font-display text-title leading-none text-ink">{title}</h3>
      {hint ? <p className="mt-2 max-w-[52ch] text-caption text-ink-muted">{hint}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="eyebrow block text-ink-muted">{label}</span>
      <span className="mt-2 block">{children}</span>
      {hint ? <span className="mt-1.5 block text-[0.72rem] text-ink-muted">{hint}</span> : null}
    </label>
  );
}

function Chips({
  options,
  selected,
  onToggle,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            aria-pressed={on}
            className={`rounded-full border px-3.5 py-1.5 text-caption transition-colors ${
              on
                ? 'border-ink bg-ink text-paper'
                : 'border-line-strong text-ink-soft hover:border-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
