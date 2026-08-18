import { getPalette, photoColors } from '@/lib/design/palettes';
import { getDictionary } from '@/lib/i18n';
import { demoPhotos } from '@/lib/utils/placeholder';
import { resolveTemplate } from '@/templates';
import { composeConfig } from './service';
import type { CardConfig } from './schema';
import type { StoryInput } from './template';

/**
 * Demo stories, one per template.
 *
 * The gallery, the live previews and the template pages all read from here, so
 * a template always demonstrates itself with content that suits it — a
 * timeline-led template gets dates, a photograph-led one gets photographs.
 * Every preview is composed through the real engine, so what a customer sees
 * in the gallery is exactly what the renderer will produce.
 *
 * **The seed holds structure, the dictionary holds words.** What relationship
 * and mood a story demonstrates and how many photographs it needs are facts
 * about the demo and stay here; every sentence of it lives in
 * `content.demo` of each dictionary. Same division as the taxonomy and the
 * template registry — and the same reason: a preview that reads in English to
 * a Russian visitor is the same bug as a dashboard printing a raw identifier.
 */

type DemoSeed = {
  relationship: string;
  occasion: string;
  mood: string;
  photoCount: number;
};

const SEEDS: Record<string, DemoSeed> = {
  romantic: { relationship: 'girlfriend', occasion: 'love', mood: 'romantic', photoCount: 4 },
  birthday: { relationship: 'friend', occasion: 'birthday', mood: 'warm', photoCount: 4 },
  mom: { relationship: 'mom', occasion: 'for-mom', mood: 'warm', photoCount: 3 },
  anniversary: { relationship: 'husband', occasion: 'anniversary', mood: 'elegant', photoCount: 3 },
  memories: { relationship: 'family', occasion: 'celebration', mood: 'warm', photoCount: 6 },
  sakura: { relationship: 'someone-special', occasion: 'just-because', mood: 'minimal', photoCount: 2 },
};

/** Templates without a story of their own borrow this one. */
const FALLBACK = 'romantic';

/**
 * `locale` is required on purpose.
 *
 * It used to default to English, and one call site that simply forgot to pass
 * it served every Russian and Uzbek visitor an entirely English preview —
 * letter, dates, captions and signature — while the page around it was
 * translated. A default is exactly the wrong shape for a value nobody should
 * ever be allowed to leave unspecified.
 */
export function demoStory(templateId: string, locale: string): StoryInput {
  const template = resolveTemplate(templateId);
  const key = SEEDS[template.id] ? template.id : FALLBACK;
  const seed = SEEDS[key];
  const palette = getPalette(template.paletteId);

  // A locale that has not written this story yet degrades to the English one
  // rather than to a blank card — the same rule the template strings follow.
  const words = getDictionary(locale).content.demo[key] ?? getDictionary('en').content.demo[key];

  return {
    recipientName: words.recipientName,
    senderName: words.senderName,
    relationship: seed.relationship,
    occasion: seed.occasion,
    mood: seed.mood,
    locale,
    story: words.story,
    moments: words.moments,
    memories: words.memories,
    wishes: words.wishes,
    photos: demoPhotos(`demo-${template.id}`, seed.photoCount, photoColors(palette)),
  };
}

export function demoConfig(templateId: string, locale: string): CardConfig {
  const template = resolveTemplate(templateId);
  return composeConfig(demoStory(template.id, locale), template.id);
}
