import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CardRenderer } from '@/components/cards/CardRenderer';
import { parseCardConfig } from '@/lib/card/schema';
import { composeConfigForOrderAnywhere } from '@/lib/card/compose-server';
import { resolveTemplateAnywhere } from '@/lib/card/registry';
import { toSummary } from '@/lib/card/template';
import { getOrderByCode } from '@/lib/db';
import { getI18n } from '@/lib/i18n/server';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ code: string }> };

/**
 * The customer's early look at a card the shop has not finished.
 *
 * Deliberately a separate route from `/c/[code]`, which stays `PUBLISHED`-only.
 * That separation is the point: a code printed onto a tag and tied to a
 * bouquet must never resolve to a half-finished card, so the public URL keeps
 * its single meaning and the preview lives beside it.
 *
 * It is guarded the same way a published card is — by a code that cannot be
 * guessed — because it holds the same content and neither is secret from
 * whoever the customer chose to send the link to.
 *
 * A published card redirects nothing and simply renders: once it is live the
 * preview and the real thing are the same page, and a customer who bookmarked
 * this URL should not hit a dead end.
 */
export default async function CardPreviewPage({ params }: Props) {
  const { code } = await params;
  const order = await getOrderByCode(code);
  if (!order || order.status === 'CANCELLED') notFound();

  // Собранное раньше — первый выбор, но не единственный.
  //
  // Раньше неразобравшаяся конфигурация отправляла оператора на «открытка не
  // найдена» — сообщение неверное и нечитаемое: заказ найден, это его
  // сохранённая сборка устарела или битая. Черновик для того и нужен, чтобы
  // показать текущее состояние, поэтому при неудаче он пересобирает заново из
  // самого заказа, а не сдаётся.
  const stored = order.config ? parseCardConfig(order.config) : null;
  const parsed = stored?.ok
    ? stored
    : parseCardConfig(await composeConfigForOrderAnywhere(order));

  if (!parsed.ok) notFound();

  const { dict } = await getI18n();
  const draft = order.status !== 'PUBLISHED';

  return (
    <main>
      {draft ? (
        // Fixed rather than inline: the card is a full-screen sequence, and a
        // banner in the flow would be scrolled past and forgotten by the time
        // it matters.
        <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3">
          <p className="max-w-[34rem] rounded-full border border-white/10 bg-noir/85 px-5 py-2.5 text-center text-caption text-paper shadow-[var(--shadow-float)] backdrop-blur-xl">
            {dict.ui.preview.draft}
          </p>
        </div>
      ) : null}

      <CardRenderer template={toSummary(await resolveTemplateAnywhere(order.templateId))} config={parsed.config} />
    </main>
  );
}
