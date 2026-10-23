# R02 Tasks — Перестройка репозитория и перенос Alphabet

**Тип:** Tasks  
**Статус:** Draft (до Phase DoR audit; написан заранее, см. D14)  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Фаза:** R02  
**Зависит от:** [`R02_phase_description.md`](R02_phase_description.md), [`alphabet_migration_spec.md`](../specs/alphabet_migration_spec.md), контракты [`repo_structure`](../contracts/repo_structure_contract.md) · [`game_manifest`](../contracts/game_manifest_contract.md) · [`game_routing`](../contracts/game_routing_contract.md)  
**Связанные документы:** [`ai_agent_model_routing.md`](../../meta/ai_agent_model_routing.md), [`agent-phase-orchestration.md`](../../guidelines/agent-phase-orchestration.md)

---

## Purpose

Перестроить репозиторий по ADR-003 и перенести Alphabet в `games/alphabet` без изменения поведения; DoD — в [`R02_phase_description.md`](R02_phase_description.md#phase-dod). Фаза выполняется драйвером: `node scripts/run-phase.mjs R02 --environment cursor` (запуск — [`docs/prompts/phase-implementation.md`](../../prompts/phase-implementation.md)).

Общее правило для всех CU: перенос файла — `git mv`; в одном CU не смешивать перенос и изменение логики; **сборка (`typecheck`, `lint`, `test`, `build`) зелёная на границе каждого CU**.

## Phase DoR audit

Один вызов `architect` в режиме `spec-gap`: сверить [`alphabet_migration_spec.md`](../specs/alphabet_migration_spec.md) §2 с `git ls-files` после R01 (имена файлов, количество компонентов — «18» в §2.2), актуализировать пути в этом файле, подтвердить, что все ссылки открываются.

- [ ] Все задачи прошли DoR — дата · исполнитель · изменённые документы
- [ ] Спецификация переноса сверена с фактическим деревом
- [ ] Dev-БД доступна, `admin`-учётка существует (для smoke)

## Commit plan

### R02-CU1 — feat(games): add game registry, manifest types and import boundaries · Review: diff-only · Smoke: none · Commit: auto

- [x] R02-T1 · T1 · Spec: [manifest §1](../contracts/game_manifest_contract.md) · Contract: [structure §1](../contracts/repo_structure_contract.md)
      Files: `shared/domain/locale.ts`, `shared/game-kit/manifest.ts`, `shared/game-kit/manifest.test.ts`, `types.ts`
      Acceptance: `Locale`, `ACTIVE_LOCALES = ['ru','en']`, `DEFAULT_LOCALE` определены в `shared/domain/locale.ts` (тип `Locale` по-прежнему включает `uk|de|ro`); `manifest.ts` содержит типы и `defineGame` по §1 контракта; `types.ts` временно реэкспортирует `Locale` из нового места (мост, удаляется в R02-CU3) → `npm run typecheck` = 0; тесты манифеста зелёные
      Paths: H [manifest §1] · N [manifest §3.1: невалидные поля]
- [x] R02-T2 · T1 · Spec: [manifest §2–§4](../contracts/game_manifest_contract.md)
      Files: `games/reserved-slugs.ts`, `games/registry.ts`, `games/registry.test.ts`
      Acceptance: `RESERVED_SLUGS`, `GAME_ENTRIES` (пока пустой), `listGames`, `getGameEntry`, `assertValidRegistry` по контракту; тесты покрывают каждую строку таблицы §3.1 на фикстурах (формат/зарезервированный/дубликат slug, active без `loadPage`, coming-soon с `loadPage`, длины текстов, теги, команды, обложка), сортировку `listGames` → `npm run test` зелёный
      Paths: H [manifest §3] · N [manifest §3.1: каждая строка таблицы]
- [x] R02-T3 · T2 · Spec: [structure §3, §3.1](../contracts/repo_structure_contract.md)
      Files: `eslint.config.mjs`, `tsconfig.json`, `scripts/lint-fixtures/boundary-violation.ts`, `scripts/check-boundaries.test.mjs`, `.cursor/rules/import-boundaries.mdc`, `.cursor/rules/README.md`
      Acceptance: `eslint.config.mjs` формирует `no-restricted-imports` программно по `games/*` (кроме `_template`) и общим блокам `shared/**`, `server/**`; `scripts/lint-fixtures/` исключён из обычного `lint` и из `tsconfig.json`; тест запускает ESLint на фикстуре через Node API и ожидает ошибку границы для: `shared → games`, `shared → server`, `games/a → games/b`, `games/a (не server) → server`, `server → games`; правило `import-boundaries.mdc` (`globs: games/**,shared/**,server/**`) ссылается на контракт (не копирует его) и добавлено в манифест → `npm run lint` = 0; `npm run test` зелёный
      Paths: H [structure §3.1] · N [структура без игр: правила не падают]

**CU DoD:** `npm run typecheck` · `npm run lint` · `npm run test` · `npm run build`

### R02-CU2 — refactor(server): move auth and db to server · Review: reviewer · Smoke: none · Commit: auto

- [x] R02-T4 · T3 · Spec: [migration §2.1](../specs/alphabet_migration_spec.md) · Contract: [structure §5](../contracts/repo_structure_contract.md) п. 1–3
      Files: `server/db/client.ts`, `server/auth/auth.ts`, `server/auth/auth.config.ts`, `server/auth/verify-credentials.server.ts`, `lib/db.ts`, `lib/auth.ts`, `lib/auth.config.ts`, `src/data/auth/verify-credentials.server.ts`, `proxy.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/admin/**`, `app/api/**`, `prisma/seed.ts`, `prisma/import-suites.ts`, `types/next-auth.d.ts`
      Acceptance: файлы перенесены `git mv`; все импорты `@/lib/db`, `@/lib/auth`, `@/lib/auth.config`, `@/src/data/auth/*` заменены; `auth.config.ts` по-прежнему не импортирует Prisma; `auth.ts` и `verify-credentials.server.ts` сохраняют `import "server-only"`; `proxy.ts` использует только `@/server/auth/auth.config`; логика `authorize()`, callbacks, matcher и проверки ролей **не изменены** (diff — только пути) → `rg "@/lib/(db|auth)" .` вне `docs/` пуст; `typecheck`/`lint`/`build` зелёные
      Paths: H [spec §2.1] · N [prisma-скрипты запускаются: `npm run db:generate`] · S [structure §5 п. 2–3; authz «anon × /admin → 307 /admin/login», «anon × POST /api/admin/suites → 307/401 как до переноса», «non-admin × /admin → редирект как до переноса»]
      UI: n/a — серверный код · Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · ручная проверка трёх S-кейсов (результат в отчёте CU, сравнение «до/после» по `curl -i` / браузеру)

### R02-CU3 — refactor(games): move alphabet client code to games/alphabet · Review: diff-only · Smoke: deferred · Commit: auto

- [x] R02-T5 · T1 · Spec: [migration §2.2](../specs/alphabet_migration_spec.md)
      Files: `shared/providers/AuthSessionProvider.tsx`, `shared/lib/cn.ts`, `shared/i18n/locales.ts`, `components/AuthSessionProvider.tsx`, `lib/utils.ts`, `app/layout.tsx`
      Acceptance: `AuthSessionProvider` → `shared/providers/`; `cn` → `shared/lib/cn.ts` (все `import { cn }` обновлены); `LOCALE_META` перенесён в `shared/i18n/locales.ts` с полем `active`; `app/layout.tsx` использует новый провайдер → `rg "@/lib/utils|@/components/AuthSessionProvider"` пуст
      Paths: n/a — behavior-preserving refactor
- [x] R02-T6 · T2 · Spec: [migration §2.2](../specs/alphabet_migration_spec.md)
      Files: `games/alphabet/types.ts`, `games/alphabet/constants.ts`, `games/alphabet/i18n/translations.ts`, `games/alphabet/store.ts`, `games/alphabet/lib/audio.ts`, `types.ts`, `constants.ts`, `store.ts`, `utils/audio.ts`
      Acceptance: `types.ts`/`constants.ts` разделены по таблице §2.2 (мост `Locale` из R02-T1 удалён, `Locale` импортируется из `@/shared/domain/locale`); `TRANSLATIONS` перенесён **без изменения содержимого** (5 локалей); `store.ts` → `games/alphabet/store.ts` без изменения логики; корневые `types.ts`, `constants.ts`, `store.ts`, `utils/` удалены → `rg "from '(\.\./)+(store|types|constants)'" games shared` пуст
      Paths: n/a — behavior-preserving refactor
- [x] R02-T7 · T2 · Spec: [migration §2.2](../specs/alphabet_migration_spec.md)
      Files: `games/alphabet/components/**`, `games/alphabet/page.tsx`, `components/**`, `App.tsx`, `app/game/page.tsx`
      Acceptance: 18 компонентов игры перенесены в `games/alphabet/components/`; `App.tsx` и `components/GameApp.tsx` слиты в `games/alphabet/components/GameApp.tsx` (без изменения разметки и поведения); `app/game/page.tsx` → `games/alphabet/page.tsx` с default-экспортом по `GamePageComponent` (принимает `{ locale }`, пока игнорируется); временный `app/game/page.tsx` = тонкая обёртка `import Page from '@/games/alphabet/page'` (удаляется в R02-CU5) → `/game` по-прежнему открывает игру; в `components/` остаётся только `admin/`
      Paths: n/a — behavior-preserving refactor
      UI: /game · roles: public · widths: 360,768,1280
      Seed: n/a
- [x] R02-T8 · T1 · Spec: [migration §2.2](../specs/alphabet_migration_spec.md), [`game_kit_contract §3`](../contracts/game_kit_contract.md) (только для сверки: kit в R03)
      Files: `games/alphabet/logic/scoring.ts`, `games/alphabet/logic/scoring.test.ts`
      Acceptance: если подсчёт очков (`SCORE_MATCH`, `SCORE_EASY/MEDIUM/HARD`) реализован внутри `store.ts` — вынесена **чистая функция** `pointsForAnswer(level, correct)` и `pointsForMatch()` с неизменной семантикой, `store.ts` использует её; тест покрывает уровни и неверный ответ; иных изменений store нет → `npm run test` зелёный; если такой логики в store нет — задача закрывается записью «n/a» в отчёте CU
      Paths: H [текущая семантика подсчёта] · N [неверный ответ → 0 очков]

**CU DoD:** `typecheck` · `lint` · `test` · `build` · UI-check `/game` на 360/768/1280 (строка `UI-check:`) · rg-проверки из [migration §4](../specs/alphabet_migration_spec.md)

### R02-CU4 — refactor(games): move alphabet data and server code · Review: reviewer · Smoke: none · Commit: auto

- [x] R02-T9 · T3 · Spec: [migration §2.3](../specs/alphabet_migration_spec.md) · Contract: [structure §2, §3, §5](../contracts/repo_structure_contract.md)
      Files: `games/alphabet/data/**`, `games/alphabet/validators/suite-import.ts`, `games/alphabet/server/**`, `app/admin/_components/**`, `app/admin/**`, `app/api/**`, `data/**`, `lib/demo-questions.ts`, `lib/validators/suite-import.ts`, `src/**`, `components/admin/**`, `prisma/seed.ts`, `prisma/import-suites.ts`
      Acceptance: перенос по таблице §2.3; `get-suites.server.ts`, `import-suite.server.ts` и actions сохраняют `import "server-only"` / `'use server'` и **те же проверки `auth()`**; `app/admin/**` и `app/api/**` меняются только импортами; пути к `data/` в `prisma/seed.ts` и `prisma/import-suites.ts` обновлены → `npm run db:import -- --help` (или сухой запуск) и `npm run db:seed` выполняются на dev-БД без ошибок и без дублей; `rg "@/(lib|src|components/admin)"` вне `docs/` пуст; границы (линтер) соблюдены
      Paths: H [spec §2.3] · N [импорт невалидного JSON → та же ошибка валидации, что до переноса] · S [authz: anon × POST /api/admin/suites → отказ как до переноса; non-admin × server action delete-suite → отказ как до переноса; GET /api/suites без изменений]
      UI: /admin, /admin/suites, /admin/suites/import · roles: admin · widths: 1280
      Seed: dev-учётка admin существует

**CU DoD:** `typecheck` · `lint` · `test` · `build` · smoke админки (вход → список → импорт тестового JSON → удаление) · три S-кейса (результат в отчёте)

### R02-CU5 — feat(portal): add game route, alphabet manifest and catalog stub · Review: reviewer · Smoke: blocking · Commit: auto

- [ ] R02-T10 · T2 · Spec: [manifest §1–§3](../contracts/game_manifest_contract.md) · Spec: [migration §2.4](../specs/alphabet_migration_spec.md)
      Files: `games/alphabet/manifest.ts`, `games/registry.ts`, `public/games/alphabet/cover.webp`
      Acceptance: манифест по таблице §2.4 (значения полей — как в спецификации; `description` — из `docs/GAME_DESCRIPTION.md`); запись добавлена в `GAME_ENTRIES`; временная обложка 16:9 ≤ 20 КБ → `games/registry.test.ts` проходит на реальном реестре (`assertValidRegistry(GAME_ENTRIES)` без ошибок)
      Paths: H [manifest §3.2] · N [manifest §3.1: реальный манифест проходит все проверки]
- [ ] R02-T11 · T2 · Spec: [routing §1–§3](../contracts/game_routing_contract.md)
      Files: `app/[game]/page.tsx`, `app/[game]/error.tsx`, `app/[game]/loading.tsx`, `app/[game]/page.test.ts`, `app/game/page.tsx`, `next.config.ts`
      Acceptance: `generateStaticParams` возвращает slug'и реестра и вызывает `assertValidRegistry`; `dynamicParams = false`; `GamePage` вызывает `loadPage()` активной игры, для `coming-soon` — `notFound()` (до R03); `generateMetadata` по контракту; временный `app/game/page.tsx` удалён; в `next.config.ts` постоянный редирект `/game` → `/alphabet`; тест проверяет `generateStaticParams` → `/alphabet` играбелен; `/game` → 308 на `/alphabet`; `/Alphabet`, `/nonexistent` → 404
      Paths: H [routing §1] · N [routing §1: неизвестный slug, регистр] · S [`next.config.*` в sensitive zone: редирект не создаёт открытого редиректа — цель фиксирована]
      UI: /alphabet · roles: public · widths: 360,768,1280
      Seed: n/a
- [ ] R02-T12 · T1 · Spec: [routing §1](../contracts/game_routing_contract.md) строка `/`
      Files: `app/page.tsx`
      Acceptance: серверная страница рендерит минимальный каталог: заголовок и список карточек (название, слоган на `ru`, ссылка `/slug`) из `listGames()`, без оформления сверх текущих стилей приложения; `redirect('/game')` удалён → `/` показывает карточку Alphabet с рабочей ссылкой
      Paths: H [routing §1] · N [пустой реестр → текст «Игр пока нет», без ошибки]
      UI: / · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · UI-check `/` и `/alphabet` на 360/768/1280 · **ручной smoke владельца** по [`alphabet_migration_spec.md` §4](../specs/alphabet_migration_spec.md) (`Smoke: blocking` — драйвер останавливается до подтверждения)

### R02-CU6 — chore(config): remove vite remnants and legacy files · Review: diff-only · Smoke: none · Commit: auto

- [ ] R02-T13 · T1 · Spec: [migration §2.5](../specs/alphabet_migration_spec.md)
      Files: `index.tsx`, `index.html`, `vite.config.ts`, `metadata.json`, `App.tsx`, `SPECIFICATION.md`, `docs/archive/SPECIFICATION.md`, `tsconfig.json`, `package.json`, `package-lock.json`
      Acceptance: каждый файл предварительно проверен `rg` на отсутствие ссылок (результат в отчёте); удалены; `SPECIFICATION.md` перенесён в архив; из `tsconfig.json` убран `vite.config.ts` в `exclude`; зависимости, нужные только Vite, удалены **только** при подтверждении `rg`; `package-lock.json` обновлён (`npm install`), версии остальных зависимостей не изменились → `npm run deps:check`, `typecheck`, `lint`, `test`, `build` зелёные; в корне нет файлов из Phase DoD (последний пункт)
      Paths: n/a — cleanup
- [ ] R02-T14 · T1 · Spec: [structure §6](../contracts/repo_structure_contract.md)
      Files: `docs/implementation/phases/R02_tasks.md`
      Acceptance: выполнены проверки структуры §6 контракта (4 пункта) — результаты записаны в Verification ниже; остатки старых путей (`rg` из migration §4) пусты
      Paths: n/a — docs-only

**CU DoD:** `deps:check` · `typecheck` · `lint` · `test` · `build` · rg-проверки

### R02-CU7 — docs(docs): document alphabet, schema and structure · Review: diff-only · Smoke: deferred · Commit: auto

- [ ] R02-T15 · T1 · Spec: [migration §2.6](../specs/alphabet_migration_spec.md) · Template: [`game_description.template.md`](../../meta/templates/game_description.template.md)
      Files: `docs/games/alphabet.md`, `docs/games/alphabet/ai_system.md`, `docs/games/alphabet/ui_components.md`, `docs/games/alphabet/state_management.md`, `docs/OVERVIEW.md`, `docs/GAME_DESCRIPTION.md`, `docs/AI_SYSTEM.md`, `docs/UI_COMPONENTS.md`, `docs/STATE_MANAGEMENT.md`
      Acceptance: `docs/games/alphabet.md` = объединение `OVERVIEW.md` и `GAME_DESCRIPTION.md` по шаблону (правила, механика, команды, режимы, ссылки на manifest/i18n/data); остальные три файла перенесены `git mv` и поправлены пути (`components/…` → `games/alphabet/components/…`); в старых местах остаются заглушки из 3 строк со ссылкой → `docs:links` = 0
      Paths: n/a — docs-only
- [ ] R02-T16 · T1 · Spec: [migration §2.6](../specs/alphabet_migration_spec.md) · Contract: [structure §2](../contracts/repo_structure_contract.md)
      Files: `docs/architecture/database_schema.md`
      Acceptance: сгенерирован по `prisma/schema.prisma` (модели `User`, `QuestionSuite`, `Question`, enum'ы), у каждой модели — владелец (`портал` для `User`, `games/alphabet` для остальных), правила доступа (кто читает/пишет); формат `docs:links`-совместим
      Paths: n/a — docs-only
- [ ] R02-T17 · T1 · Spec: [product-docs-alignment](../../../.cursor/rules/product-docs-alignment.mdc)
      Files: `AGENTS.md`, `.cursor/rules/README.md`, `.cursor/skills/app-conventions/SKILL.md`, `docs/architecture/ADR-003-repo-structure.md`, `docs/architecture/i18n-approach.md`
      Acceptance: в `AGENTS.md` блок «Структура» стал фактическим (без пометок «целевая»), статус фазы — `R02 завершена`; индекс skill и манифест правил обновлены; в ADR-003 добавлен раздел «Реализация» со ссылкой на коммиты/CU R02; в `i18n-approach.md` пути к файлам исправлены на новые (`games/alphabet/…`, `shared/i18n/locales.ts`) → `AGENTS.md` ≤ 120 строк; `docs:links` = 0
      Paths: n/a — docs-only

**CU DoD:** `docs:links` · `encoding:check` · повторный ручной smoke Alphabet ([migration §4](../specs/alphabet_migration_spec.md)) — отложен до конца фазы (`Smoke: deferred`)

## Verification (phase)

- [ ] Все CU закоммичены; у каждого trace `Review: …`
- [ ] Phase DoD из [`R02_phase_description.md`](R02_phase_description.md#phase-dod)
- [ ] Структура §6 контракта: _(результат)_
- [ ] Ручной smoke Alphabet (после CU5 и после CU7): _(владелец подтвердил, дата)_
- [ ] S-кейсы «до/после» (CU2, CU4): _(результаты)_
- [ ] У каждого CU с `UI:` в ответе есть строка `UI-check: … ok`

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [`R02_phase_description.md`](R02_phase_description.md) | DoD фазы |
| [`alphabet_migration_spec.md`](../specs/alphabet_migration_spec.md) | Таблицы переноса |
| [`R03_phase_description.md`](R03_phase_description.md) | Следующая фаза |
