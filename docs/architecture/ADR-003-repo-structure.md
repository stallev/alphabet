# ADR-003 — Структура репозитория (single-app, games, shared, server)

**Тип:** ADR  
**Статус:** Accepted  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`repo_restructure_plan.md`](../meta/repo_restructure_plan.md) §0 D1–D3, D7; ADR-001  
**Затрагивает:** [`repo_structure_contract.md`](../implementation/contracts/repo_structure_contract.md)

---

## Context

Проект мигрировал с Vite SPA на Next.js (ADR-001). Владелец принял цель: **каталог христианских игр** EdenGames с единым порталом и модульными играми, без монорепозитория. Текущий код ещё в legacy-раскладке (`components/`, `lib/`, корневой `store.ts`); целевая структура достигается в фазах R02–R03.

---

## Decision

1. **Одно Next.js-приложение** в корне репозитория. Нет `apps/*`, `packages/*`, npm workspaces.
2. **Игры** — каталоги `games/<slug>/` с манифестом и точкой входа; регистрация только в `games/registry.ts`.
3. **Общий код** — `shared/` (`ui`, `game-kit`, `i18n`, `domain`, `lib`, `config`, `providers`, `styles`).
4. **Серверная инфраструктура** — `server/auth/`, `server/db/` (Prisma singleton, Auth.js split config).
5. **Маршруты** — тонкий слой `app/` (каталог, `app/[game]`, `admin`, `api`).
6. **Данные игры** — только в `games/<slug>/data/` и DAL игры (`games/<slug>/server/`). Таблицы `QuestionSuite` / `Question` принадлежат игре Alphabet.
7. **Границы импортов** — по [`repo_structure_contract.md`](../implementation/contracts/repo_structure_contract.md) §3–§5 (`@/…`, без импорта игры из игры, без `server/*` в клиенте).

---

## Rejected alternatives

| Альтернатива | Почему отклонена |
|--------------|------------------|
| Монорепо `apps/web` + `packages/*` | Два деплоя и дублирование конфигурации без выгоды для размера проекта (D1) |
| Общий банк вопросов в БД для всех игр | Нарушает изоляцию игр; усложняет права и миграции (D7) |
| Игры только в `app/` без `games/` | Смешивает маршрутизацию Next.js с доменной логикой игры |

---

## Consequences

### Positive

- Одна сборка и один Vercel-проект.
- Добавление игры = папка + строка в реестре.
- Чёткие границы для ESLint и ревью.

### Negative / trade-offs

- Крупный рефакторинг в R02 (перенос Alphabet).
- Документация и `AGENTS.md` отстают до R01-CU8.

### Security

N/A — структура каталогов; auth остаётся по ADR-001 и guidelines.

---

## Реализация (фаза R02)

Структура §1 [`repo_structure_contract.md`](../implementation/contracts/repo_structure_contract.md) внедрена коммитами R02:

| CU | Commit | Subject |
|----|--------|---------|
| R02-CU1 | `c5cee76` | feat(games): registry, manifest types, import boundaries |
| R02-CU2 | `9190a43` | refactor(server): auth and db → `server/` |
| R02-CU3 | `f123415` | refactor(games): alphabet client → `games/alphabet/` |
| R02-CU4 | `11a85fa` | refactor(games): alphabet data and server code |
| R02-CU5 | `c6eb93c` | feat(portal): `[game]` route, manifest, catalog |
| R02-CU6 | `583cb37` | chore(config): remove Vite remnants |
| R02-CU7 | _(этот CU)_ | docs: alphabet, `database_schema.md`, `AGENTS.md` |

Документация игры: [`docs/games/alphabet.md`](../games/alphabet.md). Схема БД: [`database_schema.md`](./database_schema.md).

---

## Критерии соответствия

- [ ] Дерево соответствует §1 `repo_structure_contract.md`
- [ ] `QuestionSuite` / `Question` читаются только из `games/alphabet/server/` (после R02)
- [ ] Нет `new PrismaClient()` вне `server/db/`
