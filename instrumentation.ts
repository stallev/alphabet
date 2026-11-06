import * as Sentry from "@sentry/nextjs";

/**
 * Next.js instrumentation hook — серверная инициализация Sentry.
 * Вызывается один раз при старте Node.js / Edge runtime.
 * Клиентская инициализация — в `sentry.client.config.ts`.
 */
export function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs" ||
    process.env.NEXT_RUNTIME === "edge"
  ) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: Number(
        process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 1,
      ),
      environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    });
  }
}

/**
 * Хук Next.js `onRequestError` — автоматически ловит необработанные ошибки
 * в Server Components, Route Handlers, Server Actions и proxy.
 */
export const onRequestError = Sentry.captureRequestError;
