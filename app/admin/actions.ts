'use server';

import { revalidatePath } from 'next/cache';
import { composeConfigForOrder } from '@/lib/card/service';
import { getOrder, updateOrder } from '@/lib/db';
import { ORDER_STATUSES, type OrderStatus } from '@/lib/db/types';

/**
 * Admin mutations.
 *
 * ⚠️ These carry no identity. A shared password in middleware
 * (`lib/auth/admin.ts`) is all that stands in front of them: it establishes
 * that the caller is *an* operator, never *which* operator. So there is still
 * no per-shop ownership check — any authenticated caller can act on any shop's
 * order. Every action below is where that check belongs once orders have an
 * owner; they are the only writes the admin can perform.
 */

export async function setOrderStatus(id: string, status: string) {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) return;

  const order = await getOrder(id);
  if (!order) return;

  // Publishing an order with no composed card would produce an empty page.
  const config = order.config ?? (status === 'PUBLISHED' ? composeConfigForOrder(order) : null);

  await updateOrder(id, { status: status as OrderStatus, ...(config ? { config } : {}) });

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/admin/cards');
}

/** Recomposes the card from the order's current fields and template. */
export async function regenerateCard(id: string, templateId?: string) {
  const order = await getOrder(id);
  if (!order) return;

  const nextTemplate = templateId ?? order.templateId;

  await updateOrder(id, {
    templateId: nextTemplate,
    config: composeConfigForOrder({ ...order, templateId: nextTemplate }),
    status: order.status === 'NEW' ? 'PROCESSING' : order.status,
  });

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/admin/orders');
}

export async function saveOrderNotes(id: string, notes: string) {
  await updateOrder(id, { notes });
  revalidatePath(`/admin/orders/${id}`);
}
