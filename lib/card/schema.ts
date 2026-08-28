import { z } from 'zod';

/**
 * THE CONTRACT
 * ============
 * A published card is data, never markup. This file is the only definition of
 * what that data may contain — the creation flow writes it, the database
 * stores it, the renderer reads it, and the future AI layer is constrained to
 * emitting exactly this shape.
 *
 * Adding a new kind of storytelling beat = adding one member to
 * `cardSectionSchema` plus one component in `components/cards/sections`.
 * Nothing else in the application needs to change.
 */

/**
 * Предел длины ссылки на изображение.
 *
 * Фотографии приезжают как `data:`-URL: `lib/utils/image.ts` ужимает их до
 * ~600 КБ в base64, и восемьсот тысяч знаков — потолок с запасом, а не
 * рабочий размер. Без потолка `url` был `z.string()` — любая строка любой
 * длины, — и тридцать таких строк по десять мегабайт проходили проверку.
 * Спасал только лимит тела запроса у Vercel в 4,5 МБ, то есть чужая
 * настройка, которой на своём хостинге не будет.
 */
const MAX_IMAGE_URL = 800_000;

/**
 * Схема источника изображения: только картинка и только оттуда, откуда ждём.
 *
 * `z.string()` пропускал `javascript:` и `data:text/html`. Отрисовщик
 * подставляет это в `src`, и хотя браузер картинкой такое не покажет, класть
 * в базу заказа непроверенный URL с чужой схемой незачем.
 *
 * `svg+xml` в списке есть, и это не оплошность: заглушки рисует
 * `lib/utils/placeholder.ts`, они и есть SVG. Опасны такие данные там, где
 * документ исполняется, — во фрейме или объекте; `CardPhoto` рисует их через
 * `<img>`, а в нём браузер не выполняет скрипты и не ходит за внешними
 * ресурсами. Если картинка когда-нибудь начнёт показываться иначе, эту
 * строчку надо пересмотреть первой.
 */
const imageUrl = z
  .string()
  .max(MAX_IMAGE_URL)
  .refine(
    (value) =>
      /^data:image\/(jpeg|png|webp|gif|avif|svg\+xml)[;,]/.test(value) ||
      /^https:\/\//.test(value) ||
      value.startsWith('/'),
    'Unsupported image source',
  );

export const photoSchema = z.object({
  id: z.string(),
  url: imageUrl,
  alt: z.string().optional(),
  caption: z.string().optional(),
  /** Intrinsic size, when known, so the renderer can reserve space (no CLS). */
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  /** object-position for art-directed crops, e.g. "50% 30%". */
  focal: z.string().optional(),
});

export type Photo = z.infer<typeof photoSchema>;

/** Fields every section shares. `variant` lets a template restyle a section
 *  without forking the component. */
const sectionBase = {
  id: z.string(),
  variant: z.string().optional(),
};

/**
 * A video the customer recorded.
 *
 * **A URL, not a data URL.** Photographs are inlined into the order record
 * today — the README lists that as a known gap — and the same trick is simply
 * not available here: base64 inflates by a third, so a nine-megabyte clip
 * becomes a twelve-megabyte database row. This field is the point at which
 * object storage stops being optional, and saying so in the type is more
 * honest than pretending otherwise.
 *
 * `poster` is not decoration. Nothing about the clip is fetched until the
 * recipient reaches it, so the poster is what they see until then — see
 * `VideoSection`.
 */
export const videoSchema = z.object({
  id: z.string(),
  url: z.string(),
  /** Still shown before playback. Without one the beat is a blank rectangle. */
  poster: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  /** Intrinsic size, when known, so the renderer can reserve space (no CLS). */
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export type CardVideo = z.infer<typeof videoSchema>;

export const SECTION_KINDS = [
  'cover',
  'envelope',
  'intro',
  'letter',
  'video',
  'gallery',
  'timeline',
  'memories',
  'quote',
  'wishes',
  'question',
  'cake',
  'final',
  'closing',
] as const;

export type SectionKind = (typeof SECTION_KINDS)[number];

/** Screen one. The name, and the promise that something is waiting. */
export const coverSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('cover'),
  recipientName: z.string(),
  headline: z.string(),
  subline: z.string().optional(),
  hint: z.string().optional(),
  /**
   * A clip behind the title, for covers that want one.
   *
   * The same video the order carries. A template plays it *either* here as a
   * background *or* as its own beat, never both — declaring the `video` beat is
   * what chooses the second. The field is always populated; the variant decides
   * whether anything looks at it.
   */
  video: videoSchema.optional(),
});

/** The gate: nothing is revealed until they open it. */
export const envelopeSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('envelope'),
  prompt: z.string().optional(),
  seal: z.string().optional(),
  note: z.string().optional(),
});

export const introSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('intro'),
  eyebrow: z.string().optional(),
  text: z.string(),
});

export const letterSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('letter'),
  salutation: z.string().optional(),
  /** Blank-line separated paragraphs. Rendered one at a time as you scroll. */
  body: z.string(),
  signature: z.string().optional(),
});

/** A recording, played where a letter would otherwise carry the weight. */
export const videoSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('video'),
  title: z.string().optional(),
  video: videoSchema,
});

export const gallerySectionSchema = z.object({
  ...sectionBase,
  type: z.literal('gallery'),
  title: z.string().optional(),
  caption: z.string().optional(),
  photos: z.array(photoSchema).default([]),
});

export const timelineEntrySchema = z.object({
  id: z.string(),
  date: z.string(),
  title: z.string(),
  text: z.string().optional(),
  photo: photoSchema.optional(),
});

export const timelineSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('timeline'),
  title: z.string().optional(),
  entries: z.array(timelineEntrySchema).default([]),
});

export const memoriesSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('memories'),
  title: z.string().optional(),
  items: z
    .array(z.object({ id: z.string(), label: z.string(), text: z.string() }))
    .default([]),
});

export const quoteSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('quote'),
  text: z.string(),
  attribution: z.string().optional(),
});

export const wishesSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('wishes'),
  title: z.string().optional(),
  items: z.array(z.string()).default([]),
});

/**
 * A question with two answers, one of which does not want to be pressed.
 *
 * The only beat that asks the reader for something rather than telling them.
 * Its text is structural — it belongs to the template, not to the order — so
 * it comes from the dictionaries at compose time like every other built-in
 * line, and a card written in Russian keeps asking in Russian.
 */
export const questionSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('question'),
  question: z.string(),
  yes: z.string(),
  no: z.string(),
  /** Shown once they say yes. There is no path where they say no. */
  reply: z.string(),
});

/**
 * A cake with candles that are still lit.
 *
 * The one beat with something to *do* rather than something to read, and the
 * reason its original existed at all: everything before it was the run-up to
 * blowing these out. Like the question beat its copy is structural, so it
 * comes from the dictionaries at compose time.
 */
export const cakeSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('cake'),
  prompt: z.string(),
  hint: z.string(),
  /** Shown once they are out. */
  reply: z.string(),
  /** Kept small: past about seven they stop reading as candles. */
  candles: z.number().int().min(1).max(7).default(5),
});

export const finalSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('final'),
  headline: z.string(),
  text: z.string().optional(),
});

export const closingSectionSchema = z.object({
  ...sectionBase,
  type: z.literal('closing'),
  signOff: z.string(),
  from: z.string(),
  note: z.string().optional(),
});

export const cardSectionSchema = z.discriminatedUnion('type', [
  coverSectionSchema,
  envelopeSectionSchema,
  introSectionSchema,
  letterSectionSchema,
  videoSectionSchema,
  gallerySectionSchema,
  timelineSectionSchema,
  memoriesSectionSchema,
  quoteSectionSchema,
  wishesSectionSchema,
  questionSectionSchema,
  cakeSectionSchema,
  finalSectionSchema,
  closingSectionSchema,
]);

export type CardSection = z.infer<typeof cardSectionSchema>;
export type SectionOfKind<K extends SectionKind> = Extract<CardSection, { type: K }>;

/**
 * Music for the whole card, not for one beat.
 *
 * Deliberately not a section: it has no place in the arc, it does not end, and
 * it is playing while the reader is somewhere else on the page. A beat that
 * behaves like that is not a beat, it is a property of the card — the same
 * reason the progress rail lives in the renderer rather than in a section.
 *
 * **Never autoplays.** A card is opened next to a bouquet, often in a shop or
 * an office, and sound that starts by itself is the one thing that can make a
 * gift embarrassing. Browsers would block it anyway; this refuses on purpose
 * rather than by accident.
 */
export const cardAudioSchema = z.object({
  url: z.string(),
  /** Shown beside the control. The track's name, not a description. */
  title: z.string().optional(),
});

export type CardAudio = z.infer<typeof cardAudioSchema>;

export const CARD_CONFIG_VERSION = 1;

export const cardConfigSchema = z.object({
  version: z.number().int().default(CARD_CONFIG_VERSION),
  templateId: z.string(),
  /** Optional palette override — lets one template ship several colourways. */
  paletteId: z.string().optional(),
  recipient: z.object({
    name: z.string(),
    relationship: z.string().optional(),
  }),
  sender: z.object({
    name: z.string(),
  }),
  occasion: z.string(),
  mood: z.string(),
  /** Free-form language tag; reserved for localisation of built-in copy. */
  locale: z.string().default('en'),
  /** Optional music, played only when the reader asks for it. */
  audio: cardAudioSchema.optional(),
  sections: z.array(cardSectionSchema).min(1),
});

export type CardConfig = z.infer<typeof cardConfigSchema>;

/**
 * Parse untrusted config (database row, API body, AI output) into a safe
 * `CardConfig`. Returns a discriminated result so callers can render a proper
 * error state instead of throwing inside a React tree.
 */
export function parseCardConfig(
  input: unknown,
): { ok: true; config: CardConfig } | { ok: false; error: string } {
  const result = cardConfigSchema.safeParse(input);
  if (result.success) return { ok: true, config: result.data };

  const first = result.error.issues[0];
  const path = first?.path.join('.') || 'config';
  return { ok: false, error: `${path}: ${first?.message ?? 'invalid card configuration'}` };
}

/** Splits a letter body into paragraphs for staggered reveal. */
export function paragraphs(body: string): string[] {
  return body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
