import type { CardConfig, Photo } from '@/lib/card/schema';

/**
 * DOMAIN MODEL
 *
 * The product is B2B2C — a customer buys flowers at a shop, the shop places
 * the card order, and the recipient scans a QR code. `Order` is the shop-side
 * fulfilment record and carries the card configuration it produces.
 *
 * A "card" is not a separate table: it is a published order, addressed by its
 * short code. Keeping one row means the admin can never see an order whose
 * published card disagrees with it. If cards later need their own lifecycle
 * (versioning, expiry, transfer between orders), that is the seam to split on.
 */

export const ORDER_STATUSES = [
  'NEW',
  'PROCESSING',
  'REVIEW',
  'READY',
  'PUBLISHED',
  'CANCELLED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * `CANCELLED` is a status rather than a deletion, and that is the whole point.
 * A card's code may already be printed onto a tag and tied to a bouquet, so
 * the row has to survive: it keeps the code reserved forever, and it keeps the
 * history of what was ordered. `/c/[code]` serves only `PUBLISHED`, so
 * cancelling takes a live card down on its own.
 */
export const STATUS_META: Record<OrderStatus, { label: string; hint: string; tone: string }> = {
  NEW: { label: 'New', hint: 'Just arrived from the shop', tone: 'var(--color-ink-muted)' },
  PROCESSING: { label: 'Processing', hint: 'Being written and composed', tone: 'var(--color-clay)' },
  REVIEW: { label: 'Review', hint: 'Waiting on a human read-through', tone: 'var(--color-gold)' },
  READY: { label: 'Ready', hint: 'Approved, not yet live', tone: 'var(--color-sage)' },
  PUBLISHED: { label: 'Published', hint: 'Live and attached to a bouquet', tone: 'var(--color-accent)' },
  CANCELLED: { label: 'Cancelled', hint: 'Called off; the code stays reserved', tone: 'var(--color-ink-faint)' },
};

export type Customer = {
  name: string;
  email?: string;
  phone?: string;
  /** Which flower shop took the order. */
  shop?: string;
};

export type Order = {
  id: string;
  /** The short code in the public URL: /c/8FJ29K */
  code: string;
  customer: Customer;
  recipient: { name: string; relationship: string };
  occasion: string;
  mood: string;
  /**
   * The language the card is written in. Independent of the language the
   * customer ordered in — a Tashkent shop browsing in Uzbek routinely sends
   * a Russian card, and the recipient's phone language is irrelevant to both.
   */
  locale: string;
  /** The customer's own words from "Tell us the story". */
  message: string;
  photos: Photo[];
  moments: { date: string; title: string; text?: string }[];
  memories: { label: string; text: string }[];
  wishes: string[];
  templateId: string;
  status: OrderStatus;
  /** Null until the card has been composed. */
  config: CardConfig | null;
  notes?: string;
  /**
   * What the customer asked for, in their own words — deadlines, styling
   * requests, anything the eight questions do not have a slot for. Read by
   * the shop, never rendered into the card: `message` is the card's text,
   * this is the instruction that comes with it.
   */
  brief?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

export type OrderDraft = Omit<Order, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'status' | 'config'> &
  Partial<Pick<Order, 'status' | 'config'>>;

export type OrderPatch = Partial<Omit<Order, 'id' | 'createdAt'>>;

export type OrderFilter = {
  status?: OrderStatus;
  search?: string;
  limit?: number;
};

/** Published-order projection used by /admin/cards. */
export type PublishedCard = {
  id: string;
  code: string;
  recipientName: string;
  senderName: string;
  templateId: string;
  occasion: string;
  publishedAt: string | null;
  url: string;
};

/**
 * Whether an order may be deleted outright.
 *
 * Publishing is the point of no return. From then on the code can be printed
 * onto a tag, tied to a bouquet and handed to someone, and removing the row
 * would leave them scanning into a 404 with no way to find out why. Retiring a
 * live card is `CANCELLED` instead: the page goes down, the row and its code
 * stay. `publishedAt` is checked as well as the status, so an order that was
 * published and later moved back to `READY` is still protected.
 */
export function isDeletable(order: Pick<Order, 'status' | 'publishedAt'>): boolean {
  return order.status !== 'PUBLISHED' && !order.publishedAt;
}
