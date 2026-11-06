# Circle — инструкции для AI-агентов

**Circle** — портал браузерных командных христианских игр; первая игра — **«Алфавит»** (Memory + викторина, наборы вопросов, AI-генерация).  
Стек: **Next.js 16.2.6** App Router · **Neon PostgreSQL 17** · **Prisma 7.8** · **Auth.js v5** · **React 19.2** · **Tailwind CSS 4.3** · **Zustand 5** · **Framer Motion 12** · **Zod** · **shadcn/ui** (admin).

**Методология:** [`docs/meta/ai_first_methodology.md`](docs/meta/ai_first_methodology.md) · **Маршрутизация:** [`model-routing.mdc`](.cursor/rules/model-routing.mdc).

## Профиль качества

[`project_quality_profile.md`](docs/meta/project_quality_profile.md) — **`lean`**: тесты на `games/*/logic`, реестр, валидаторы; UI — security floor + ручная проверка.

## Структура

Канон: [`repo_structure_contract.md`](docs/implementation/contracts/repo_structure_contract.md) §1 — `app/` · `games/<slug>/` · `shared/` · `server/` · `prisma/` · `docs/`. Регистрация игр — `games/registry.ts`. Новая игра: [`docs/adding-a-game.md`](docs/adding-a-game.md), шаблон `games/_template/`.

## Инварианты

1. Prisma — singleton [`server/db/client.ts`](server/db/client.ts).
2. `auth()` в защищённых actions/handlers; `proxy.ts` — JWT/роль.
3. `/admin/**`, `/api/admin/**` — только `admin`.
4. Интерактив — `'use client'`.
5. Игры — `shared/game-kit`, не дублировать shell.
6. `app/` — без логики игр; маршруты через реестр.

## Роли (MVP)

| Роль | MVP |
|------|-----|
| `admin` | Наборы вопросов, JSON-import |
| `editor`, `subscriber` | post-MVP |

Auth: Credentials, JWT.

## Цикл агента

КОНТЕКСТ → TIER/DoR → ФАЗА → КОНТРАКТ → CU → РЕАЛИЗАЦИЯ → ВЕРИФИКАЦИЯ → REVIEW → COMMIT ([`agent-commit-pipeline.mdc`](.cursor/rules/agent-commit-pipeline.mdc)).

## Точки входа

| Область | Путь |
|---------|------|
| Фазы / задачи | [`docs/implementation/phases/`](docs/implementation/phases/) |
| Контракты | [`docs/implementation/contracts/`](docs/implementation/contracts/) |
| Game kit | [`game_kit_contract.md`](docs/implementation/contracts/game_kit_contract.md) · dev [`/dev/game-kit`](app/dev/game-kit/) |
| Добавить игру | [`docs/adding-a-game.md`](docs/adding-a-game.md) |
| i18n | [`i18n_contract.md`](docs/implementation/contracts/i18n_contract.md) |
| SEO metadata | [`shared/seo/build-metadata.ts`](shared/seo/build-metadata.ts) · [`shared/config/site.ts`](shared/config/site.ts) · OG-картинка `app/opengraph-image.png` (генератор `scripts/gen-og-image.mjs`) |
| Sentry | `instrumentation.ts` (сервер/edge, `onRequestError`) · `instrumentation-client.ts` (браузер) · `withSentryConfig` в [`next.config.ts`](next.config.ts) · env `NEXT_PUBLIC_SENTRY_DSN` |
| Дизайн «Утренний свет» | [`docs/design/DESIGN.md`](docs/design/DESIGN.md) |
| Alphabet | [`docs/games/alphabet.md`](docs/games/alphabet.md) |
| Rules index | [`.cursor/rules/README.md`](.cursor/rules/README.md) · skill `app-conventions` |

## Статус фаз

| Фаза | Описание |
|------|----------|
| R01–R02 | Завершены |
| **R03** | **Завершена** — UI-kit, i18n cookie, каталог Circle, шаблон игры ([`R03_phase_description.md`](docs/implementation/phases/R03_phase_description.md)) |
| R04 | Редизайн Alphabet и admin (черновик) |

Schema: [`prisma/schema.prisma`](prisma/schema.prisma) · ADR: [001](docs/architecture/ADR-001-migration-to-nextjs.md), [003](docs/architecture/ADR-003-repo-structure.md), [007](docs/architecture/ADR-007-seo-and-sentry.md).

## Проверки

Локально: `npm run typecheck` · `lint` · `test` · `tokens:check`. CI / Phase DoD: `docs:links` · `encoding:check` · `deps:check` · `build`. Прогон фазы: `cu:verify` · `cu:commit`.
