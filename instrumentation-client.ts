import * as Sentry from "@sentry/nextjs";

/**
 * Клиентская инициализация Sentry (нативный Next.js instrumentation hook).
 * Файл `instrumentation-client.ts` выполняется в браузере и поддерживается
 * Turbopack (в отличие от устаревшего `sentry.client.config.ts`).
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: Number(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 1,
  ),
  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  // NEXT_REDIRECT / NEXT_NOT_FOUND — control flow Next.js, не отправляем.
  ignoreErrors: ["NEXT_REDIRECT", "NEXT_NOT_FOUND"],
});

/** Инструментируем клиентские навигации (App Router). */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
