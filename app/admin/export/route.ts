import { adminOnly } from '@/lib/auth/guard';
import { listOrders } from '@/lib/db';

/**
 * Every order, as one JSON file the shop can keep.
 *
 * Neon takes its own backups, but those live with the provider and restore the
 * whole database. This is the other thing a shop needs: a copy in their own
 * hands, readable without us, that can be opened in a spreadsheet or handed to
 * whoever runs the business next.
 *
 * A route handler never renders the admin layout, so it verifies the session
 * itself — the proxy in front of it is a redirect for humans, not the
 * authorisation boundary. Without this check the whole order book, customer
 * emails and phone numbers included, would be one URL away.
 */
export async function GET() {
  const denied = await adminOnly();
  if (denied) return denied;

  const orders = await listOrders();

  const payload = {
    exportedAt: new Date().toISOString(),
    count: orders.length,
    orders,
  };

  // Dated filename: these accumulate in a downloads folder, and "orders.json"
  // three times over tells you nothing about which one is current.
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="orders-${stamp}.json"`,
      // Never let a proxy or the browser hold on to the order book.
      'cache-control': 'no-store, private',
    },
  });
}
