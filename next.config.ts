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
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

export default nextConfig;
