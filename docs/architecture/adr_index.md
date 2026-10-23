# ADR Index — EdenGames

**Тип:** Index  
**Статус:** Canonical  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Owner:** Architecture

**Методология:** [`docs/meta/ai_first_methodology.md`](../meta/ai_first_methodology.md)

---

## Purpose

Единый реестр Architecture Decision Records (ADR) для EdenGames. Агенты **MUST** проверять этот индекс перед принятием архитектурных решений, меняющих стек, границы модулей, auth, кэш или структуру репозитория.

---

## ADR registry

| ID | File | Status | Topic | Summary |
|----|------|--------|-------|---------|
| ADR-001 | [`ADR-001-migration-to-nextjs.md`](./ADR-001-migration-to-nextjs.md) | **Accepted** (реализовано) | Vite → Next.js | Миграция с SPA на Next.js App Router, Prisma, Auth.js |
| ADR-002 | [`ADR-002-ai-generator.md`](./ADR-002-ai-generator.md) | **Accepted** | AI generator | Серверный API, demo mode; владелец — `games/alphabet` (ADR-003) |
| ADR-003 | [`ADR-003-repo-structure.md`](./ADR-003-repo-structure.md) | **Accepted** | Repo structure | Одно приложение, `games/`, `shared/`, `server/`, границы импортов |
| ADR-004 | [`ADR-004-game-routing-and-registry.md`](./ADR-004-game-routing-and-registry.md) | **Accepted** | Game routing | `/<slug>`, реестр, зарезервированные slug'и, редирект `/game` |
| ADR-005 | [`ADR-005-nextjs-vercel-runtime.md`](./ADR-005-nextjs-vercel-runtime.md) | **Accepted** | Next.js runtime | Pin Next.js 16.2.6, Vercel, `proxy.ts`, Prisma 7; без Instant Navigations |
| ADR-006 | [`ADR-006-i18n-and-game-data.md`](./ADR-006-i18n-and-game-data.md) | **Accepted** | i18n & data | RU/EN, cookie `locale`, данные у каждой игры |

---

## Naming convention

- Файл: `ADR-NNN-kebab-case-topic.md` (трёхзначный номер).
- Новый ADR: следующий свободный номер в таблице + запись здесь в той же задаче.
- Процесс: [`decision_process.md`](./decision_process.md).

---

## Context7 verification (runtime ADR)

Перед изменением ADR-005 или auth-модели агент **SHOULD** сверить API через Context7:

| Topic | Library |
|-------|---------|
| `proxy.ts` | `/vercel/next.js` |
| Auth.js JWT + roles | `/websites/authjs_dev` |
| Prisma + Neon | `/prisma/docs` |

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [`decision_process.md`](./decision_process.md) | Создание и обновление ADR |
| [`documentation_registry.md`](../meta/documentation_registry.md) | DoR и пути H/N/S |
| [`repo_restructure_plan.md`](../meta/repo_restructure_plan.md) | Решения D1–D12 |
