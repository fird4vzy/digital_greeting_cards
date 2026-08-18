import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkViewer } from '@/components/works/WorkViewer';
import { getI18n } from '@/lib/i18n/server';
import type { Dictionary } from '@/lib/i18n/types';
import { getWork, listWorks, workEntryUrl, type WorkNote } from '@/lib/works';
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

/**
 * Пометка об отличии — словами, а не признаком.
 *
 * Запись здесь, а не в реестре, по тому же правилу, что и у шаблонов: реестр
 * держит структуру, словарь — слова. Разбор по всем вариантам, поэтому новый
 * вид пометки уронит сборку, а не выйдет молча пустым абзацем.
 */
function noteText(note: WorkNote, strings: Dictionary['ui']['works']): string {
  switch (note) {
    case 'compressedVideo':
      return strings.noteCompressedVideo;
    case 'replacedName':
      return strings.noteReplacedName;
  }
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
      note={work.note ? noteText(work.note, dict.ui.works) : undefined}
      strings={dict.ui.works}
    />
  );
}
