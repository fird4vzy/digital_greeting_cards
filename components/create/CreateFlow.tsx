'use client';

import { AnimatePresence } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Choice, StepProgress, StepShell } from './StepShell';
import { PhotoStep } from './PhotoStep';
import { PublishedCard } from './PublishedCard';
import { PhoneFrame } from '@/components/marketing/PhoneFrame';
import { TemplateStage } from '@/components/marketing/TemplateStage';
import { Button } from '@/components/ui/Button';
import type { Photo } from '@/lib/card/schema';
import { copyFor } from '@/lib/card/copy';
import type { Locale } from '@/lib/i18n/config';
import { t } from '@/lib/i18n';
import {
  localisedMoods,
  localisedOccasions,
  localisedRecipients,
  type LocalisedTemplate,
} from '@/lib/i18n/localise';
import type { Dictionary } from '@/lib/i18n/types';
import { getPalette } from '@/lib/design/palettes';
import { cn } from '@/lib/utils/cn';

/**
 * THE CREATION FLOW
 *
 * Eight questions, one screen each — a guided story rather than a builder.
 * The customer never sees a canvas, a layer panel or a font picker; they
 * answer questions a friend would ask, and the template engine turns the
 * answers into a card.
 *
 * All state lives in one `Draft` object, which is deliberately the same shape
 * the order API accepts, so publishing is a single POST with no translation
 * layer in between.
 */

const STEPS = [
  'recipient',
  'occasion',
  'mood',
  'story',
  'photos',
  'template',
  'brief',
  'preview',
  'publish',
] as const;

type Draft = {
  recipientId: string;
  recipientName: string;
  senderName: string;
  occasion: string;
  mood: string;
  story: string;
  photos: Photo[];
  templateId: string;
  /** Instructions for the shop. Never rendered into the card. */
  brief: string;
  /** How the shop reaches them. At least one is required to submit. */
  phone: string;
  email: string;
  /** The language the card is written in. Defaults to the browsing language,
   *  but they are genuinely independent choices — see the language step. */
  locale: string;
};

const EMPTY: Draft = {
  recipientId: '',
  recipientName: '',
  senderName: '',
  occasion: '',
  mood: '',
  story: '',
  photos: [],
  templateId: '',
  brief: '',
  phone: '',
  email: '',
  locale: '',
};

const STORAGE_KEY = 'mtab:draft:v1';

export function CreateFlow({
  templates,
  initialTemplate,
  locale,
  dict,
}: {
  templates: LocalisedTemplate[];
  initialTemplate?: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const copy = dict.ui.create;
  const recipients = localisedRecipients(dict);
  const occasions = localisedOccasions(dict);
  const moods = localisedMoods(dict);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [restored, setRestored] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState<{ code: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // A half-written card is someone's actual message. Losing it to a refresh or
  // a phone call would be unforgivable, so the draft is persisted locally.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setDraft({ ...EMPTY, ...(JSON.parse(saved) as Draft) });
    } catch {
      // Private mode or a corrupt entry — start clean rather than fail.
    }
    setDraft((current) => ({
      ...current,
      ...(initialTemplate ? { templateId: initialTemplate } : {}),
      // A restored draft keeps whatever language it was started in; a fresh
      // one inherits the language they are browsing in.
      locale: current.locale || locale,
    }));
    setRestored(true);
  }, [initialTemplate, locale]);

  useEffect(() => {
    if (!restored) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Storage full or blocked; the flow still works in memory.
    }
  }, [draft, restored]);

  const patch = useCallback((next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next })), []);
  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);
  const next = useCallback(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), []);

  /** Ranked locally with the same signals the AI planner uses. */
  const suggested = useMemo(() => {
    const scored = templates
      .map((template) => {
        let score = 0;
        if (template.occasions.includes(draft.occasion as never)) score += 5;
        if (template.moods.includes(draft.mood as never)) score += 3;
        if (draft.photos.length >= 5 && template.id === 'memories') score += 3;
        if (draft.photos.length === 0 && template.scene !== 'none') score += 1;
        return { template, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored[0]?.template ?? templates[0];
  }, [templates, draft.occasion, draft.mood, draft.photos.length]);

  const activeTemplate =
    templates.find((template) => template.id === draft.templateId) ?? suggested;

  const publish = useCallback(async () => {
    setPublishing(true);
    setError(null);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: draft.senderName || 'Someone',
            phone: draft.phone.trim() || undefined,
            email: draft.email.trim() || undefined,
          },
          recipient: { name: draft.recipientName || 'You', relationship: draft.recipientId || 'someone-special' },
          occasion: draft.occasion || 'just-because',
          mood: draft.mood || 'warm',
          locale: draft.locale || locale,
          message: draft.story,
          photos: draft.photos,
          moments: [],
          memories: [],
          wishes: [],
          templateId: activeTemplate?.id ?? 'romantic',
          brief: draft.brief.trim() || undefined,
          // The shop publishes, not the customer: a code only goes onto a tag
          // once a person has read the card through.
          publish: false,
        }),
      });

      const payload = (await response.json()) as { order?: { code: string }; error?: string };
      if (!response.ok || !payload.order) throw new Error(payload.error ?? 'Could not publish the card.');

      setPublished({
        code: payload.order.code,
        url: `${window.location.origin}/c/${payload.order.code}`,
      });
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong.');
    } finally {
      setPublishing(false);
    }
  }, [draft, activeTemplate]);

  if (published) {
    return (
      <PublishedCard
        code={published.code}
        url={published.url}
        recipient={draft.recipientName}
        strings={copy.done}
      />
    );
  }

  // Either channel will do; the API enforces the same rule server-side.
  const hasContact = Boolean(draft.phone.trim() || draft.email.trim());

  const cardLocale = draft.locale || locale;
  const cardCopy = copyFor(draft.occasion || 'just-because', cardLocale);

  const stage = activeTemplate ? (
    <PhoneFrame label={copy.steps.preview.eyebrow} className="max-w-[17rem]">
      <TemplateStage
        template={activeTemplate}
        locale={cardLocale}
        content={{
          name: draft.recipientName || '—',
          letter: draft.story.split(/\n\s*\n/)[0] || cardCopy.intro,
          final: cardCopy.finalHeadline,
          from: draft.senderName || '—',
          photos: draft.photos.slice(0, 3).map((photo) => photo.url),
        }}
      />
    </PhoneFrame>
  ) : null;

  return (
    <>
      <StepProgress index={step} total={STEPS.length} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <StepShell
            key="recipient"
            index={0}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.recipient.eyebrow}
            question={copy.steps.recipient.question}
            onNext={next}
            canContinue={Boolean(draft.recipientId && draft.recipientName.trim())}
          >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {recipients.map((recipient) => (
                <Choice
                  key={recipient.id}
                  title={recipient.label}
                  selected={draft.recipientId === recipient.id}
                  onSelect={() =>
                    patch({
                      recipientId: recipient.id,
                      occasion: draft.occasion || recipient.suggests[0],
                    })
                  }
                />
              ))}
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <Field
                label={copy.steps.recipient.theirName}
                value={draft.recipientName}
                onChange={(value) => patch({ recipientName: value })}
                placeholder="Alina"
                autoFocus
              />
              <Field
                label={copy.steps.recipient.yourName}
                value={draft.senderName}
                onChange={(value) => patch({ senderName: value })}
                placeholder="Firdavs"
              />
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell
            key="occasion"
            index={1}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.occasion.eyebrow}
            question={copy.steps.occasion.question}
            hint={copy.steps.occasion.hint}
            onBack={back}
            onNext={next}
            canContinue={Boolean(draft.occasion)}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {occasions.map((occasion) => (
                <Choice
                  key={occasion.id}
                  title={occasion.label}
                  line={occasion.line}
                  selected={draft.occasion === occasion.id}
                  onSelect={() => patch({ occasion: occasion.id })}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell
            key="mood"
            index={2}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.mood.eyebrow}
            question={copy.steps.mood.question}
            onBack={back}
            onNext={next}
            canContinue={Boolean(draft.mood)}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {moods.map((mood) => (
                <Choice
                  key={mood.id}
                  title={mood.label}
                  line={mood.line}
                  selected={draft.mood === mood.id}
                  onSelect={() => patch({ mood: mood.id })}
                />
              ))}
            </div>
          </StepShell>
        )}

        {step === 3 && (
          <StepShell
            key="story"
            index={3}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.story.eyebrow}
            question={copy.steps.story.question}
            hint={copy.steps.story.hint}
            onBack={back}
            onNext={next}
            canContinue
            skip={{ label: copy.steps.story.needHelp, onSkip: next }}
          >
            <label className="block">
              <span className="sr-only">{copy.steps.story.question}</span>
              <textarea
                value={draft.story}
                onChange={(event) => patch({ story: event.target.value })}
                rows={10}
                autoFocus
                placeholder={copy.steps.story.placeholder}
                className="w-full resize-none rounded-[1rem] border border-line-strong bg-white/60 p-6 font-sans text-body leading-[1.8] text-ink outline-none transition-colors duration-400 placeholder:text-ink-faint focus:border-ink focus:bg-white"
              />
            </label>
            <p className="mt-3 text-caption text-ink-faint">
              {draft.story.trim().length > 0
                ? t(copy.steps.story.wordCount, { count: draft.story.trim().split(/\s+/).length })
                : copy.steps.story.emptyHint}
            </p>
          </StepShell>
        )}

        {step === 4 && (
          <StepShell
            key="photos"
            index={4}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.photos.eyebrow}
            question={copy.steps.photos.question}
            hint={copy.steps.photos.hint}
            onBack={back}
            onNext={next}
            canContinue
            skip={{ label: copy.steps.photos.skip, onSkip: () => { patch({ photos: [] }); next(); } }}
          >
            <PhotoStep
              photos={draft.photos}
              onChange={(photos) => patch({ photos })}
              strings={copy.steps.photos}
            />
          </StepShell>
        )}

        {step === 5 && (
          <StepShell
            key="template"
            index={5}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.template.eyebrow}
            question={copy.steps.template.question}
            hint={suggested ? t(copy.steps.template.hint, { name: suggested.name }) : undefined}
            onBack={back}
            onNext={next}
            canContinue
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {templates.map((template) => {
                const palette = getPalette(template.paletteId);
                const selected = activeTemplate?.id === template.id;

                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => patch({ templateId: template.id })}
                    aria-pressed={selected}
                    className={cn(
                      'rounded-[1rem] border p-5 text-left transition-all duration-500 ease-[var(--ease-out-expo)]',
                      selected
                        ? 'border-ink bg-ink text-paper shadow-[var(--shadow-float)]'
                        : 'border-line-strong bg-white/50 hover:border-ink hover:bg-white',
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-display text-[1.3rem] leading-none">{template.name}</span>
                      <span className="flex gap-1">
                        {palette.swatches.map((swatch) => (
                          <span
                            key={swatch}
                            className="block h-2.5 w-2.5 rounded-full ring-1 ring-inset ring-black/10"
                            style={{ background: swatch }}
                          />
                        ))}
                      </span>
                    </div>
                    <span
                      className={cn(
                        'mt-2.5 block text-caption leading-snug',
                        selected ? 'text-paper/60' : 'text-ink-muted',
                      )}
                    >
                      {template.tagline}
                    </span>
                    {suggested?.id === template.id ? (
                      <span
                        className={cn(
                          'eyebrow mt-3 block',
                          selected ? 'text-paper/50' : 'text-accent',
                        )}
                      >
                        {copy.steps.template.suggested}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </StepShell>
        )}

        {step === 6 && (
          <StepShell
            key="brief"
            index={6}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.brief.eyebrow}
            question={copy.steps.brief.question}
            hint={copy.steps.brief.hint}
            onBack={back}
            onNext={next}
            canContinue
            skip={{ label: copy.steps.brief.skip, onSkip: next }}
          >
            <label className="block">
              <span className="sr-only">{copy.steps.brief.question}</span>
              <textarea
                value={draft.brief}
                onChange={(event) => patch({ brief: event.target.value })}
                rows={6}
                autoFocus
                placeholder={copy.steps.brief.placeholder}
                className="w-full resize-none rounded-[1rem] border border-line-strong bg-white/60 p-6 font-sans text-body leading-[1.8] text-ink outline-none transition-colors duration-400 placeholder:text-ink-faint focus:border-ink focus:bg-white"
              />
            </label>
          </StepShell>
        )}

        {step === 7 && (
          <StepShell
            key="preview"
            index={7}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.preview.eyebrow}
            question={copy.steps.preview.question}
            hint={copy.steps.preview.hint}
            onBack={back}
            onNext={next}
            nextLabel={copy.steps.preview.looksRight}
            canContinue
          >
            <div className="flex flex-col items-center gap-8">
              {stage}
              <dl className="w-full max-w-[26rem] space-y-2.5 text-caption">
                <Summary label={copy.steps.preview.for}>{draft.recipientName || '—'}</Summary>
                <Summary label={copy.steps.preview.from}>{draft.senderName || '—'}</Summary>
                <Summary label={copy.steps.preview.template}>{activeTemplate?.name ?? '—'}</Summary>
                <Summary label={copy.steps.preview.photos}>{draft.photos.length || copy.steps.preview.none}</Summary>
              </dl>
            </div>
          </StepShell>
        )}

        {step === 8 && (
          <StepShell
            key="publish"
            index={8}
            total={STEPS.length}
            strings={{ back: copy.back, continue: copy.continue, progress: copy.progress }}
            eyebrow={copy.steps.publish.eyebrow}
            question={copy.steps.publish.question}
            hint={copy.steps.publish.hint}
            onBack={back}
          >
            <div className="rounded-[1.25rem] border border-line-strong bg-white/60 p-7">
              <p className="text-body text-ink-soft">
                {t(copy.steps.publish.explain, { name: draft.recipientName || '—' })}
              </p>

              {/* Contact lives on the submit screen rather than in a step of
                  its own: it is the one thing asked for the shop's benefit
                  instead of the card's, and a ninth question for two optional
                  fields would be a step too many. */}
              <div className="mt-7 border-t border-line pt-7">
                <p className="text-caption text-ink-muted">{copy.steps.contact.hint}</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label={copy.steps.contact.phone}
                    value={draft.phone}
                    onChange={(phone) => patch({ phone })}
                  />
                  <Field
                    label={copy.steps.contact.email}
                    value={draft.email}
                    onChange={(email) => patch({ email })}
                  />
                </div>

                {!hasContact ? (
                  <p className="mt-4 text-caption text-ink-faint">{copy.steps.contact.required}</p>
                ) : null}
              </div>

              {error ? (
                <p className="mt-5 rounded-[0.6rem] bg-accent/10 px-4 py-3 text-caption text-accent-deep">
                  {error}
                </p>
              ) : null}

              <Button
                onClick={publish}
                disabled={publishing || !hasContact}
                size="lg"
                className="mt-7 w-full sm:w-auto"
              >
                {publishing ? copy.steps.publish.working : copy.steps.publish.action}
              </Button>
            </div>
          </StepShell>
        )}
      </AnimatePresence>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="eyebrow mb-3 block text-ink-muted">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full border-b border-line-strong bg-transparent pb-3 font-display text-title text-ink outline-none transition-colors duration-400 placeholder:text-ink-faint focus:border-ink"
      />
    </label>
  );
}

function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
      <dt className="eyebrow text-ink-faint">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
