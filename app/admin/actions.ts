'use server';

import { revalidatePath } from 'next/cache';
import { blobUrlsOf, eraseBlobs } from '@/lib/storage/erase';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/guard';
import { composeConfigForOrderAnywhere } from '@/lib/card/compose-server';
import { getCardFileStore, getOrder, removeOrder, updateOrder } from '@/lib/db';
import { ORDER_STATUSES, canTransition, isDeletable, type OrderStatus } from '@/lib/db/types';
import { findChats, sendTestNotification, type ChatLookup, type TestResult } from '@/lib/notify/telegram';
import { siteOrigin } from '@/lib/site-origin';

/**
 * Admin mutations.
 *
 * ⚠️ These carry no identity. A shared password (`lib/auth/admin.ts`) is all
 * that stands in front of them: it establishes that the caller is *an*
 * operator, never *which* operator. So there is still no per-shop ownership
 * check — any signed-in caller can act on any shop's order. Every action below
 * is where that check belongs once orders have an owner; they are the only
 * writes the admin can perform.
 *
 * Each one re-verifies the session rather than trusting the proxy. A server
 * action is a POST endpoint that anyone can call directly once they know its
 * id — reachable without ever rendering the layout that guards the page it
 * lives on — so routing is the wrong place to make a mutation safe.
 */

export async function setOrderStatus(id: string, status: string) {
  await requireAdmin();


  if (!ORDER_STATUSES.includes(status as OrderStatus)) return;

  const order = await getOrder(id);
  if (!order) return;

  // Переход проверяется, а не только сам статус. См. ALLOWED_TRANSITIONS:
  // отмена необратима, потому что бирка уже напечатана.
  if (!canTransition(order.status, status as OrderStatus)) {
    console.warn(`[orders] запрещённый переход ${order.status} → ${status} для ${id}`);
    return;
  }

  // Publishing an order with no composed card would produce an empty page.
  const config = order.config ?? (status === 'PUBLISHED' ? await composeConfigForOrderAnywhere(order) : null);

  await updateOrder(id, { status: status as OrderStatus, ...(config ? { config } : {}) });

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/admin/cards');

  // И сама открытка: смена статуса — единственное, что делает её публичной
  // или закрывает, и страховка на случай, если чтение когда-нибудь начнёт
  // кешироваться. Дешевле, чем узнать об этом от получателя.
  revalidatePath(`/c/${order.code}`);
  revalidatePath(`/c/${order.code}/preview`);
}

/** Recomposes the card from the order's current fields and template. */
export async function regenerateCard(id: string, templateId?: string) {
  await requireAdmin();

  const order = await getOrder(id);
  if (!order) return;

  const nextTemplate = templateId ?? order.templateId;

  await updateOrder(id, {
    templateId: nextTemplate,
    config: await composeConfigForOrderAnywhere({ ...order, templateId: nextTemplate }),
    status: order.status === 'NEW' ? 'PROCESSING' : order.status,
  });

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/admin/orders');
}

export async function saveOrderNotes(id: string, notes: string) {
  await requireAdmin();

  await updateOrder(id, { notes });
  revalidatePath(`/admin/orders/${id}`);
}

/**
 * Deletes an order, if `isDeletable` allows it.
 *
 * The rule is enforced here rather than by hiding the button: the button is a
 * courtesy, this is the boundary.
 */
export async function deleteOrder(id: string) {
  await requireAdmin();

  const order = await getOrder(id);
  if (!order || !isDeletable(order)) return;

  // Сначала файлы в хранилище, потом строка. Порядок важен: адреса записаны
  // только в самом заказе, и удалив строку первой, мы потеряли бы единственный
  // способ узнать, что стирать. Отказ хранилища не мешает удалению — стирание
  // ошибок не бросает, а считает их и пишет в лог.
  const store = await getCardFileStore();
  await eraseBlobs(blobUrlsOf(order, await store.remoteUrls(id)));

  await removeOrder(id);

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath('/admin/cards');

  // The order's own page no longer exists; sending the operator back to the
  // queue is the only sensible destination.
  redirect('/admin/orders');
}

/**
 * Sends a test notification and hands back what Telegram said.
 *
 * A mutation only in the sense that it sends something to the outside world;
 * it touches no order, which is the point. Verifying the setup used to mean
 * placing a real order against production and then deleting it by hand.
 */
export async function testNotifications(): Promise<TestResult> {
  await requireAdmin();

  return sendTestNotification(await siteOrigin());
}

/** Какие чаты бот видел. Ответ никогда не содержит токена — см. `scrub`. */
export async function lookUpChats(): Promise<ChatLookup> {
  await requireAdmin();
  return findChats();
}
