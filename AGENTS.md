# Алфавит — Инструкции для AI-агентов

**Алфавит** — интерактивная библейская командная игра: механика Memory (поиск пар букв) + бонусная викторина с ИИ-генерацией вопросов.  
Стек: **Next.js 16.2.6 App Router** + **Neon PostgreSQL v17** + **Auth.js v5** + **Prisma** + **TailwindCSS v4** + **Zustand** + **Framer Motion**.

**Методология:** [`docs/meta/documentation_creation_guide.md`](docs/meta/documentation_creation_guide.md) — цикл КОНТЕКСТ → ФАЗА → КОНТРАКТ → ЗАДАЧИ → ВЕРИФИКАЦИЯ.

---

## Структура проекта

| Путь | Назначение |
|------|------------|
| [`app/`](app/) | Next.js App Router — страницы, layouts, API routes |
| [`app/(game)/`](app/(game)/) | Игровые маршруты (публичные) |
| [`app/admin/`](app/admin/) | Административная панель (role: `admin`) |
| [`app/api/`](app/api/) | Route Handlers (Auth.js, Admin API) |
| [`components/`](components/) | React UI-компоненты (все — `'use client'`) |
| [`lib/`](lib/) | Server-only утилиты: auth, db, validators |
| [`prisma/`](prisma/) | Prisma schema, migrations, seed |
| [`data/`](data/) | Статические JSON-файлы (исторические наборы, seed-данные) |
| [`docs/`](docs/) | Документация проекта |
| [`docs/meta/`](docs/meta/) | Методология и гиды по документированию |
| [`docs/architecture/`](docs/architecture/) | ADR (Architecture Decision Records) |
| [`store.ts`](store.ts) | Zustand — клиентский игровой стейт |
| [`types.ts`](types.ts) | Общие TypeScript-типы |

---

## Технический стек (canonical)

| Слой | Технология | Версия |
|------|-----------|--------|
| Framework | Next.js App Router | **16.2.6** |
| Runtime | Node.js (Vercel) | LTS |
| Language | TypeScript | 5.x |
| Database | Neon PostgreSQL | v17 |
| ORM | Prisma | 6.x |
| Auth | Auth.js (NextAuth) | v5 (`next-auth@beta`) |
| UI | React | 19.x |
| State (client) | Zustand | 5.x |
| Animation | Framer Motion | 12.x |
| Styling | TailwindCSS | v4 |
| Components | shadcn/ui | latest |
| AI | Google Gemini / OpenRouter | — |

---

## Роли пользователей

| Роль | Описание |
|------|---------|
| `admin` | Управление наборами вопросов, загрузка через JSON, ручное создание |
| `editor` | (post-MVP) Создание и редактирование наборов |
| `subscriber` | (post-MVP) Доступ к расширенным наборам |

Аутентификация: **Credentials (email + password)** на MVP.  
Post-MVP: Google OAuth + роли `editor`, `subscriber`.

---

## База данных

**Schema canonical:** [`prisma/schema.prisma`](prisma/schema.prisma)  
**DDL документация:** [`docs/architecture/database_schema.md`](docs/architecture/database_schema.md)

Ключевые модели:
- `User` — пользователи (id, email, passwordHash, role)
- `QuestionSuite` — наборы вопросов (title, language, isSystem, source)
- `Question` — вопросы (content, complexityLevel, answersList, answerType)

---

## Аутентификация (Auth.js v5)

**Split config (обязательно):**
- `lib/auth.config.ts` — JWT callbacks, pages, providers (без Prisma) → используется в `proxy.ts` (Next.js 16)
- `src/auth.ts` — полный Auth.js с Prisma (`import "server-only"`) → используется в Server Actions и Route Handlers

**Защита маршрутов:**
- `proxy.ts` — JWT role gate (только `lib/auth.config.ts`, без DB) — **Next.js 16 заменил middleware.ts**
- Layout-уровень — UX-редиректы для незалогиненных
- Route Handler / Server Action уровень — обязательная проверка `auth()`

---

## Данные (Data Layer)

- **Server Actions** (`src/actions/`) — тонкие: вызывают DAL, затем `revalidatePath`/`revalidateTag`/`redirect`
- **Route Handlers** (`app/api/`) — для JSON API, внешних интеграций
- **DAL** (`src/data/`) — функции доступа к данным с `import "server-only"`
- **Валидация** — Zod-схемы в `src/lib/validators/`

---

## Cursor Rules

| Rule | Glob | Описание |
|------|------|---------|
| `alphabet-project-context` | `**` | Контекст проекта и источники истины |
| `nextjs-app-router` | `app/**`, `src/**` | Next.js 15 App Router паттерны |
| `auth-security` | `**/auth*`, `**/api/**` | Auth.js v5 безопасность |
| `data-layer-prisma` | `**/data/**`, `**/actions/**` | Prisma + DAL паттерны |
| `react-component-patterns` | `components/**` | React компоненты |

Все правила: [`.cursor/rules/`](.cursor/rules/)

---

## Иерархия источников истины

При конфликте: **Cursor Rules** → **AGENTS.md** → **ADR** → **PRD/docs** → **prototype/examples**.

---

## Цикл работы агента

```
КОНТЕКСТ → ФАЗА → КОНТРАКТ → ЗАДАЧИ → ВЕРИФИКАЦИЯ
```

1. Прочитать этот файл и `.cursor/rules/alphabet-project-context.mdc`
2. Определить текущую фазу реализации из [`docs/meta/documentation_creation_guide.md`](docs/meta/documentation_creation_guide.md)
3. Прочитать соответствующий ADR/contract для изменений
4. Выполнить задачи с соблюдением паттернов из Cursor Rules
5. Верифицировать: нет нарушений архитектурных инвариантов

---

## Архитектурные инварианты (нельзя нарушать)

- `lib/db.ts` — единственный источник Prisma Client (singleton)
- `src/auth.config.ts` — **без** Prisma-импортов (используется в middleware)
- `src/auth.ts` — `import "server-only"`, только Server Actions и Route Handlers
- `components/**` — все клиентские компоненты используют `'use client'`
- Server Actions и Route Handlers — обязательная проверка `auth()` для защищённых операций
- `admin/**` маршруты — доступны только при `role === 'admin'`
- Prisma Client не используется в middleware/Edge runtime

---

## Текущий статус

**Фаза:** P02 — Neon PostgreSQL + Auth.js v5 + Admin JSON Import  
**Предыдущее состояние:** Vite + React SPA (без DB, без auth)  
**Миграция:** [ADR-001](docs/architecture/ADR-001-migration-to-nextjs.md)

### Чеклист верификации

- [ ] Все компоненты в `components/` имеют `'use client'`
- [ ] `middleware.ts` использует только `auth.config.ts` (без Prisma)
- [ ] Admin маршруты защищены проверкой роли
- [ ] Prisma Client — singleton в `lib/db.ts`
- [ ] Zod-валидация для всех входящих JSON данных
- [ ] Набор JSON при импорте проходит валидацию по схеме
