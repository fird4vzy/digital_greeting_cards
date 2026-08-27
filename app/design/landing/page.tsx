import type { Metadata, Viewport } from 'next';
import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { BouquetScrollStage } from '@/components/marketing/BouquetScrollStage';
import { BouquetSection } from '@/components/marketing/BouquetSection';
import { BridgeStage } from '@/components/marketing/landing/BridgeStage';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { Hero } from '@/components/marketing/Hero';
import { MemoriesSection } from '@/components/marketing/MemoriesSection';
import { Step1Stage } from '@/components/marketing/landing/Step1Stage';
import { WorksStage } from '@/components/marketing/landing/WorksStage';
import { getI18n } from '@/lib/i18n/server';

/**
 * СТЕНД ТЁМНОЙ РЕДАКЦИИ ЛЕНДИНГА
 * ==============================
 *
 * Состав — по образцу `design/preview/bir-dunyo-v10.html`, а не по нынешней
 * главной: герой, сцена «Выберите чувство» с собирающимся букетом позади,
 * лента работ, воспоминания, мост, шаги, финал. Секции историй и сетки
 * поводов здесь нет — их нет в образце, и оставлять ли их на настоящей
 * главной, решается отдельно (решение 6 в `design/dark-landing-plan.md`).
 *
 * **Зачем отдельный адрес, а не правка `app/page.tsx`.** Букет уже выкатывали
 * на живую главную и снимали в тот же день. Вывод стоит в STATUS дословно:
 * то, что нельзя увидеть до деплоя, нельзя выкатывать на лендинг. Стенд живёт
 * под `noindex`, в навигации его нет, `app/page.tsx` он не трогает.
 *
 * **Слои.** Земля — отдельный фиксированный слой на `-z-20`, свечение на нём;
 * канвас сцены встаёт между землёй и контентом на `-z-10`. Заливки на обёртке
 * нет намеренно: непрозрачная обёртка закрыла бы канвас собой — ровно та
 * ошибка, из-за которой сцену снимали с главной. Тёмный фон под резиновой
 * прокруткой держит правило `body:has([data-theme='noir'])` в globals.
 *
 * **Про обёртку.** Она несёт только тему и цвет текста. Ни `transform`, ни
 * `filter`, ни `backdrop-filter`, ни `contain`, ни `will-change` — любой из
 * них сделал бы её containing block, и фиксированная шапка начала бы
 * считаться от неё, а не от вьюпорта.
 */

export const metadata: Metadata = {
  title: 'Лендинг · тёмная редакция',
  robots: { index: false, follow: false },
};

/**
 * Своя строка состояния: общий layout объявляет кремовую и светлую схему,
 * без переопределения мобильный браузер оставил бы светлую полосу над тёмной
 * страницей. Прецедент — `app/c/[code]/page.tsx`.
 */
export const viewport: Viewport = { themeColor: '#17130F', colorScheme: 'dark' };

export default async function DarkLandingPage() {
  const { locale, dict } = await getI18n();

  return (
    <div data-theme="noir" className="text-on-surface">
      {/* Земля и свечение. Два радиальных пятна из образца — бордовое в
          верхней правой трети и золотое, вдвое тише, в нижнем левом углу.
          Без них тёмный фон читается как провал, а не как комната; это
          чинили ещё в третьей версии образца. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-surface">
        <div
          className="absolute h-[60vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: '68%',
            top: '32%',
            background: 'radial-gradient(closest-side, rgba(194, 64, 78, 0.17), transparent 70%)',
          }}
        />
        <div
          className="absolute h-[60vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: '12%',
            top: '82%',
            background: 'radial-gradient(closest-side, rgba(172, 139, 87, 0.085), transparent 70%)',
          }}
        />
      </div>

      <Header
        overlay
        locale={locale}
        strings={{ ...dict.ui.nav, language: dict.ui.localeSwitcher.label }}
      />
      <main id="main">
        <Hero
          strings={dict.ui.hero}
          secondaryCta={{ href: '/works', label: dict.ui.hero.ctaWorks }}
        />

        {/* Сцена живёт за этой секцией и собирается её прокруткой. */}
        <BouquetScrollStage>
          <Step1Stage dict={dict} />
        </BouquetScrollStage>

        <WorksStage dict={dict} />
        <MemoriesSection dict={dict} counter="03" />
        <BridgeStage dict={dict} />
        <BouquetSection dict={dict} />
        <ClosingCta strings={dict.ui.closing} />
      </main>
      <Footer strings={dict.ui.footer} />
    </div>
  );
}
