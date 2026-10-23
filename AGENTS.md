# EdenGames — инструкции для AI-агентов

**EdenGames** — портал браузерных командных христианских игр; первая игра — **«Алфавит»** (Memory + викторина, наборы вопросов, AI-генерация).  
Стек: **Next.js 16.2.6** App Router · **Neon PostgreSQL 17** · **Prisma 7.8** · **Auth.js v5** (`next-auth@5.0.0-beta.31`) · **React 19.2** · **Tailwind CSS 4.3** · **Zustand 5** · **Framer Motion 12** · **Zod** · **shadcn/ui** (admin).

**Методология:** [`docs/meta/ai_first_methodology.md`](docs/meta/ai_first_methodology.md) — цикл КОНТЕКСТ → ФАЗА → КОНТРАКТ → ЗАДАЧИ → ВЕРИФИКАЦИЯ.  
**Маршрутизация моделей и DoR:** [`docs/meta/ai_agent_model_routing.md`](docs/meta/ai_agent_model_routing.md) · правило [`model-routing.mdc`](.cursor/rules/model-routing.mdc).

## Профиль качества

[`docs/meta/project_quality_profile.md`](docs/meta/project_quality_profile.md) — уровень **`lean`**: тесты на `games/*/logic`, реестр, валидаторы; review по таблице D6; a11y/perf — security floor + ручная проверка UI.

## Структура репозитория

Канон дерева — [`docs/implementation/contracts/repo_structure_contract.md`](docs/implementation/contracts/repo_structure_contract.md) §1. Сводка: `app/` (тонкие маршруты) · `games/<slug>/` · `shared/` · `server/` · `prisma/` · `docs/`. Первая игра: `games/alphabet/`. Регистрация игр — только `games/registry.ts`.

## Инварианты ([`repo_structure_contract.md`](docs/implementation/contracts/repo_structure_contract.md) §5)

1. Prisma Client — singleton [`server/db/client.ts`](server/db/client.ts).
2. `auth()` — в каждом защищённом Server Action и Route Handler; `proxy.ts` — только JWT/роль.
3. `/admin/**`, `/api/admin/**` — только `role === 'admin'`.
4. Интерактивные компоненты — `'use client'`.
5. Игра не дублирует shell/game-kit (с R03) — только `shared/game-kit`.
6. `app/` — без логики игр; страницы игр через реестр.

## Роли пользователей

| Роль | MVP |
|------|-----|
| `admin` | Наборы вопросов, JSON-import, ручное создание |
| `editor`, `subscriber` | post-MVP |

Auth MVP: **Credentials** (email + password), JWT.

## Цикл агента

```
КОНТЕКСТ → TIER/DoR → ФАЗА → КОНТРАКТ → ЗАДАЧИ (CU) → РЕАЛИЗАЦИЯ → ВЕРИФИКАЦИЯ → REVIEW → COMMIT
```

1. Этот файл + [`project-context.mdc`](.cursor/rules/project-context.mdc) + профиль качества.
2. Фаза и задачи — [`docs/implementation/phases/`](docs/implementation/phases/).
3. Читать только § из contracts/specs/ADR, на которые ссылается задача.
4. Перед кодом — применимые [`.cursor/rules/`](.cursor/rules/) (индекс: [`.cursor/rules/README.md`](.cursor/rules/README.md), skill `app-conventions`).
5. Прогон фазы — [`docs/guidelines/agent-phase-orchestration.md`](docs/guidelines/agent-phase-orchestration.md); старт: [`docs/prompts/phase-implementation.md`](docs/prompts/phase-implementation.md).

Иерархия источников истины — только в [`project-context.mdc`](.cursor/rules/project-context.mdc) § Source-of-truth order.

## Коммиты и review

| Шаг | Документ |
|-----|----------|
| Verify → stage → commit (прогон фазы) | [`.cursor/rules/agent-commit-pipeline.mdc`](.cursor/rules/agent-commit-pipeline.mdc) |
| Протокол review | [`.cursor/rules/agent-code-review-subagent.mdc`](.cursor/rules/agent-code-review-subagent.mdc) · [`docs/guidelines/ai_code_review_protocol.md`](docs/guidelines/ai_code_review_protocol.md) |

Формат: `<ветка>: type(scope): subject` (commitlint). Задача вне commit unit не коммитится.

## Точки входа в документацию

| Область | Путь |
|---------|------|
| Реестр docs, DoR, H/N/S | [`docs/meta/documentation_registry.md`](docs/meta/documentation_registry.md) |
| Шаблон задач фазы | [`docs/meta/phase_tasks.template.md`](docs/meta/phase_tasks.template.md) |
| ADR | [`docs/architecture/adr_index.md`](docs/architecture/adr_index.md) |
| Контракты | [`docs/implementation/contracts/`](docs/implementation/contracts/) |
| Игра Alphabet | [`docs/games/alphabet.md`](docs/games/alphabet.md) |
| Схема БД | [`docs/architecture/database_schema.md`](docs/architecture/database_schema.md) |
| Guidelines | [`docs/guidelines/README.md`](docs/guidelines/README.md) |
| План реструктуризации | [`docs/meta/repo_restructure_plan.md`](docs/meta/repo_restructure_plan.md) |

## Текущий статус

| Фаза | Описание |
|------|----------|
| **R01** | Процесс, правила, ADR — [`R01_phase_description.md`](docs/implementation/phases/R01_phase_description.md) |
| **R02** (завершена) | Структура кода, реестр игр — [`R02_phase_description.md`](docs/implementation/phases/R02_phase_description.md) |
| **R03** | UI-kit, i18n, шаблон игры — [`R03_phase_description.md`](docs/implementation/phases/R03_phase_description.md) |

Schema: [`prisma/schema.prisma`](prisma/schema.prisma) · миграция: [ADR-001](docs/architecture/ADR-001-migration-to-nextjs.md) · структура: [ADR-003](docs/architecture/ADR-003-repo-structure.md).

## Проверки перед коммитом

**Локально (изменён TS/скрипты):** `npm run typecheck` · `npm run lint` · при необходимости `npm run test`.  
**Pre-commit:** `lint-staged` (`eslint --fix`) + [`scripts/precommit-build-check.mjs`](scripts/precommit-build-check.mjs) (production build при изменении зависимостей/конфига).  
**CI / Phase DoD:** `docs:links` · `encoding:check` · `deps:check` · `test` · `build`.  
**Прогон фазы:** `npm run cu:verify` · `npm run cu:commit` (см. [`phase_driver_contract.md`](docs/implementation/contracts/phase_driver_contract.md)).
