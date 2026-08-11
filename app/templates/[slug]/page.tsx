import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { CardRenderer } from '@/components/cards/CardRenderer';
import { PreviewBar } from '@/components/marketing/PreviewBar';
import { demoConfig } from '@/lib/card/demo';
import { getPalette } from '@/lib/design/palettes';
import { getTemplate, listTemplates } from '@/templates';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return listTemplates().map((template) => ({ slug: template.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) return { title: 'Template not found' };

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
  const template = getTemplate(slug);
  if (!template) notFound();

  return (
    <main>
      <PreviewBar templateId={template.id} templateName={template.name} tagline={template.tagline} />
      <CardRenderer config={demoConfig(template.id)} />
    </main>
  );
}
