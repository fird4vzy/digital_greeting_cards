import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Three.js and drei ship large ESM graphs. Keeping them out of the server
  // bundle and letting Next optimise the barrel imports keeps first load small.
  experimental: {
    optimizePackageImports: ['@react-three/drei', 'framer-motion'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // remotePatterns здесь нет намеренно. Стояло `hostname: '**'`, и это
    // превращало /_next/image в бесплатный открытый прокси-ресайзер для всего
    // интернета: чужой трафик за наш счёт, чужие картинки с нашего домена.
    // Оптимизировать нечего — фотографии заказов приходят как data-URL, всё
    // остальное лежит в public/. Понадобится внешний хост — вписать его сюда
    // поимённо.
  },
  async headers() {
    return [
      {
        /**
         * Работы из «Наших работ» лежат под /w/ и показываются во фрейме с
         * `sandbox` без `allow-same-origin` — то есть с opaque origin. Для
         * браузера это origin `null`, поэтому запрос шрифта из такой страницы
         * считается межсайтовым и без этого заголовка отклоняется: работа
         * открывается подставными шрифтами вместо своих, а весь смысл раздела
         * в том, что она открывается ровно такой, какой её отдали.
         *
         * Заголовок ничего не открывает: это статические файлы, которые и так
         * доступны любому по прямой ссылке, и куки с ними не отправляются.
         * Ослаблять песочницу ради шрифтов, наоборот, нельзя — см. WorkViewer.
         */
        source: '/w/:path*',
        headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "birdunyo",

  project: "javascript-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Отчёты с клиента идут нашим же адресом, чтобы их не резали блокировщики.
  // Маршрут исключён из матчера в proxy.ts — иначе посредник перехватывал бы
  // его, и отчёты переставали бы доходить без единого признака.
  tunnelRoute: '/monitoring',

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
