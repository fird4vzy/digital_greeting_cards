import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { CardRenderer } from '@/components/cards/CardRenderer';
import { PreviewBar } from '@/components/marketing/PreviewBar';
import { demoConfig } from '@/lib/card/demo';
import { getPalette } from '@/lib/design/palettes';
import { localiseTemplate } from '@/lib/i18n/localise';
import { getI18n } from '@/lib/i18n/server';
import { getTemplate, listTemplates } from '@/templates';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listTemplates().map((template) => ({ slug: template.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const raw = getTemplate(slug);
  if (!raw) return {};

  const { dict } = await getI18n();
  const template = localiseTemplate(raw, dict);

  return {
    title: `${template.name} — ${template.tagline}`,
    description: template.description,
  };
}

export async function generateViewport({ params }: Props): Promise<Viewport> {
  const { slug } = await params;
  const template = getTemplate(slug);
  const palette = getPalette(template?.paletteId ?? 'duskRose');
  return { themeColor: palette.bg, colorScheme: palette.scheme };
}

/**
 * A template preview is the real card, full-bleed.
 *
 * Not a scaled-down thumbnail in a device mock: the same renderer, the same
 * sections, the same motion — with demo content composed through the same
 * engine a customer order goes through. The only addition is a floating bar
 * that says what you are looking at and how to use it.
 */
export default async function TemplatePreviewPage({ params }: Props) {
  const { slug } = await params;
  const raw = getTemplate(slug);
  if (!raw) notFound();

  const { dict } = await getI18n();
  const template = localiseTemplate(raw, dict);
  const t = dict.ui.templates;

  return (
    <main>
      <PreviewBar
        templateId={template.id}
        templateName={template.name}
        tagline={template.tagline}
        strings={{ back: t.back, preview: t.preview, useThis: t.useThis }}
      />
      <CardRenderer config={demoConfig(template.id)} />
    </main>
  );
}
