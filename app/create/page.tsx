import type { Metadata } from 'next';
import { CreateFlow } from '@/components/create/CreateFlow';
import { Header } from '@/components/site/Header';
import { listTemplateSummaries } from '@/templates';

export const metadata: Metadata = {
  title: 'Create a card',
  description: 'Eight questions, and a little world made for someone.',
};

type Props = { searchParams: Promise<{ template?: string }> };

export default async function CreatePage({ searchParams }: Props) {
  const { template } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex min-h-[100svh] flex-col bg-paper-warm">
        <CreateFlow templates={listTemplateSummaries()} initialTemplate={template} />
      </main>
    </>
  );
}
