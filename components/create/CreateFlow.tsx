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
import type { CardWish } from '@/lib/db/types';
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
 * Nine screens, one question each — a guided story rather than a builder.
 * The customer never sees a canvas, a layer panel or a font picker; they
 * answer questions a friend would ask, and the template engine turns the
 * answers into a card.
 *
 * `STEPS.length` is the count the customer is shown ("Step 3 of 9"), so any
 * prose that names a number — the `/create` meta description, the shops FAQ —
 * has to move with it. It was eight until `brief` arrived with the concierge
 * flow, and three strings were left behind saying so.
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
  /**
   * Настроений можно выбрать несколько.
   *
   * Список, а не одно значение, потому что открытка редко бывает одного тона:
   * «смешно и тепло» — обычный заказ, и раньше выбор второго молча отменял
   * первый. Первый элемент — главный: он уходит в `mood` и по нему движок
   * собирает открытку.
   */
  moods: string[];
  story: string;
  photos: Photo[];
  templateId: string;
  /**
   * ЧЕГО ЗАКАЗЧИК ХОЧЕТ ВМЕСТО ШАБЛОНА — тремя полями, а не одним союзом.
   *
   * Союз `CardWish` здесь хранить нельзя, и это выяснилось проверкой: человек
   * пишет свою идею, из любопытства открывает вкладку с работами, возвращается
   * — а текста нет, потому что переключение вкладки его перезаписало. Свои
   * слова терять нельзя ровно так же, как текст открытки, ради которого
   * черновик и пишется в localStorage.
   *
   * Поэтому путь и оба ответа живут порознь и переживают любое переключение,
   * а `CardWish` собирается один раз, при отправке. Все три поля попадают в
   * localStorage вместе, так что расходиться им негде.
   */
  wishRoute: WishRoute;
  /** Своя идея словами. Хранится, даже когда открыт другой путь. */
  wishText: string;
  /** Выбранная работа. Хранится так же. */
  wishWorkId: string;
  /** Instructions for the shop. Never rendered into the card. */
  brief: string;
  /** How the shop reaches them. At least one is required to submit. */
  phone: string;
  /**
   * Телеграм заказчика.
   *
   * Заменил почту 28 августа: в Узбекистане связываются в телеграме, а почту
   * не читают — поле стояло вторым и оставалось пустым. `email` из черновика
   * убран совсем, но в заказе и в админке остался: старые заказы с почтой
   * никуда не делись, и терять контакт живого клиента ради чистоты нельзя.
   */
  telegram: string;
  /** The language the card is written in.
   *
   *  Stored on the card and therefore independent of the reader's language by
   *  construction — a Russian card stays Russian on an English phone. But
   *  **nothing asks for it**: there is no language step, so it is always the
   *  language the customer happened to be browsing in. That is right often
   *  enough to ship and wrong for the person buying in Russian for an Uzbek
   *  grandmother. Adding the step is the only change needed; the field, the
   *  API and the renderer already carry it. */
  locale: string;
};

const EMPTY: Draft = {
  recipientId: '',
  recipientName: '',
  senderName: '',
  occasion: '',
  moods: [],
  story: '',
  photos: [],
  templateId: '',
  wishRoute: 'template',
  wishText: '',
  wishWorkId: '',
  brief: '',
  phone: '',
  telegram: '',
  locale: '',
};

const STORAGE_KEY = 'mtab:draft:v1';
const REQUEST_KEY = 'mtab:draft:request:v1';

/**
 * Идентификатор этой отправки — один на черновик, а не на нажатие.
 *
 * Двойное нажатие на медленной связи создавало два заказа, два кода и два
 * сообщения в рабочую группу: заказчик платил один раз, магазин видел работу
 * на два букета. Флага `publishing` ниже для этого мало — он не переживает
 * ни перезагрузку страницы на полпути, ни повтор запроса самим браузером.
 *
 * Поэтому идентификатор кладётся в localStorage рядом с черновиком: вторая
 * попытка присылает тот же, и сервер возвращает уже созданный заказ. Стирается
 * вместе с черновиком, когда открытка создана.
 */
function requestId(): string {
  try {
    const saved = window.localStorage.getItem(REQUEST_KEY);
    if (saved) return saved;

    const fresh = crypto.randomUUID();
    window.localStorage.setItem(REQUEST_KEY, fresh);
    return fresh;
  } catch {
    // Приватный режим или заблокированное хранилище: защиты от повтора не
    // будет, но заказ должен пройти — это важнее.
    return crypto.randomUUID();
  }
}

/** Три пути на шаге выбора. Порядок — порядок кнопок. */
const ROUTES = ['template', 'own', 'work'] as const;
type WishRoute = (typeof ROUTES)[number];

/** Работа в списке «как ваша работа» — только то, что показывает форма. */
export type WorkChoice = { id: string; title: string; year: string; cover: string };

export function CreateFlow({
  templates,
  works,
  initialTemplate,
  locale,
  dict,
}: {
  templates: LocalisedTemplate[];
  works: WorkChoice[];
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
        // Каждое совпадение считается отдельно: шаблон, попавший в два
        // выбранных настроения, должен обойти попавший в одно.
        score += draft.moods.filter((mood) => template.moods.includes(mood as never)).length * 3;
        if (draft.photos.length >= 5 && template.id === 'memories') score += 3;
        if (draft.photos.length === 0 && template.scene !== 'none') score += 1;
        return { template, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored[0]?.template ?? templates[0];
  }, [templates, draft.occasion, draft.moods, draft.photos.length]);

  const activeTemplate =
    templates.find((template) => template.id === draft.templateId) ?? suggested;

  const route = draft.wishRoute;

  /**
   * Желание в том виде, в каком его ждёт заказ, — собирается из трёх полей.
   *
   * Пустая своя идея и невыбранная работа дают `null`: заказ, где написано
   * «заказчик не хотел шаблон», но не сказано чего он хотел, хуже обычного —
   * оператор прочитает его как загадку. Пустое — значит шаблон, как раньше.
   */
  const wish: CardWish | null =
    route === 'own' && draft.wishText.trim()
      ? { kind: 'own', text: draft.wishText.trim() }
      : route === 'work' && draft.wishWorkId
        ? { kind: 'work', workId: draft.wishWorkId }
        : null;

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
            telegram: draft.telegram.trim() || undefined,
          },
          recipient: { name: draft.recipientName || 'You', relationship: draft.recipientId || 'someone-special' },
          occasion: draft.occasion || 'just-because',
          mood: draft.moods[0] ?? 'warm',
          moods: draft.moods.length > 0 ? draft.moods : ['warm'],
          locale: draft.locale || locale,
          message: draft.story,
          photos: draft.photos,
          moments: [],
          memories: [],
          wishes: [],
          templateId: activeTemplate?.id ?? 'romantic',
          // Черновик всё равно собирается шаблоном — иначе по коду не было бы
          // ничего, а бирку печатают заранее. Желание едет рядом как
          // инструкция магазину, а не как отмена сборки.
          wish,
          brief: draft.brief.trim() || undefined,
          requestId: requestId(),
          // Публикует магазин, а не заказчик: код попадает на бирку только
          // после того, как человек прочитал открытку целиком. Раньше здесь
          // ехало `publish: false` — и это была просьба, а не правило: сервер
          // принимал и `true`. Теперь поля нет ни здесь, ни в контракте.
        }),
      });

      const payload = (await response.json()) as { order?: { code: string }; error?: string };
      if (!response.ok || !payload.order) throw new Error(payload.error ?? 'Could not publish the card.');

      setPublished({
        code: payload.order.code,
        url: `${window.location.origin}/c/${payload.order.code}`,
      });
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(REQUEST_KEY);
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
        // Куда придёт ответ. Показываем то, что он сам оставил, — иначе
        // «напишем вам» звучит обещанием без адреса.
        contact={draft.telegram.trim() || draft.phone.trim()}
        strings={copy.done}
      />
    );
  }

  // Either channel will do; the API enforces the same rule server-side.
  const hasContact = Boolean(draft.phone.trim() || draft.telegram.trim());

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
            hint={copy.steps.mood.hint}
            onBack={back}
            onNext={next}
            canContinue={draft.moods.length > 0}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {moods.map((mood) => (
                <Choice
                  key={mood.id}
                  title={mood.label}
                  line={mood.line}
                  selected={draft.moods.includes(mood.id)}
                  onSelect={() =>
                    patch({
                      moods: draft.moods.includes(mood.id)
                        ? draft.moods.filter((id) => id !== mood.id)
                        : [...draft.moods, mood.id],
                    })
                  }
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
                className="w-full resize-none rounded-[1rem] border border-line-strong bg-white/60 p-6 font-sans text-body leading-[1.8] text-ink outline-none transition-colors duration-400 placeholder:text-ink-muted focus:border-ink focus:bg-white"
              />
            </label>
            <p className="mt-3 text-caption text-ink-muted">
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
            hint={
              route === 'template' && suggested
                ? t(copy.steps.template.hint, { name: suggested.name })
                : route === 'own'
                  ? copy.steps.template.ownHint
                  : copy.steps.template.workHint
            }
            onBack={back}
            onNext={next}
            canContinue
            // Пропуск остаётся только у шаблонов: у своей идеи и у работы
            // пропускать нечего, а «пусть подберут» рядом с уже написанной
            // своей идеей читалось бы как отмена написанного.
            skip={
              route === 'template'
                ? {
                    label: copy.steps.template.skip,
                    onSkip: () => {
                      patch({ templateId: '' });
                      next();
                    },
                  }
                : undefined
            }
          >
            {/*
              ТРИ ПУТИ, А НЕ ОДИН С ПРОПУСКОМ.

              Раньше шаблон был обязательным по сути: пропустить его формально
              можно было, но что-то шаблонное показывалось всё равно, и в
              магазин заказ приезжал без следа того, что заказчик шаблон не
              хотел. Два настоящих случая не имели куда записаться — «у меня
              своя идея» и «хочу как вот эта ваша работа», — а второй ещё и
              самый ценный: человек посмотрел «Наши работы» и захотел такое же.

              Путь виден по самому желанию, отдельного состояния нет: иначе
              восстановленный из localStorage черновик показывал бы шаблоны, а
              отправлял свою идею.
            */}
            <div className="flex flex-wrap gap-2">
              {ROUTES.map((option) => (
                <button
                  key={option}
                  type="button"
                  // Переключение пути не трогает ответы: написанное на одной
                  // вкладке ждёт возвращения, а не исчезает.
                  onClick={() => patch({ wishRoute: option })}
                  aria-pressed={route === option}
                  className={cn(
                    'inline-flex h-9 items-center rounded-full border px-4 text-caption transition-colors duration-400',
                    route === option
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line-strong text-ink-soft hover:border-ink hover:text-ink',
                  )}
                >
                  {copy.steps.template.routes[option]}
                </button>
              ))}
            </div>

            {route === 'template' ? (
              /* The miniature moved here from the step after next.

                 It was already being built for the preview step, so the
                 customer chose a template from a name, a line and four dots and
                 only saw the consequence two steps later. The same stage plays
                 their own words in the template they are pointing at, and
                 changes the moment they point at another one — which is the
                 only question this step asks. */
              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-start">
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
                          <span className="text-[1.0625rem] font-medium leading-snug tracking-[-0.01em]">
                            {template.name}
                          </span>
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
                            'mt-2 block text-[0.875rem] leading-[1.55]',
                            selected ? 'text-paper/70' : 'text-ink-muted',
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

                {stage ? <div className="hidden lg:block">{stage}</div> : null}
              </div>
            ) : null}

            {route === 'own' ? (
              <textarea
                value={draft.wishText}
                onChange={(event) => patch({ wishText: event.target.value })}
                rows={7}
                maxLength={4000}
                placeholder={copy.steps.template.ownPlaceholder}
                className="mt-8 w-full resize-none rounded-[1rem] border border-line-strong bg-white/60 p-5 text-body leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink"
              />
            ) : null}

            {route === 'work' ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {works.map((work) => {
                  const selected = draft.wishWorkId === work.id;

                  return (
                    <button
                      key={work.id}
                      type="button"
                      onClick={() => patch({ wishWorkId: work.id })}
                      aria-pressed={selected}
                      className={cn(
                        'overflow-hidden rounded-[1rem] border text-left transition-all duration-500 ease-[var(--ease-out-expo)]',
                        selected
                          ? 'border-ink bg-ink text-paper shadow-[var(--shadow-float)]'
                          : 'border-line-strong bg-white/50 hover:border-ink hover:bg-white',
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={work.cover}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="block aspect-[16/9] w-full object-cover"
                      />
                      <span className="flex items-baseline justify-between gap-3 p-4">
                        <span className="text-[1.0625rem] font-medium leading-snug tracking-[-0.01em]">
                          {work.title}
                        </span>
                        <span
                          className={cn('text-caption', selected ? 'text-paper/50' : 'text-ink-muted')}
                        >
                          {work.year}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
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
                className="w-full resize-none rounded-[1rem] border border-line-strong bg-white/60 p-6 font-sans text-body leading-[1.8] text-ink outline-none transition-colors duration-400 placeholder:text-ink-muted focus:border-ink focus:bg-white"
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
            hint={wish ? copy.steps.preview.wishHint : copy.steps.preview.hint}
            onBack={back}
            onNext={next}
            nextLabel={copy.steps.preview.looksRight}
            canContinue
          >
            {/*
              ЧЕЛОВЕКУ, НЕ ВЫБИРАВШЕМУ ШАБЛОН, ШАБЛОН НЕ ПОКАЗЫВАЕМ.

              Миниатюра показывает конкретный шаблон, и на предыдущем шаге он
              был выбран — либо подобран, если заказчик согласился. Но если
              заказчик описал свою идею или показал на нашу работу, то
              миниатюра показывает не его открытку, а ту, которую он только что
              отклонил. Это сбивает: экран называется «вот она», а «она» —
              чужая. Вместо неё пересказываем его собственный ответ.
            */}
            <div className="flex flex-col items-center gap-8">
              {wish ? (
                <div className="w-full max-w-[26rem] rounded-[1rem] border border-accent/30 bg-accent/[0.04] p-6">
                  <p className="eyebrow text-ink-muted">{copy.steps.preview.wishTitle}</p>
                  {wish.kind === 'work' ? (
                    <p className="mt-3 text-body leading-relaxed text-ink-soft">
                      {t(copy.steps.preview.wishWork, {
                        title: works.find((work) => work.id === wish.workId)?.title ?? wish.workId,
                      })}
                    </p>
                  ) : (
                    <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-ink-soft">
                      {wish.text}
                    </p>
                  )}
                </div>
              ) : (
                stage
              )}
              <dl className="w-full max-w-[26rem] space-y-2.5 text-caption">
                <Summary label={copy.steps.preview.for}>{draft.recipientName || '—'}</Summary>
                <Summary label={copy.steps.preview.from}>{draft.senderName || '—'}</Summary>
                {/* Строку про шаблон показываем только когда шаблон и правда
                    выбран: иначе она называет тот, который заказчик отклонил. */}
                {wish ? null : (
                  <Summary label={copy.steps.preview.template}>{activeTemplate?.name ?? '—'}</Summary>
                )}
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
                  instead of the card's, and a whole step for two optional
                  fields would be one too many. */}
              <div className="mt-7 border-t border-line pt-7">
                <p className="text-caption text-ink-muted">{copy.steps.contact.hint}</p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Field
                    label={copy.steps.contact.phone}
                    value={draft.phone}
                    onChange={(phone) => patch({ phone })}
                  />
                  <Field
                    label={copy.steps.contact.telegram}
                    value={draft.telegram}
                    onChange={(telegram) => patch({ telegram })}
                    placeholder={copy.steps.contact.telegramHint}
                  />
                </div>

                {!hasContact ? (
                  <p className="mt-4 text-caption text-ink-muted">{copy.steps.contact.required}</p>
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
        className="w-full border-b border-line-strong bg-transparent pb-3 font-display text-title text-ink outline-none transition-colors duration-400 placeholder:text-ink-muted focus:border-ink"
      />
    </label>
  );
}

function Summary({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line pb-2.5">
      <dt className="eyebrow text-ink-muted">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}
