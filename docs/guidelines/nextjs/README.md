# Next.js guidelines — EdenGames

**Baseline:** Next.js **16.2.6** App Router · Vercel · Neon + Prisma  
**Методология:** [`ai_first_methodology.md`](../../meta/ai_first_methodology.md)  
**Контракт рантайма:** ADR-005 (создаётся в R01-CU7)

## Документы

| Файл | Тема |
|------|------|
| [ai_data_fetching_patterns.md](./ai_data_fetching_patterns.md) | RSC, Server Actions, кэш, дедуп |
| [ai_loading_patterns.md](./ai_loading_patterns.md) | `loading.tsx`, Suspense, streaming |
| [ai_client_lazy_loading.md](./ai_client_lazy_loading.md) | `next/dynamic`, тяжёлые client-deps |
| [ai_vercel_runtime_compatibility.md](./ai_vercel_runtime_compatibility.md) | Vercel + Node runtime |
| [ai_nextjs_db_data_handle.md](./ai_nextjs_db_data_handle.md) | DAL, Actions vs Route Handlers |

## Принципы

1. **Server Components по умолчанию**; client — только при hooks/browser APIs.
2. **`proxy.ts`** для перехвата запросов; `auth.config.ts` без Prisma.
3. **Prisma** только через `lib/db.ts`; мутации с `auth()` и Zod.
4. **Cache Components / Instant Navigations** — не включены; решение отдельным ADR.
5. Образец API — Context7 `/vercel/next.js` и версия из `package.json`.

**Cursor rules:** `nextjs-vercel-app-router.mdc`, `data-server-actions-and-api.mdc`, `app-router-streaming-loading.mdc`.
