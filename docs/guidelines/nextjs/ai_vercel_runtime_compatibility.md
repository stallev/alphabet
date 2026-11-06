# Vercel runtime compatibility for Next.js 16.4.5

**Project:** EdenGames — `app`  
**Technologies:** Next.js **16.4.5**, React 19, TypeScript, **Vercel**, Neon PostgreSQL  
**Canonical policy:** [ADR-005](../../architecture/ADR-005-nextjs-vercel-runtime.md), [ADR-001](../../architecture/ADR-001-migration-to-nextjs.md)

---

## 1. Why this document exists

The web app deploys on **Vercel**. Framework and hosting choices must align with [ADR-001](../../architecture/ADR-001-migration-to-nextjs.md), [ADR-005](../../architecture/ADR-005-nextjs-vercel-runtime.md), and Next.js 16 capabilities on Vercel.

**Project standard:**

- **Next.js:** `16.4.5` (pinned in root `package.json`)
- **Hosting:** Vercel
- **Bundler:** Turbopack (default)
- **Request interception:** **`proxy.ts`** canonical; `middleware.ts` temporary migration only
- **Jobs:** Vercel Cron + serverless — not `unstable_after`

---

## 2. Supported baseline (App Router on Vercel)

- Server Components, Client Components, Route Handlers
- Static, dynamic, and incremental caching (Next.js 16 cache APIs)
- **Streaming** with Suspense — first-class on Vercel
- **`next/image`** via Vercel Image Optimization
- Cache invalidation: **`revalidatePath`**, **`revalidateTag`**, **`updateTag`** (Server Actions only for `updateTag` — Context7 `/vercel/next.js`)

---

## 3. Policies (from ADR-005)

1. **Async Request APIs** — `await cookies()`, `await headers()`, `await params`, `await searchParams`
2. **Read-your-own-writes** — `updateTag` in Server Actions after mutations
3. **Stale-while-revalidate** — `revalidateTag` in Actions or Route Handlers
4. **Background work** — Vercel Cron + `delivery_log` + `idempotency_key` — not request path
5. **Webpack** — only when explicitly documented (`next build --webpack`)
6. **Cache Components / Partial Prefetching / Instant Navigations** — **не** обязательная политика MVP; включение только отдельным ADR или задачей (см. ADR-005). До принятия — ориентир на **Suspense**, **`loading.tsx`**, `revalidatePath` / `revalidateTag`.

---

## 4. Practical guidance for AI agents

- Assume **Vercel + Next.js 16.4.5** per ADR-005
- New interception → **`proxy.ts`** with `shared/domain` + `auth.config.ts` only
- Use **Suspense** / **`loading.tsx`** for streaming UX baseline (ADR-005)
- Do **not** apply Netlify-only or AWS Amplify SSR caveats to this codebase
- Hosting limits → [Vercel docs](https://vercel.com/docs), not legacy Amplify limits

---

## 5. Summary

| Area | Choice |
|------|--------|
| Hosting | **Vercel** |
| Framework | Next.js **16.4.5** |
| Interception | **`proxy.ts`** |
| Database | Neon PostgreSQL 17 |
| Async / heavy work | Cron + jobs, not `unstable_after` |
| Email | Resend |

**Reference:** EdenGames snapshot ``ai_vercel_runtime_compatibility.md`` — Netlify baseline replaced per ADR-001.
