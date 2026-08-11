/**
 * Product taxonomy — the shared vocabulary between the marketing site, the
 * creation flow, the template registry and (later) the AI planner.
 *
 * Everything downstream keys off these ids, so they are treated as stable
 * contract values: add new ones freely, never rename an existing one.
 */

export const OCCASIONS = [
  {
    id: 'love',
    label: 'Love',
    line: 'For the person you think about first.',
    verb: 'in love',
    motif: 'petals',
  },
  {
    id: 'birthday',
    label: 'Birthday',
    line: 'A whole year of them, worth celebrating.',
    verb: 'celebrating',
    motif: 'sparks',
  },
  {
    id: 'for-mom',
    label: 'For Mom',
    line: 'The words that never quite fit in a card.',
    verb: 'grateful',
    motif: 'linen',
  },
  {
    id: 'anniversary',
    label: 'Anniversary',
    line: 'Everything you have built, in one place.',
    verb: 'still choosing them',
    motif: 'arch',
  },
  {
    id: 'friendship',
    label: 'Friendship',
    line: 'For the ones who stayed.',
    verb: 'thankful',
    motif: 'sun',
  },
  {
    id: 'celebration',
    label: 'Celebration',
    line: 'Something good happened. Say it properly.',
    verb: 'proud',
    motif: 'sparks',
  },
  {
    id: 'just-because',
    label: 'Just Because',
    line: 'No reason. That is the reason.',
    verb: 'thinking of them',
    motif: 'branch',
  },
] as const;

export type OccasionId = (typeof OCCASIONS)[number]['id'];
export type Occasion = (typeof OCCASIONS)[number];

export const RECIPIENTS = [
  { id: 'girlfriend', label: 'Girlfriend', suggests: ['love', 'anniversary'] },
  { id: 'boyfriend', label: 'Boyfriend', suggests: ['love', 'anniversary'] },
  { id: 'wife', label: 'Wife', suggests: ['anniversary', 'love'] },
  { id: 'husband', label: 'Husband', suggests: ['anniversary', 'love'] },
  { id: 'mom', label: 'Mom', suggests: ['for-mom', 'birthday'] },
  { id: 'dad', label: 'Dad', suggests: ['birthday', 'celebration'] },
  { id: 'friend', label: 'Friend', suggests: ['friendship', 'birthday'] },
  { id: 'family', label: 'Family', suggests: ['celebration', 'just-because'] },
  { id: 'someone-special', label: 'Someone special', suggests: ['just-because', 'love'] },
] as const;

export type RecipientId = (typeof RECIPIENTS)[number]['id'];

export const MOODS = [
  { id: 'romantic', label: 'Romantic', line: 'Low light, slow reveals, one candle.' },
  { id: 'warm', label: 'Warm', line: 'Like a kitchen in the morning.' },
  { id: 'cute', label: 'Cute', line: 'Light-footed and a little playful.' },
  { id: 'elegant', label: 'Elegant', line: 'Restrained. Every detail deliberate.' },
  { id: 'funny', label: 'Funny', line: 'They will laugh before they cry.' },
  { id: 'minimal', label: 'Minimal', line: 'Few words. A lot of air.' },
  { id: 'dreamy', label: 'Dreamy', line: 'Soft focus, drifting petals.' },
] as const;

export type MoodId = (typeof MOODS)[number]['id'];

export const OCCASION_MAP = Object.fromEntries(OCCASIONS.map((o) => [o.id, o])) as Record<
  OccasionId,
  Occasion
>;

export const MOOD_MAP = Object.fromEntries(MOODS.map((m) => [m.id, m])) as Record<
  MoodId,
  (typeof MOODS)[number]
>;

export const RECIPIENT_MAP = Object.fromEntries(RECIPIENTS.map((r) => [r.id, r])) as Record<
  RecipientId,
  (typeof RECIPIENTS)[number]
>;

export function occasionLabel(id: string): string {
  return OCCASION_MAP[id as OccasionId]?.label ?? id;
}

export function recipientLabel(id: string): string {
  return RECIPIENT_MAP[id as RecipientId]?.label ?? id;
}

export function moodLabel(id: string): string {
  return MOOD_MAP[id as MoodId]?.label ?? id;
}
