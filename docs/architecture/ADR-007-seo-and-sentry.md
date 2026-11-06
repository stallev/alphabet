# ADR-007 — SEO metadata и Sentry-мониторинг

**Тип:** ADR
**Статус:** Accepted
**Версия:** 1.0
**Дата:** 2026-11-06
**Зависит от:** ADR-006 (i18n, cookie-based locale); [`i18n_contract.md`](../implementation/contracts/i18n_contract.md) §1.4
**Затрагивает:** [`shared/seo/`](../../shared/seo/), [`shared/config/site.ts`](../../shared/config/site.ts), `instrumentation.ts`, `instrumentation-client.ts`, [`next.config.ts`](../../next.config.ts)

---

## Context

1. **SEO.** На страницах не было консистентных метатегов: `metadataBase`, `openGraph`, `twitter`, `canonical`, `robots` задавались точечно или отсутствовали. Локаль хранится в cookie (`ru`/`en`), URL без префикса локали (ADR-006) — оба языка живут на одном URL, поэтому `hreflang`/`alternates.languages` не применимы, пока `SITE.indexable === false`.
2. **Sentry.** Ошибки клиента и сервера не логировались. В `.env.local.example` уже заложены `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE`. Нужна инициализация SDK на обоих runtime и загрузка source maps в прод-сборке.

---

## Decision

### SEO

1. **Next.js Metadata API** (`metadata` + `generateMetadata`) — единственный механизм.
2. **`metadataBase`** из `SITE.url` (env `NEXT_PUBLIC_SITE_URL`) — OG/Twitter-изображения резолвятся в абсолютные URL.
3. **Хелпер `buildMetadata`** (`shared/seo/build-metadata.ts`) — DRY, локаль-aware: `title`, `description`, `alternates.canonical`, `openGraph` (`type`, `siteName`, `url`, `locale` `ru_RU`/`en_US`, `title`, `description`), `twitter` (`summary_large_image`), `robots`.
4. **OG/Twitter-картинка** — статичный `app/opengraph-image.png` (Next.js File Convention, авто-генерация `og:image`/`twitter:image`). Дочерние сегменты пробрасывают `parent.openGraph.images`, иначе переопределяют.
5. **`robots`** — `noindex, nofollow` пока `SITE.indexable === false`; admin (`app/admin/layout.tsx`) и dev (`app/dev/game-kit`) — явно `noindex`.
6. **Тексты** — из словарей `shared/i18n` и манифестов игр (`manifest.title/description[locale]`); admin/dev — legacy (R04), не локализуются.
7. **hreflang** — не добавляется (ADR-006 §1.4); при открытии индексации — отдельный ADR.

### Sentry

1. **`@sentry/nextjs`** (exact pin `11.11.0`).
2. **Сервер/edge:** `instrumentation.ts` → `register()` вызывает `Sentry.init()` для `NEXT_RUNTIME === 'nodejs' | 'edge'`; `onRequestError = Sentry.captureRequestError` — авто-захват ошибок Server Components, Route Handlers, Server Actions, proxy.
3. **Браузер:** `instrumentation-client.ts` (нативный Next.js хук, поддерживается Turbopack) → `Sentry.init()` + `onRouterTransitionStart = Sentry.captureRouterTransitionStart`. Устаревший `sentry.client.config.ts` Turbopack игнорирует — не используется.
4. **Build:** `withSentryConfig` в `next.config.ts` (импорт из `@sentry/nextjs/config`, CJS-interop через `require`) — загрузка source maps при наличии `SENTRY_AUTH_TOKEN` (CI/прод), `deleteSourcemapsAfterUpload: true`, `widenClientFileUpload: true`.
5. **Трейсинг:** `tracesSampleRate` из `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` (default `1`); окружение из `SENTRY_ENVIRONMENT` (fallback `NODE_ENV`). `NEXT_REDIRECT`/`NEXT_NOT_FOUND` отфильтрованы (control flow Next.js).

---

## Rejected alternatives

| Альтернатива | Почему отклонена |
|--------------|------------------|
| `hreflang`/`alternates.languages` | Оба языка на одном URL (cookie-based, ADR-006) — не применимо |
| Динамическая OG через `ImageResponse` (`next/og`) | Избыточно для MVP; выбран статичный `app/opengraph-image.png` |
| `sentry.client.config.ts` | Deprecated, игнорируется Turbopack (см. Sentry docs) |
| Именованный ESM-импорт `withSentryConfig` | Нестабилен при Turbopack-компиляции `next.config.ts`; используется `require`-interop |

---

## Consequences

### Positive

- Консистентные SEO-метатеги на всех публичных страницах; локаль-aware (`og:locale`, `<html lang>`).
- Admin/dev не индексируются.
- Ошибки клиента и сервера уходят в Sentry; source maps доступны в проде.

### Negative

- Нет hreflang до открытия индексации (отдельный ADR).
- Source maps upload в Turbopack-сборке требует проверки на первом прод-билде (fallback — `useRunAfterProductionCompileHook` или ручная загрузка).
- `tracesSampleRate: 1` по умолчанию — высокий объём событий; снижать в проде через env.

### Security

- `SENTRY_AUTH_TOKEN` только в CI/прод (не в клиентском бандле); `NEXT_PUBLIC_SENTRY_DSN` публичен по назначению.
- Source maps удаляются после загрузки (`deleteSourcemapsAfterUpload`).

---

## Реализация

- `shared/config/site.ts`: `url`, `ogImage`, `twitter`.
- `shared/seo/build-metadata.ts`: `buildMetadata()`.
- `app/layout.tsx`, `app/page.tsx`, `app/[game]/page.tsx`: `metadata`/`generateMetadata` через `buildMetadata`.
- `app/admin/{layout,page,suites/page,suites/import/page,login/page}.tsx`, `app/dev/game-kit/page.tsx`: `noindex`.
- `app/opengraph-image.png` (placeholder 1200×630; генератор `scripts/gen-og-image.mjs`).
- `instrumentation.ts`, `instrumentation-client.ts`, `next.config.ts` (`withSentryConfig`).
- `package.json`: `@sentry/nextjs` `11.11.0`.
- `.env.local.example`: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_TWITTER_HANDLE`, `SENTRY_ENVIRONMENT`.

---

## Критерии соответствия

- [x] `typecheck`, `lint` (0 errors), `deps:check` зелёные.
- [x] На `/`, `/alphabet`: `title`, `description`, `og:*`, `twitter:*`, `canonical`, `robots`, `<html lang>`.
- [x] Переключение RU↔EN меняет `og:locale` и тексты.
- [x] `/admin`, `/dev/game-kit` — `noindex, nofollow`.
- [x] Клиентский Sentry инициализирован (`window.__SENTRY__.version`), тестовая ошибка уходит в Sentry (envelope POST на ingest URL).
- [x] Серверный `instrumentation.ts` загружается без ошибок (`onRequestError` подключён).
