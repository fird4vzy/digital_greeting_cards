import { resolveTemplate } from '@/templates';
import { asLocale } from '@/lib/i18n/config';
import type { Order } from '@/lib/db/types';
import { CARD_CONFIG_VERSION, cardConfigSchema, type CardConfig } from './schema';
import type { StoryInput, TemplateDefinition } from './template';

/**
 * The composition service — the single path from an order to a renderable
 * card. The creation flow, the admin "generate" action and the AI planner all
 * go through here, so a card produced by a customer and a card produced by an
 * operator are byte-identical in structure.
 */

/**
 * Что сборке нужно от заказа — и ничего сверх того.
 *
 * Не `Order` целиком, потому что сборка не читает ни id, ни код, ни статус.
 * Ей можно отдать черновик, которого ещё нет в базе, и именно так теперь
 * работает создание заказа: открытка собирается до вставки и пишется вместе с
 * ней, одной записью. Пока тип был `Order`, ради этого пришлось бы выдумывать
 * пустые id и даты — и подпись врала бы о том, что читается.
 */
export type StorySource = Pick<
  Order,
  | 'recipient'
  | 'locale'
  | 'occasion'
  | 'mood'
  | 'message'
  | 'photos'
  | 'moments'
  | 'memories'
  | 'wishes'
> & { customer: Pick<Order['customer'], 'name'> };

export function orderToStoryInput(order: StorySource): StoryInput {
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

/**
 * The composition itself, against an already-resolved template.
 *
 * Split out so a caller that had to look its template up asynchronously — an
 * operator-built one lives in the database — runs exactly the same code as one
 * that read it straight out of the compiled registry. See
 * `lib/card/compose-server.ts`.
 */
export function composeConfigWithTemplate(
  input: StoryInput,
  template: TemplateDefinition,
): CardConfig {
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

/** Compiled templates only. Correct for demo content and seeds. */
export function composeConfig(input: StoryInput, templateId: string): CardConfig {
  return composeConfigWithTemplate(input, resolveTemplate(templateId));
}

export function composeConfigForOrder(order: Order, templateId?: string): CardConfig {
  return composeConfig(orderToStoryInput(order), templateId ?? order.templateId);
}
