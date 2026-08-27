import type { Viewport } from 'next';
import { DarkLanding } from '@/components/marketing/landing/DarkLanding';
import { getI18n } from '@/lib/i18n/server';

/**
 * Главная. С 27 августа — тёмная редакция.
 *
 * Вся страница живёт в `DarkLanding`, общем со стендом `/design/landing`:
 * один компонент на два адреса, чтобы стенд всегда показывал ровно то, что
 * стоит здесь. Порядок работ и решения — `design/dark-landing-plan.md`;
 * прежняя светлая композиция с секциями историй и поводов осталась в
 * компонентах (`FeelingSection`, `StorySection`) и в истории git.
 *
 * Подмена случилась после просмотра стенда на проде — правило «то, что
 * нельзя увидеть до деплоя, нельзя выкатывать на лендинг» соблюдено:
 * увидели, потом выкатили.
 */

/**
 * Своя строка состояния: общий layout объявляет кремовую и светлую схему.
 * Без переопределения мобильный браузер держал бы светлую полосу и светлые
 * полосы прокрутки над тёмной страницей. Прецедент — `app/c/[code]/page.tsx`.
 */
export const viewport: Viewport = { themeColor: '#17130F', colorScheme: 'dark' };

export default async function HomePage() {
  const { locale, dict } = await getI18n();
  return <DarkLanding locale={locale} dict={dict} />;
}
