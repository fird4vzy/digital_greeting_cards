import type { Metadata } from 'next';
import { CreateFlow } from '@/components/create/CreateFlow';
import { Header } from '@/components/site/Header';
import { localiseTemplates } from '@/lib/i18n/localise';
import { getI18n } from '@/lib/i18n/server';
import { listTemplateSummaries } from '@/templates';

export const metadata: Metadata = {
  title: 'Create a card',
  description: 'Eight questions, and a little world made for someone.',
};

type Props = { searchParams: Promise<{ template?: string }> };

export default async function CreatePage({ searchParams }: Props) {
  const { template } = await searchParams;
  const { locale, dict } = await getI18n();

  return (
    <>
      <Header locale={locale} strings={{ ...dict.ui.nav, language: dict.ui.localeSwitcher.label }} />
      <main className="flex min-h-[100svh] flex-col bg-paper-warm">
        <CreateFlow
          templates={localiseTemplates(listTemplateSummaries(), dict)}
          initialTemplate={template}
          locale={locale}
          dict={dict}
        />
      </main>
    </>
  );
}
