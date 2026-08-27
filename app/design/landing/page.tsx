import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { BouquetSection } from '@/components/marketing/BouquetSection';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { FeelingSection } from '@/components/marketing/FeelingSection';
import { Hero } from '@/components/marketing/Hero';
import { MemoriesSection } from '@/components/marketing/MemoriesSection';
import { StorySection } from '@/components/marketing/StorySection';
import { localiseTemplates } from '@/lib/i18n/localise';
import { getI18n } from '@/lib/i18n/server';
import { listAllTemplateSummaries } from '@/lib/card/registry';

/**
 * СТЕНД ТЁМНОЙ РЕДАКЦИИ ЛЕНДИНГА
 * ==============================
 *
 * Та же главная, теми же компонентами и теми же строками, но внутри области
 * `data-theme="noir"`. Пока это ровно то, что уже есть на `/`, — просто в
 * другой теме. Секции образца (лента работ, мост, прелоадер) приходят
 * следующими шагами; порядок и причины записаны в
 * `design/dark-landing-plan.md`.
 *
 * **Зачем отдельный адрес, а не правка `app/page.tsx`.** Букет уже выкатывали
 * на живую главную и снимали в тот же день. Вывод оттуда стоит в STATUS
 * дословно: то, что нельзя увидеть до деплоя, нельзя выкатывать на лендинг.
 * Стенд `/design/bouquet` доказал, что приём работает, — этот повторяет его
 * для целой страницы. Открывается с телефона по ссылке, живёт под `noindex`,
 * в навигации его нет, и `app/page.tsx` он не трогает вообще.
 *
 * **Про обёртку.** Она несёт только кастомные свойства и заливку. Ни
 * `transform`, ни `filter`, ни `backdrop-filter`, ни `contain`, ни
 * `will-change`, ни класса `grain` — любой из них сделал бы её containing
 * block, и `position: fixed` у шапки начал бы считаться от неё, а не от
 * вьюпорта: шапка уехала бы вместе со страницей. Это тот же род ошибки, что
 * непрозрачная заливка перед канвасом, только в другой плоскости.
 */

export const metadata: Metadata = {
  title: 'Лендинг · тёмная редакция',
  robots: { index: false, follow: false },
};

/**
 * Своя строка состояния.
 *
 * Общий `app/layout.tsx` объявляет `themeColor` кремовым и `colorScheme:
 * light`. Без этого переопределения мобильный браузер оставил бы светлую
 * полосу над тёмной страницей и светлые полосы прокрутки. Прецедент —
 * `app/c/[code]/page.tsx`.
 */
export const viewport: Viewport = { themeColor: '#17130F', colorScheme: 'dark' };

export default async function DarkLandingPage() {
  const { locale, dict } = await getI18n();
  const templates = localiseTemplates(await listAllTemplateSummaries(), dict);

  return (
    <div data-theme="noir" className="bg-surface text-on-surface">
      <Header
        overlay
        locale={locale}
        strings={{ ...dict.ui.nav, language: dict.ui.localeSwitcher.label }}
      />
      <main id="main">
        <Hero strings={dict.ui.hero} />
        <FeelingSection dict={dict} />
        <StorySection templates={templates} strings={dict.ui.story} locale={locale} />
        <MemoriesSection dict={dict} />
        <BouquetSection dict={dict} />
        <ClosingCta strings={dict.ui.closing} />
      </main>
      <Footer strings={dict.ui.footer} />
    </div>
  );
}
