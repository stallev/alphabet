# ADR-001 — Миграция с Vite+React SPA на Next.js App Router

**Status:** Accepted — реализовано; структура репозитория пересмотрена в [ADR-003](./ADR-003-repo-structure.md); текущий пин Next.js и рантайм Vercel — [ADR-005](./ADR-005-nextjs-vercel-runtime.md)  
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

**Мигрировать проект с Vite + React SPA на Next.js App Router.** Текущее целевое состояние стека зафиксировано в [ADR-005](./ADR-005-nextjs-vercel-runtime.md): **Next.js 16.x** (точный пин в корневом `package.json`), **`proxy.ts`** вместо `middleware.ts`, Prisma **7.x** + Neon.

### Технические решения (итог)

| Аспект | До (Vite SPA) | После (текущий репозиторий) |
|--------|-------------|-------------------|
| Build tool | Vite 6.x | Next.js 16 (Turbopack) |
| Routing | Hash-based (`#rules`) | Next.js App Router |
| Styling | TailwindCSS via CDN | TailwindCSS v4 via npm |
| Database | ❌ Нет | Prisma 7 + Neon PostgreSQL v17 |
| Auth | ❌ Нет | Auth.js v5 (Credentials, JWT) |
| State | Zustand (client) | Zustand (client) + RSC data fetching |
| Client components | Все компоненты | `'use client'` директива |
| Server Actions | ❌ Нет | Server Actions + Route Handlers |
| Route protection | ❌ Нет | JWT role gate в **`proxy.ts`** (см. ADR-005) |

### Версия Next.js (актуальная)

Текущий пин: см. **ADR-005** и корневой `package.json`. Исторически планировалась миграция через Next.js 15; фактическая кодовая база — **Next.js 16** с каноническим **`proxy.ts`**.

---

## Migration Plan

План ниже отражает **исходные фазы миграции**; отдельные пункты устарели по сравнению с текущей структурой (`server/`, `games/`, `proxy.ts` — см. ADR-003, ADR-005). Оставлен как архивный чеклист.

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

- [ ] Создать `lib/auth.config.ts` (без Prisma в конфиге, пригодном для `proxy.ts`)
- [ ] Создать `lib/auth.ts` (server-only, Credentials provider)
- [ ] Настроить защиту маршрутов через **`proxy.ts`** (не `middleware.ts` — см. ADR-005)
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

- [Next.js App Router docs](https://nextjs.org/docs)
- [Auth.js v5 для Next.js](https://authjs.dev/getting-started/installation?framework=Next.js)
- [Prisma + Next.js](https://www.prisma.io/nextjs)
- [Neon + Prisma](https://neon.tech/docs/guides/prisma)
- [ADR-005 — политика рантайма Next.js 16 и Vercel](./ADR-005-nextjs-vercel-runtime.md)
- Референсный каталог `docs/examples/ai_first_tmp` в репозиторий не входит.
