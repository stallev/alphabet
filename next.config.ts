import type { NextConfig } from "next";
// `@sentry/nextjs/config` — CommonJS-only subpath (см. package.json `exports`).
// Именованный ESM-импорт нестабилен при Turbopack-компиляции next.config.ts,
// поэтому берём default-объект и достаём `withSentryConfig` из него.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sentryConfigModule = require("@sentry/nextjs/config") as {
  withSentryConfig: (
    config: NextConfig,
    options: Record<string, unknown>,
  ) => NextConfig;
};
const { withSentryConfig } = sentryConfigModule;

const nextConfig: NextConfig = {
  // Dev and production builds must not share `.next` (Turbopack font graph corruption).
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  reactCompiler: true,
  // Off until ADR on Cache Components: required for `dynamicParams = false` on `app/[game]` (ADR-005).
  cacheComponents: false,
  async redirects() {
    return [
      {
        source: "/game",
        destination: "/alphabet",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Source maps upload only when SENTRY_AUTH_TOKEN is present (CI / prod).
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
