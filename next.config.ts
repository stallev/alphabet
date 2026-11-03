import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Dev and production builds must not share `.next` (Turbopack font graph corruption).
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
  reactCompiler: true,
  // Off until ADR on Cache Components: required for `dynamicParams = false` on `app/[game]` (ADR-005).
  cacheComponents: false,
  async redirects() {
    return [
      {
        source: '/game',
        destination: '/alphabet',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
