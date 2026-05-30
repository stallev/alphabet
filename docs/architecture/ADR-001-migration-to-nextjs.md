# ADR-001 — Миграция с Vite+React SPA на Next.js 15 App Router

**Status:** Accepted  
**Date:** 2026-05-30  
**Authors:** AI Agent (Cursor)

---

## Context

Проект «Алфавит» изначально разработан как **Vite + React SPA** без серверного рендеринга, базы данных и аутентификации.

**Причины для миграции:**

1. **Хранение наборов вопросов в PostgreSQL** — SPA не имеет серверного слоя для работы с БД. Прямое подключение к Neon Postgres из браузера небезопасно (утечка credentials).

2. **Auth.js v5** — официально поддерживается только для Next.js (и Remix/SvelteKit). Credentials provider с JWT требует серверного runtime.

3. **Admin роль** — защита маршрутов администратора требует server-side проверки JWT токена (не client-side, так как легко обходится).

4. **JSON Import API** — endpoint для загрузки наборов через JSON нужен защищённый серверный API с валидацией.

5. **Будущие требования** — Google OAuth, роли editor/subscriber, ISR для публичных наборов — всё это нативно поддерживается Next.js.

6. **Референсный проект (fitapp/Pulse)** использует Next.js — единообразие архитектурных паттернов.

---

## Decision

**Мигрировать проект с Vite + React SPA на Next.js 15 App Router.**

### Технические решения

| Аспект | До (Vite SPA) | После (Next.js 15) |
|--------|-------------|-------------------|
| Build tool | Vite 6.x | Next.js 15 (Turbopack) |
| Routing | Hash-based (`#rules`) | Next.js App Router |
| Styling | TailwindCSS via CDN | TailwindCSS v4 via npm |
| Database | ❌ Нет | Prisma 6 + Neon PostgreSQL v17 |
| Auth | ❌ Нет | Auth.js v5 (Credentials, JWT) |
| State | Zustand (client) | Zustand (client) + RSC data fetching |
| Client components | Все компоненты | `'use client'` директива |
| Server Actions | ❌ Нет | `src/actions/` |
| Data Layer | ❌ Нет | `src/data/` (server-only) |

### Версия Next.js

Используется **Next.js 15.x** (стабильная ветка):
- Полная поддержка App Router
- React 19 совместимость
- Async Request APIs (`await cookies()`, `await headers()`)
- Middleware для route protection
- Server Actions stable

> **Примечание:** Референсный проект fitapp использует Next.js 16.2.6 с `proxy.ts` вместо `middleware.ts`. Для «Алфавит» используется Next.js 15.x с `middleware.ts` как стандартное и стабильное решение. Миграция на Next.js 16 — в будущем ADR.

---

## Migration Plan

### Phase 1 — Foundation (P02)

- [ ] Заменить `package.json` (Vite → Next.js, добавить Prisma, Auth.js)
- [ ] Создать `next.config.ts`
- [ ] Создать `app/layout.tsx`, `app/globals.css`
- [ ] Настроить TailwindCSS v4 через npm
- [ ] Перенести игровые компоненты (`'use client'`)
- [ ] Настроить `tsconfig.json` для Next.js
- [ ] Переместить статические файлы в `public/data/`

### Phase 2 — Database (P02)

- [ ] Создать `prisma/schema.prisma` (User, QuestionSuite, Question)
- [ ] Создать `lib/db.ts` (Prisma singleton)
- [ ] Запустить `prisma migrate dev`
- [ ] Создать seed: системные наборы из `data/*.json`
- [ ] Создать seed: admin user

### Phase 3 — Auth (P02)

- [ ] Создать `lib/auth.config.ts` (Edge-safe, без Prisma)
- [ ] Создать `lib/auth.ts` (server-only, Credentials provider)
- [ ] Создать `middleware.ts` (route protection)
- [ ] Создать `app/admin/login/page.tsx` (login form)
- [ ] Создать `types/next-auth.d.ts` (type augmentation)

### Phase 4 — Admin Panel (P03)

- [ ] Создать `app/admin/layout.tsx`
- [ ] Создать `app/admin/page.tsx` (dashboard)
- [ ] Создать `app/admin/suites/page.tsx` (suites list)
- [ ] Создать `app/admin/suites/import/page.tsx` (JSON import)
- [ ] Создать `src/actions/admin/import-suite.ts`
- [ ] Создать `src/data/suites/` (DAL)
- [ ] Создать API: `app/api/admin/suites/route.ts`

---

## Consequences

### Плюсы

- Полноценный серверный runtime → безопасная работа с БД и auth
- Auth.js v5 с JWT + role-based access control
- Server Actions → простые и типобезопасные мутации
- Colocated data fetching в Server Components
- Готовность к Google OAuth, ISR, CDN кэшированию
- Единообразие с referencing project (fitapp)

### Минусы

- Значительный объём изменений (новый build toolchain)
- Все существующие компоненты нужно пометить `'use client'`
- Tailwind CDN → npm: нужен postcss config
- Vite-specific import maps (`esm.sh`) нужно заменить на npm пакеты
- Локальная разработка: Next.js чуть медленнее Vite для hot reload

### Нейтрально

- Zustand остаётся — клиентский игровой стейт не меняется
- Framer Motion остаётся — только клиентские компоненты
- Существующие типы (`types.ts`) переиспользуются

---

## Alternatives Considered

| Альтернатива | Причина отклонения |
|-------------|-------------------|
| Vite + отдельный Express API | Два runtime, сложнее деплой, нет интеграции с Auth.js Next.js adapter |
| Remix | Команда не знакома, референсный проект — Next.js |
| Next.js Pages Router | App Router — modern default, RSC, Server Actions. Pages Router устаревает |
| SvelteKit | Смена экосистемы (React → Svelte) |
| Nuxt.js | Смена языка (React → Vue) |

---

## References

- [Next.js 15 App Router docs](https://nextjs.org/docs)
- [Auth.js v5 для Next.js](https://authjs.dev/getting-started/installation?framework=Next.js)
- [Prisma + Next.js](https://www.prisma.io/nextjs)
- [Neon + Prisma](https://neon.tech/docs/guides/prisma)
- Референсный проект: [`docs/examples/fitapp/`](../examples/fitapp/)
