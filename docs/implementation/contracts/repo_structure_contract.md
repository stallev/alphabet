# Контракт структуры репозитория

**Тип:** Contract  
**Статус:** Draft (становится Canonical после R02)  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** решения D1–D3, D7 в [`repo_restructure_plan.md`](../../meta/repo_restructure_plan.md) §0; ADR-003 (создаётся в R01)  
**Используется в:** [`R02_phase_description.md`](../phases/R02_phase_description.md), [`R03_phase_description.md`](../phases/R03_phase_description.md)

---

## §1 Целевое дерево

```
app/                          # Next.js App Router — только маршруты и тонкие обёртки
  layout.tsx  globals.css
  page.tsx                    # каталог игр (/)
  [game]/page.tsx             # игра по slug (/alphabet)
  admin/**                    # админка (role: admin)
  api/**                      # Route Handlers
games/
  registry.ts                 # единственное место регистрации игр
  reserved-slugs.ts           # зарезервированные slug'и
  _template/                  # заготовка новой игры (R03), НЕ регистрируется
  <slug>/                     # одна папка = одна игра
    manifest.ts               # GameManifest
    page.tsx                  # серверная точка входа (default export: GamePageComponent)
    components/               # UI, специфичный для игры
    logic/                    # чистые функции (без React, без I/O), тесты рядом
    data/                     # статические данные игры (JSON, .ts)
    i18n/                     # словари игры (ru.ts, en.ts)
    server/                   # *.server.ts, Server Actions — доступ к БД и внешним API
    validators/               # Zod-схемы игры
    store.ts  types.ts  constants.ts
shared/
  ui/                         # примитивы дизайн-системы (Button, Dialog, …), без знаний об играх
  game-kit/                   # каркас игры (GameShell, ScoreBoard, …) — R03
  i18n/                       # локали, провайдер, словари портала
  domain/                     # общие типы и константы (Locale, роли)
  lib/                        # утилиты (cn, …)
  config/                     # site.ts (имя портала, indexable)
  providers/                  # клиентские провайдеры уровня приложения
  styles/                     # tokens.css (R03)
server/
  auth/                       # auth.ts, auth.config.ts, verify-credentials
  db/                         # client.ts (Prisma singleton)
prisma/                       # schema.prisma, migrations, seed.ts, import-suites.ts
public/games/<slug>/          # статические ресурсы игры (cover.webp, звуки)
scripts/                      # служебные скрипты (docs:links, драйвер фаз)
docs/                         # документация (см. AGENTS.md)
```

## §2 Что куда класть

| Артефакт | Место |
|----------|-------|
| Маршрут, layout, loading, error | `app/**` |
| Компонент, нужный одной игре | `games/<slug>/components/` |
| Компонент, нужный ≥ 2 играм или порталу | `shared/game-kit/` (игровой каркас) или `shared/ui/` (примитив) |
| Правила подсчёта, генерация колоды, проверка ответа | `games/<slug>/logic/` + тест `*.test.ts` рядом |
| Строки интерфейса игры | `games/<slug>/i18n/` |
| Строки портала и game-kit | `shared/i18n/` |
| Запросы к БД, Server Actions игры | `games/<slug>/server/` |
| Prisma Client, Auth.js | `server/db/`, `server/auth/` |
| Данные вопросов игры (JSON) | `games/<slug>/data/` |
| Картинки/звуки игры | `public/games/<slug>/` |
| Общие типы (`Locale`, роли) | `shared/domain/` |
| Функции без React, нужные ≥ 2 модулям | `shared/lib/` |

**Данные игры принадлежат игре (D7).** Таблицы `QuestionSuite` и `Question` — таблицы игры Alphabet; доступ к ним — только из `games/alphabet/server/` и из админки Alphabet. Общей таблицы вопросов нет. Новая игра с БД добавляет свои модели с префиксом slug (например, `QuizSuite`) и свой каталог `games/<slug>/server/`.

## §3 Границы импортов

Импорты между модулями — только через алиас `@/…`. Относительные импорты допустимы внутри одной папки верхнего уровня игры или `shared/<подпапка>`.

| Откуда ↓ \ Что импортирует → | `shared/**` | `server/**` | `games/<эта>/**` | `games/<другая>/**` | `games/registry` | `app/**` |
|-----|:---:|:---:|:---:|:---:|:---:|:---:|
| `shared/**` | да | **нет** | **нет** | **нет** | **нет** | нет |
| `server/**` | да | да | **нет** | **нет** | **нет** | нет |
| `games/<g>/**` (кроме `server/`) | да | **нет** | да | **нет** | **нет** | нет |
| `games/<g>/server/**` | да | да | да | **нет** | **нет** | нет |
| `games/registry.ts` | да | нет | `manifest.ts`, `page.tsx` через `import()` | то же для каждой игры | — | нет |
| `app/**` (публичные страницы) | да | да | нет (только через registry) | нет | да | да |
| `app/admin/**`, `app/api/**` | да | да | да, `games/<g>/server/**` и `validators/**` | да (явно, по необходимости) | да | да |

Дополнительно:

- Клиентский файл (`'use client'`) не импортирует `server/**` и `*.server.ts` (защищает `import "server-only"`).
- `server/auth/auth.config.ts` не импортирует Prisma (его читает `proxy.ts`).
- `proxy.ts` не импортирует `games/**`.

### §3.1 Как проверяется

`eslint.config.mjs` строит правила `no-restricted-imports` **программно**: читает `games/*` (кроме `_template`), для каждой игры формирует блок `files: ["games/<g>/**"]` с запретом `@/games/<другая>/**`, `@/server/**` (кроме блока `games/<g>/server/**`) и `@/app/**`. Общие блоки: `shared/**` и `server/**` запрещают `@/games/**`. Новая игра подхватывается автоматически. Нарушение — ошибка `npm run lint`.

Проверка работоспособности правил — тест-фикстуры в `scripts/lint-fixtures/` (файл-нарушитель, который обязан давать ошибку линтера; запускается тестом `scripts/check-boundaries.test.mjs`).

## §4 Именование

| Объект | Правило |
|--------|---------|
| Папка игры / slug | `kebab-case`, `/^[a-z][a-z0-9-]{1,31}$/`, не зарезервирован, равен имени папки |
| React-компонент | `PascalCase.tsx`, один компонент на файл, именованный экспорт |
| Модуль логики | `kebab-case.ts`, тест `kebab-case.test.ts` рядом |
| Серверный DAL | `*.server.ts` с `import "server-only"` |
| Server Action | `games/<slug>/server/actions/<verb>-<noun>.ts` с `'use server'` |
| Константы | `UPPER_SNAKE_CASE`, коды/роли — не inline-строки (см. правило `domain-literals-and-codes`) |

## §5 Инварианты (нельзя нарушать)

1. `server/db/client.ts` — единственный источник Prisma Client (singleton).
2. Проверка `auth()` — в каждом Server Action и Route Handler защищённой операции; `proxy.ts` — только грубая проверка роли по JWT.
3. `/admin/**` и `/api/admin/**` доступны только при `role === 'admin'`.
4. Каждый интерактивный компонент (хуки, события, браузерные API) — `'use client'`.
5. Игра не определяет собственные шапку, табло, модалку вопроса, экран победы (с R03) — только использует `shared/game-kit`.
6. Корневой `app/` не содержит логики игр: страницы — тонкие обёртки.

## §6 Критерии соответствия (Checklist)

- [ ] Дерево репозитория соответствует §1 (нет «корневых» `components/`, `lib/`, `src/`, `utils/`, `types/`, `store.ts` и т. п. — исключение: `types/next-auth.d.ts`)
- [ ] `npm run lint` падает на файле-нарушителе из `scripts/lint-fixtures/`
- [ ] `rg "from '@/games/(?!alphabet)" games/alphabet` пуст
- [ ] `rg "@/server" shared games --glob '!games/*/server/**'` пуст
