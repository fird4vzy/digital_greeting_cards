import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CustomCardFrame } from '@/components/cards/CustomCardFrame';
import { CardRenderer } from '@/components/cards/CardRenderer';
import { parseCardConfig } from '@/lib/card/schema';
import { composeConfigForOrderAnywhere } from '@/lib/card/compose-server';
import { resolveTemplateAnywhere } from '@/lib/card/registry';
import { toSummary } from '@/lib/card/template';
import { getOrderByCode } from '@/lib/db';
import { getPalette } from '@/lib/design/palettes';
import { getDictionary } from '@/lib/i18n';
import { SITE } from '@/lib/site';

type Props = { params: Promise<{ code: string }> };

/**
 * A published card is effectively public — the code is printed and handed
 * over — but it is written for exactly one person, so it must never be
 * indexed, previewed in a link unfurl, or otherwise leak out of the moment
 * it was made for.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const order = await getOrderByCode(code);

  if (!order) return { title: 'Card not found', robots: { index: false, follow: false } };

  return {
    title: `For ${order.recipient.name}`,
    description: 'Someone made you something.',
    robots: { index: false, follow: false, nocache: true },
    openGraph: { title: 'Someone made you something.', description: '' },
  };
}

/** Paints the browser chrome in the card's own colour before it even loads. */
export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { code } = await params;
  const order = await getOrderByCode(code);
  const palette = getPalette((await resolveTemplateAnywhere(order?.templateId)).paletteId);

  return {
    themeColor: palette.bg,
    colorScheme: palette.scheme,
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  };
}

export default async function CardPage({ params }: Props) {
  const { code } = await params;
  const order = await getOrderByCode(code);

  if (!order || order.status !== 'PUBLISHED') notFound();

  // Ручная открытка перебивает сборку движка: если оператор сел и написал
  // открытку сам, показывать надо её, а не то, что собралось из шаблона.
  if (order.customEntry) {
    return (
      <main>
        <CustomCardFrame
          src={`/u/${order.code}/${order.customEntry}`}
          title={order.recipient.name}
        />
      </main>
    );
  }

  // Fall back to composing on the fly: a published order with no stored
  // config is a data bug, not a reason to show the recipient an error page.
  const parsed = parseCardConfig(order.config ?? await composeConfigForOrderAnywhere(order));
  if (!parsed.ok) notFound();

  // The colophon is read by the recipient, standing over the bouquet, so it
  // follows the *card's* language — not the language of whoever opens the link.
  const madeWith = getDictionary(order.locale).ui.card.madeWith;

  return (
    <main>
      <CardRenderer template={toSummary(await resolveTemplateAnywhere(order.templateId))} config={parsed.config} />
      <CardColophon code={order.code} madeWith={madeWith} />
    </main>
  );
}

/**
 * The only branding inside a card, and it sits after the last beat: a single
 * line the recipient scrolls past once they are done. The card belongs to the
 * two people in it, not to us.
 */
function CardColophon({ code, madeWith }: { code: string; madeWith: string }) {
  return (
    <div className="card-scope border-t border-[var(--card-line)] px-[var(--spacing-gutter)] py-10 text-center">
      <p className="text-caption text-[var(--card-ink-muted)]">
        {madeWith}{' '}
        <Link href="/" className="underline decoration-[var(--card-line)] underline-offset-4 transition-colors hover:text-[var(--card-accent)]">
          {SITE.name}
        </Link>
      </p>
      <p className="mt-2 text-[0.7rem] uppercase tracking-[0.16em] text-[var(--card-ink-muted)] opacity-50">
        {code}
      </p>
    </div>
  );
}
