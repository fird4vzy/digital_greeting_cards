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

export default nextConfig;
