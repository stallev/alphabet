import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
