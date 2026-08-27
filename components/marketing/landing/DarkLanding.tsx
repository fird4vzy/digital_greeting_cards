import { Footer } from '@/components/site/Footer';
import { Header } from '@/components/site/Header';
import { BouquetScrollStage } from '@/components/marketing/BouquetScrollStage';
import { BouquetSection } from '@/components/marketing/BouquetSection';
import { BridgeStage } from './BridgeStage';
import { ClosingCta } from '@/components/marketing/ClosingCta';
import { Hero } from '@/components/marketing/Hero';
import { MemoriesSection } from '@/components/marketing/MemoriesSection';
import { Preloader } from './Preloader';
import { Step1Stage } from './Step1Stage';
import { ThemeScrub } from './ThemeScrub';
import { WorksStage } from './WorksStage';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/types';

/**
 * ТЁМНАЯ ГЛАВНАЯ, ЦЕЛИКОМ
 * =======================
 * Один компонент на два адреса: настоящую `/` и стенд `/design/landing`.
 * Так они не могут разъехаться — стенд всегда показывает ровно то, что
 * поедет на главную следующим пушем.
 *
 * Состав — по образцу `design/preview/bir-dunyo-v10.html`: герой, сцена
 * «Выберите чувство», лента работ, воспоминания, мост, шаги, финал. Секции
 * историй и сетки поводов здесь нет — их нет в образце; шаблоны остаются на
 * своей странице, куда ведут шапка и кнопка героя.
 *
 * **Сцена разрезана на два акта, как в образце.** Прокрутка через «Выберите
 * чувство» проигрывает [0, 0.55] — лепестки слетаются и раскрываются;
 * прокрутка через мост проигрывает [0.55, 1] — стебли схватываются, крафт,
 * лента, бирка на шнурке. Между актами канваса не существует: гейт стоит на
 * секции, и над лентой работ сцена выгружена совсем.
 *
 * **Слои.** Земля со свечением — фиксированный слой на `-z-20`; канвас сцены
 * встаёт на `-z-10`; секции прозрачны. Заливки на обёртке нет намеренно:
 * непрозрачная обёртка закрыла бы канвас — та самая ошибка, из-за которой
 * первую версию сцены снимали с главной в день выката. Тёмный фон под
 * резиновой прокруткой держит `body:has([data-theme='noir'])` в globals.
 */
export function DarkLanding({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div id="noir-scope" data-theme="noir" className="text-on-surface">
      {/* Заставка первой загрузки: уезжает вверх, открывая страницу. */}
      <Preloader strings={dict.ui.loader} />

      {/* Страница светлеет к мосту и темнеет за ним — как в образце. */}
      <ThemeScrub scopeId="noir-scope" sectionId="bridge" />

      {/* Земля и свечение: бордовое пятно в верхней правой трети, золотое,
          вдвое тише, в нижнем левом углу. Без них тёмный фон читается как
          провал, а не как комната. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 bg-surface">
        <div
          className="absolute h-[60vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: '68%',
            top: '32%',
            background:
              'radial-gradient(closest-side, rgb(194 64 78 / var(--noir-glow, 0.17)), transparent 70%)',
          }}
        />
        <div
          className="absolute h-[60vmin] w-[85vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            left: '12%',
            top: '82%',
            background:
              'radial-gradient(closest-side, rgb(172 139 87 / calc(var(--noir-glow, 0.17) * 0.5)), transparent 70%)',
          }}
        />
        <div className="grain-veil" />
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

        {/* Акт первый: лепестки слетаются в цветы. */}
        <BouquetScrollStage range={[0, 0.55]}>
          <Step1Stage dict={dict} />
        </BouquetScrollStage>

        <WorksStage dict={dict} />
        <MemoriesSection dict={dict} counter="03" />

        {/* Акт второй: обёртка, лента, бирка на шнурке. */}
        <BouquetScrollStage range={[0.55, 1]} id="bridge">
          <BridgeStage dict={dict} />
        </BouquetScrollStage>

        <BouquetSection dict={dict} />
        <ClosingCta strings={dict.ui.closing} />
      </main>
      <Footer strings={dict.ui.footer} />
    </div>
  );
}
