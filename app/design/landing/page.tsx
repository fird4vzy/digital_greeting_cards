import type { Metadata, Viewport } from 'next';
import { DarkLanding } from '@/components/marketing/landing/DarkLanding';
import { getI18n } from '@/lib/i18n/server';

/**
 * СТЕНД ТЁМНОЙ РЕДАКЦИИ
 * =====================
 * С 27 августа тёмная редакция стоит на самой `/`, и стенд рендерит тот же
 * `DarkLanding` — буквально тот же компонент, не копию. Он остаётся жить,
 * потому что это дешёвый безопасный адрес для следующей итерации: когда
 * главная и стенд начнут отличаться, различие будет означать «вот что
 * готовится», а не «вот что забыли синхронизировать».
 *
 * `noindex`, в навигации нет, из деплоя не убирается.
 */

export const metadata: Metadata = {
  title: 'Лендинг · тёмная редакция',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#17130F', colorScheme: 'dark' };

export default async function DarkLandingPage() {
  const { locale, dict } = await getI18n();
  return <DarkLanding locale={locale} dict={dict} />;
}
