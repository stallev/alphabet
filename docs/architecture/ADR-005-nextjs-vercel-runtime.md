# ADR-005 — Политика рантайма Next.js 16 и Vercel

**Тип:** ADR  
**Статус:** Accepted  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Проверено по:** `next@16.2.6`, `prisma@7.8.0`, `engines.node` — `package.json`, 2026-10-23  
**Зависит от:** ADR-001  
**Затрагивает:** `proxy.ts`, `lib/auth.config.ts`, `lib/auth.ts`, `next.config.ts`, `package.json`

---

## Context

EdenGames размещается на **Vercel**. Next.js 16 заменил перехват запросов: канонический файл — **`proxy.ts`** (не `middleware.ts`). Профиль качества **lean** (D8) откладывает Cache Components / Instant Navigations. В корневом `AGENTS.md` и старых правилах ещё указан **Prisma 6.x** — фактический пин в `package.json` — **Prisma 7.8.x** (зафиксировано здесь).

---

## Decision — версии и хостинг

| Policy | Value |
|--------|-------|
| Next.js | **16.2.6** exact pin (`next`, `eslint-config-next`, `@next/third-parties`) |
| React | 19.x (peer Next 16) |
| Node | `engines`: `>=22 <26` (Vercel LTS) |
| Hosting | Vercel |
| ORM | Prisma **7.x** + Neon PostgreSQL v17 |
| Bundler | Turbopack (`next dev --turbopack`, `next build`) |

Bump minor/patch Next 16.2.x — в задаче с проверкой `deps:check`. Next 16.3+ / 17 — новый ADR или amend.

---

## Decision — `proxy.ts`

| Item | Policy |
|------|--------|
| Canonical file | Корневой `proxy.ts` |
| Export | `export async function proxy(request: NextRequest)` |
| Imports | Только `lib/auth.config.ts` (без Prisma) |
| `lib/auth.ts` | **Запрещён** в `proxy.ts` — только Server Actions / Route Handlers |
| Runtime | Node.js (не Edge в proxy) |

---

## Decision — async Request APIs

`cookies()`, `headers()`, `params`, `searchParams` — **await** в Server Components и handlers (Next 15+).

---

## Decision — кэш и навигация

| Item | Policy |
|------|--------|
| `cacheComponents` / `partialPrefetching` | **Не включены** как обязательная политика; вернуться отдельным ADR (D8, lean) |
| Instant Navigations | **Не принято** |
| Инвалидация | `revalidatePath` / `revalidateTag` в Server Actions и handlers |
| Новый `unstable_cache` | Не добавлять; предпочтение — явные теги и DAL |

**Примечание:** в репозитории может временно оставаться `cacheComponents: true` в `next.config.ts` до отдельной задачи; целевая политика MVP — без обязательных Cache Components.

---

## Rejected alternatives

| Альтернатива | Почему отклонена |
|--------------|------------------|
| Next.js 15 + `middleware.ts` | Устаревший перехват; проект уже на 16 |
| Floating `^16` в package.json | Нарушает `deps:check` и предсказуемость CI |
| Обязательный Instant Navigations на R01 | Удорожает каждый CU без текущей продуктовой выгоды |

---

## Consequences

### Positive

- Единый pin стека с CI и Vercel.
- Ясное разделение edge-safe auth config и server auth.

### Negative

- Расхождение legacy `AGENTS.md` (Prisma 6) до R01-CU8.
- Возможный техдолг `cacheComponents` в config vs политика ADR.

### Security

`proxy.ts` не импортирует секреты БД; admin gate на JWT role.

---

## Критерии соответствия

- [ ] `"next": "16.2.6"` в `package.json`
- [ ] `proxy.ts` существует; `middleware.ts` отсутствует
- [ ] Prisma Client — singleton из `lib/db.ts` (до R02: путь мигрирует в `server/db/`)
