import { resolveTemplate } from '@/templates';
import { asLocale } from '@/lib/i18n/config';
import type { Order } from '@/lib/db/types';
import { CARD_CONFIG_VERSION, cardConfigSchema, type CardConfig } from './schema';
import type { StoryInput } from './template';

/**
 * The composition service — the single path from an order to a renderable
 * card. The creation flow, the admin "generate" action and the AI planner all
 * go through here, so a card produced by a customer and a card produced by an
 * operator are byte-identical in structure.
 */

export function orderToStoryInput(order: Order): StoryInput {
  return {
    recipientName: order.recipient.name,
    senderName: order.customer.name,
    relationship: order.recipient.relationship,
    locale: order.locale,
    occasion: order.occasion,
    mood: order.mood,
    story: order.message,
    photos: order.photos ?? [],
    moments: order.moments ?? [],
    memories: order.memories ?? [],
    wishes: order.wishes ?? [],
  };
}

export function composeConfig(input: StoryInput, templateId: string): CardConfig {
  const template = resolveTemplate(templateId);

  const config: CardConfig = {
    version: CARD_CONFIG_VERSION,
    templateId: template.id,
    recipient: { name: input.recipientName, relationship: input.relationship },
    sender: { name: input.senderName },
    occasion: String(input.occasion),
    mood: String(input.mood),
    // The card carries its own language forever: every localisable string in
    // it was resolved at compose time from exactly this value.
    locale: asLocale(input.locale),
    sections: template.compose(input),
  };

  // Compose then validate: a template that emits a malformed section should
  // fail here, in one place, rather than at render time inside a React tree.
  return cardConfigSchema.parse(config);
}

export function composeConfigForOrder(order: Order, templateId?: string): CardConfig {
  return composeConfig(orderToStoryInput(order), templateId ?? order.templateId);
}
