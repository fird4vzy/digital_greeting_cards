import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkViewer } from '@/components/works/WorkViewer';
import { getI18n } from '@/lib/i18n/server';
import { getWork, listWorks, workEntryUrl } from '@/lib/works';
import { siteOrigin } from '@/lib/site-origin';

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return listWorks().map((work) => ({ id: work.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const work = getWork(id);
  const { dict } = await getI18n();

  if (!work) return { title: dict.ui.works.metaTitle };

  return {
    title: `${work.title} · ${dict.ui.works.metaTitle}`,
    description: dict.ui.works.metaDescription,
  };
}

export default async function WorkPage({ params }: Props) {
  const { id } = await params;
  const work = getWork(id);
  if (!work) notFound();

  const { dict } = await getI18n();
  const origin = await siteOrigin();

  return (
    <WorkViewer
      src={workEntryUrl(work)}
      title={work.title}
      shareUrl={`${origin}/works/${work.id}`}
      qrUrl={`/api/works/${work.id}/qr?size=320`}
      note={work.note ? dict.ui.works.noteCompressedVideo : undefined}
      strings={dict.ui.works}
    />
  );
}
