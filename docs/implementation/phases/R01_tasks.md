# R01 Tasks — Основа процесса

**Тип:** Tasks  
**Статус:** Draft  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Фаза:** R01  
**Зависит от:** [`R01_phase_description.md`](R01_phase_description.md), [`repo_restructure_plan.md`](../../meta/repo_restructure_plan.md) (§A.2–§A.8)  
**Связанные документы:** [`phase_tasks.template.md`](../../examples/ai_first_tmp/docs/meta/phase_tasks.template.md) (до переноса — в шаблоне)

---

## Purpose

Перенести и адаптировать методологию, правила, guidelines, скрипты и ADR из `docs/examples/ai_first_tmp/` по белому списку плана; DoD — в [`R01_phase_description.md`](R01_phase_description.md#phase-dod).

**Режим выполнения R01 — через драйвер.** Скрипты драйвера (`scripts/phase-driver.mjs`, `run-phase.mjs`, `cu-verify.mjs`, `cu-commit.mjs`, `precommit-build-check.mjs`, `check-build-isolation.mjs` и тесты) уже написаны и закоммичены **до старта фазы** ([`phase_driver_contract.md`](../contracts/phase_driver_contract.md), [`cu_boundary_scripts_contract.md`](../contracts/cu_boundary_scripts_contract.md), [`precommit_build_gate_contract.md`](../contracts/precommit_build_gate_contract.md)). Фаза идёт командой `node scripts/run-phase.mjs R01 --environment cursor`. Пока инструменты не установлены (R01-CU1), `cu-verify` пропускает отсутствующие шаги; hook коммита подключается в R01-CU2, поэтому CU1 коммитится без hook. Если драйвер недоступен — CU выполняются вручную по тем же правилам.

**Ссылки вперёд.** До R01-CU8 `npm run docs:links` может сообщать только о ссылках из `docs/implementation/**` и `docs/meta/repo_restructure_plan.md` на документы, которые создают последующие CU. В отчёте CU фиксируется, что список содержит только такие ссылки; к R01-T32 он пуст. Поэтому `docs:links` не входит в `cu-verify` и в DoD CU1–CU7 как обязательный.

**Источник переноса** — всегда `docs/examples/ai_first_tmp/…` (read-only). Правила адаптации — [`repo_restructure_plan.md` §A.5](../../meta/repo_restructure_plan.md); решения «взять/адаптировать/не брать» — §A.4. При сомнении, брать или нет, — **не брать** и записать вопрос в отчёт CU.

**Профиль качества** до создания `project_quality_profile.md` (R01-CU3) — `lean`.

## Phase DoR audit

Выполняется до первой задачи: один вызов `architect` в режиме `spec-gap` (профиль `lean` допускает self-audit оркестратором inline).

- [ ] Все задачи прошли DoR — дата · исполнитель · изменённые документы
- [ ] Открытые вопросы плана (профиль `lean`, имя портала `EdenGames`) подтверждены владельцем или приняты по умолчанию
- [ ] Ветка `R01-process-foundation` создана от `master`; в ней закоммичены плановые документы, контракты и скрипты драйвера (`chore(config): add phase driver scripts and contracts`), рабочее дерево чистое, `.local/` в `.gitignore`

## Commit plan

<!-- Грамматика заголовка CU и формат задач — phase_tasks.template.md. Ветка-префикс добавляется автоматически (<branch>: type(scope): subject). -->

### R01-CU1 — chore(config): add doc checks, eslint and test runner · Review: diff-only · Smoke: none · Commit: auto

- [x] R01-T1 · T1 · Spec: [plan §A.4.5](../../meta/repo_restructure_plan.md)
      Files: `scripts/check-doc-links.mjs`, `scripts/check-text-encoding.mjs`, `scripts/check-exact-deps.mjs`, `package.json`
      Acceptance: скрипты скопированы из `docs/examples/ai_first_tmp/scripts/`; `check-doc-links` адаптирован — исключает `docs/examples/`, `docs/archive/`, `node_modules/`, `.next/`; в `package.json` добавлены `docs:links`, `encoding:check`, `deps:check` → `npm run encoding:check` = 0; `npm run docs:links` выводит только ссылки вперёд (см. «Ссылки вперёд»), реальные битые ссылки исправлены
      Paths: n/a — tooling
- [x] R01-T2 · T1 · Spec: [phase §Принятые решения](R01_phase_description.md#принятые-решения-для-фазы)
      Files: `eslint.config.mjs`, `package.json`
      Acceptance: создан flat-config на `eslint-config-next` (core-web-vitals + typescript), игнорирует `.next/`, `generated/`, `docs/examples/`, `docs/archive/`, `node_modules/`; `scripts/**/*.mjs` линтуются с node-окружением (globals `process`, `console`, `URL`…); скрипт `lint` заменён на `eslint .` (`next lint` в Next.js 16 отсутствует) → `npm run lint` выходит с кодом 0; правила, дающие ошибки на унаследованном коде, понижены до `warn` с комментарием `// legacy: <причина>`; число предупреждений и список понижений записаны в отчёт CU
      Paths: n/a — tooling
- [x] R01-T3 · T1 · Spec: [plan §A.2](../../meta/repo_restructure_plan.md)
      Files: `package.json`, `package-lock.json`
      Acceptance: все `dependencies`/`devDependencies` без `^`/`~` с версиями, уже установленными по lock-файлу; `engines.node` задан; `typescript` закреплён точно → `npm run deps:check` = 0, `npm ci && npm run build` проходит
      Paths: n/a — tooling
- [x] R01-T4 · T1 · Spec: [plan §A.2](../../meta/repo_restructure_plan.md)
      Files: `vitest.config.mjs`, `package.json`, `package-lock.json`
      Acceptance: установлен `vitest` (точная версия); конфиг покрывает `**/*.test.{ts,tsx,mjs}`, исключает `docs/examples`, `node_modules`, `.next`; алиас `@/` → корень; скрипты `test` (`vitest run`), `typecheck` (`tsc --noEmit`) → `npm run test` выполняет существующие тесты скриптов (`scripts/phase-driver.test.mjs`, `check-build-isolation.test.mjs`, `precommit-build-check.test.mjs` — 39 тестов) и они зелёные, `npm run typecheck` = 0 (ошибки типов унаследованного кода, если есть, исправлены минимально или записаны в отчёт и скрыты не `ts-ignore`, а явным списком — вопрос владельцу)
      Paths: n/a — tooling

**CU DoD:** `npm run encoding:check` · `npm run deps:check` · `npm run lint` · `npm run typecheck` · `npm run test` · `npm run build`

### R01-CU2 — chore(config): add commit hooks, ci and phase driver · Review: diff-only · Smoke: none · Commit: auto

- [x] R01-T5 · T1 · Spec: [plan §A.4.5](../../meta/repo_restructure_plan.md)
      Files: `commitlint.config.mjs`, `.husky/commit-msg`, `.husky/pre-commit`, `package.json`, `package-lock.json`
      Acceptance: установлены `@commitlint/cli`, `@commitlint/config-conventional`, `husky`, `lint-staged` (точные версии); конфиг commitlint из `docs/examples/ai_first_tmp/scaffold/` (опциональный префикс `<ветка>: `); `prepare` безопасен вне git/на Vercel (`HUSKY=0` или условный запуск); `lint-staged`: `*.{ts,tsx,js,jsx,mjs}` → `eslint --fix`; `.husky/pre-commit` = `npx --no -- lint-staged` + `node scripts/precommit-build-check.mjs` ([`precommit_build_gate_contract.md` §4](../contracts/precommit_build_gate_contract.md)); в `package.json` скрипт `build:check` → `echo "R01-process-foundation: chore(config): test" | npx commitlint` проходит, `echo "bad message" | npx commitlint` — падает; `npm run deps:check` = 0
      Paths: n/a — tooling
- [x] R01-T6 · T1 · Spec: [plan §A.4.5](../../meta/repo_restructure_plan.md)
      Files: `.github/workflows/ci.yml`
      Acceptance: из `scaffold/.github/workflows/ci.template.yml` оставлен один job `verify` (Node по `engines`, `npm ci`, `typecheck`, `lint`, `test`, `docs:links`, `encoding:check`, `deps:check`, `build` с фиктивными значениями `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`; [`precommit_build_gate_contract.md` §2.3](../contracts/precommit_build_gate_contract.md)); без jobs `test`/`e2e`; `rules:check` не используется → YAML валиден (проверка `node -e` парсером или `actionlint`, если доступен)
      Paths: n/a — ci
- [x] R01-T7 · T2 · Contract: [phase_driver §1–§6](../contracts/phase_driver_contract.md) · [cu_boundary_scripts §2–§3](../contracts/cu_boundary_scripts_contract.md)
      Files: `package.json`, `.cursorignore`
      Acceptance: скрипты драйвера уже в репозитории (проверка: `git ls-files scripts` содержит `phase-driver.mjs`, `run-phase.mjs`, `cu-verify.mjs`, `cu-commit.mjs`, `precommit-build-check.mjs`, `check-build-isolation.mjs` и три `*.test.mjs`); в `package.json` добавлены `cu:verify` (`node scripts/cu-verify.mjs`), `cu:commit`, `phase:run` (`node scripts/run-phase.mjs`); `.cursorignore` содержит `docs/examples/`, `docs/archive/`, `node_modules/`, `.next/`, `generated/`; выполнены критерии соответствия §8 [phase_driver_contract](../contracts/phase_driver_contract.md) → `npm run test` зелёный; `node scripts/run-phase.mjs R01 --environment cursor` на дереве с одним завершённым CU печатает `STATUS: cu R01-CU2` (проверка на временной копии файла задач, не коммитится); `node scripts/cu-verify.mjs` сообщает `cu-verify: ok`
      Paths: H [phase_driver §8] · N [неверный id фазы (`X01`) → `run-phase: phase`; отсутствующий файл задач → ошибка; `cu-commit ... --amend` → `forbidden`]

- [x] R01-T7a · T1 · Spec: [`prompts/phase-implementation.md`](../../examples/ai_first_tmp/prompts/phase-implementation.md), [`prompts/launch-prompts.md`](../../examples/ai_first_tmp/prompts/launch-prompts.md)
      Files: `docs/prompts/phase-implementation.md`, `docs/prompts/launch-prompts.md`
      Acceptance: перенесены и адаптированы: идентификаторы `R{NN}`, путь `docs/implementation/phases/R{NN}_tasks.md`, среда по умолчанию — Cursor AI, раздел Claude Code и dev-учётки удалены; в `launch-prompts.md` оставлены только фразы запуска фазы, Phase DoR audit и возобновления прогона → пример стартовой фразы для R02 присутствует; фразы согласованы с [`phase_driver_contract.md` §4](../contracts/phase_driver_contract.md)
      Paths: n/a — docs-only

**CU DoD:** `npm run typecheck` · `npm run lint` · `npm run test` · `npm run deps:check` · проверка commitlint (см. T5) · гейт сборки: тестовый коммит с изменением `package.json` запускает три шага `precommit-build-check` (см. T5) · dry-run драйвера (см. T7)

### R01-CU3 — docs(docs): add methodology, quality profile and templates · Review: diff-only · Smoke: none · Commit: auto

- [x] R01-T8 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/meta/ai_first_methodology.md`, `docs/meta/ai_agent_model_routing.md`, `docs/meta/phase_tasks.template.md`
      Acceptance: перенесены из `ai_first_project_methodology.md`, `ai_agent_model_routing.md`, `phase_tasks.template.md`; удалено всё про Pulse/волны W0–W14/monorepo; пути в примерах — `docs/implementation/phases/R0N_*`; пример CU использует scope из [phase §Принятые решения](R01_phase_description.md#принятые-решения-для-фазы) → `rg -i "pulse|monorepo|apps/web|packages/|\{\{" docs/meta` пуст (кроме `repo_restructure_plan.md`)
      Paths: n/a — docs-only
- [x] R01-T9 · T1 · Spec: [plan §A.2](../../meta/repo_restructure_plan.md)
      Files: `docs/meta/project_quality_profile.md`
      Acceptance: создан из `project_quality_profile.template.md`: уровень `lean`; значения D2–D11 заполнены (тесты — на `games/*/logic`, реестр, валидаторы; review — по таблице `lean`; a11y/perf — по security floor и ручной проверке); включённые/выключенные модули стека — как в плане §A.2 → в документе нет незаполненных `{{…}}`/`TBD`
      Paths: n/a — docs-only
- [x] R01-T10 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/meta/documentation_registry.md`
      Acceptance: ≤ 150 строк; содержит критерии путей H/N/S (из §2.3.2a реестра шаблона) и DoR-чеклист (§2.3.6), адаптированные под `lean`, плюс таблицу «документ → где живёт → статус» для создаваемых в R01–R03 документов → ссылки открываются
      Paths: n/a — docs-only
- [x] R01-T11 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/meta/templates/prd.template.md`, `docs/meta/templates/contract.template.md`, `docs/meta/templates/spec.template.md`, `docs/meta/templates/adr.template.md`, `docs/meta/templates/game_description.template.md`
      Acceptance: у каждого шаблона шапка метаданных (Тип, Статус, Версия, Дата, Зависит от), разделы-заготовки и критерии соответствия (структура — как у существующих [`contracts/*`](../contracts/) и [`specs/*`](../specs/)); `adr.template.md` — Status/Context/Decision/Rejected alternatives/Consequences; `game_description.template.md` — правила, механика, количество игроков/команд, материалы, ссылки на manifest и i18n
      Paths: n/a — docs-only

**CU DoD:** `npm run encoding:check` · grep-проверка из T8

### R01-CU4 — docs(rules): add tier 0 rules and agents · Review: diff-only · Smoke: none · Commit: auto

- [ ] R01-T12 · T2 · Spec: [plan §A.4.3, tier 0](../../meta/repo_restructure_plan.md)
      Files: `.cursor/rules/agent-commit-pipeline.mdc`, `.cursor/rules/agent-code-review-subagent.mdc`, `.cursor/rules/model-routing.mdc`, `.cursor/rules/product-docs-alignment.mdc`, `.cursor/rules/ai-dry-deduplication.mdc`, `.cursor/rules/domain-literals-and-codes.mdc`, `.cursor/rules/typescript-types.mdc`
      Acceptance: правила перенесены из `.cursor/rules/tiers/t0-always/` и адаптированы по таблице tier 0 плана (scope коммитов, sensitive zones, `shared/domain`, одно приложение); `alwaysApply: true`; каждый ≤ 150 строк; ссылки на несуществующие в проекте документы отсутствуют (или помечены «создаётся в R0N») → `rg -i "pulse|monorepo|PACKAGE_SCOPE|rules:sync|\.claude" .cursor/rules` пуст
      Paths: n/a — docs-only
- [ ] R01-T13 · T2 · Spec: [plan §A.4.3](../../meta/repo_restructure_plan.md), [plan §A.6](../../meta/repo_restructure_plan.md)
      Files: `.cursor/rules/project-context.mdc`, `.cursor/rules/alphabet-project-context.mdc`
      Acceptance: `project-context.mdc` создан из `project-context.template.mdc` (`alwaysApply: true`): продукт EdenGames, стек (Next.js 16.2.6, Prisma 7, Auth.js v5, Tailwind v4, Zustand, Framer Motion), профиль качества, **единственная** иерархия источников истины (Cursor Rules → AGENTS.md → ADR → Contracts → PRD → Guidelines → Specs/примеры), ссылки на `docs/implementation/contracts/*`; `alphabet-project-context.mdc` удалён (его содержимое учтено в `project-context.mdc` и в ADR-003) → иерархия источников нигде, кроме `project-context.mdc`, не перечислена
      Paths: n/a — docs-only
- [ ] R01-T14 · T1 · Spec: [plan §A.4.2](../../meta/repo_restructure_plan.md)
      Files: `.cursor/agents/architect.md`, `.cursor/agents/implementer.md`, `.cursor/agents/reviewer.md`
      Acceptance: скопированы из шаблона, убраны Pulse/monorepo; модели и режимы (`readonly` у `reviewer`) сохранены; пути к правилам и документам актуальны
      Paths: n/a — docs-only

**CU DoD:** `npm run encoding:check` · grep из T12

### R01-CU5 — docs(rules): add tier 1–2 rules, skill and manifest · Review: diff-only · Smoke: none · Commit: auto

- [ ] R01-T15 · T2 · Spec: [plan §A.4.3, tier 1](../../meta/repo_restructure_plan.md)
      Files: `.cursor/rules/nextjs-vercel-app-router.mdc`, `.cursor/rules/auth-security.mdc`, `.cursor/rules/data-server-actions-and-api.mdc`, `.cursor/rules/security-xss-csrf.mdc`, `.cursor/rules/dependency-pinning.mdc`, `.cursor/rules/javascript-fundamentals.mdc`, `.cursor/rules/testing.mdc`, `.cursor/rules/app-router-streaming-loading.mdc`, `.cursor/rules/nextjs-app-router.mdc`, `.cursor/rules/data-layer-prisma.mdc`, `.cursor/rules/admin-json-import.mdc`
      Acceptance: перенесены по таблице tier 1 плана: `auth-security` и `data-server-actions-and-api` объединены с текущими `auth-security`/`data-layer-prisma` (текущая Prisma/Neon-специфика сохранена); `nextjs-app-router` слит в `nextjs-vercel-app-router` (файл `nextjs-app-router.mdc` удалён), `data-layer-prisma` слит в `data-server-actions-and-api` (файл удалён); `admin-json-import.mdc` оставлен с пометкой «область: games/alphabet после R02»; у каждого `globs`; `cacheComponents`/Instant Navigations не заявлены обязательными → `.cursor/rules` не содержит правил из списка «Не переносить»
      Paths: n/a — docs-only
- [ ] R01-T16 · T2 · Spec: [plan §A.4.3, tier 2](../../meta/repo_restructure_plan.md)
      Files: `.cursor/rules/react-one-component-per-file.mdc`, `.cursor/rules/react-naming-conventions.mdc`, `.cursor/rules/react-logic-presentation.mdc`, `.cursor/rules/react-ui-components.mdc`, `.cursor/rules/react-state-management.mdc`, `.cursor/rules/react-component-patterns.mdc`, `.cursor/rules/ui-design-system.mdc`, `.cursor/rules/ui-mobile-first.mdc`, `.cursor/rules/ui-semantics-a11y.mdc`, `.cursor/rules/ui-icons-lucide.mdc`, `.cursor/rules/ui-animation-performance.mdc`, `.cursor/rules/ui-toast-mutations.mdc`, `.cursor/rules/ui-messages-and-copy.mdc`, `.cursor/rules/ui-messages-bundle-splitting.mdc`, `.cursor/rules/ui-mutation-pending.mdc`, `.cursor/rules/ui-optimistic-mutations.mdc`, `.cursor/rules/admin-forms-layout.mdc`, `.cursor/rules/patterns-tables-dnd.mdc`
      Acceptance: перенесены по таблице tier 2; `react-component-patterns` слит в `react-ui-components` (файл `react-component-patterns.mdc` удалён); `ui-design-system.mdc` описывает токены, запрет «сырых» цветов, `shared/ui` + `shared/game-kit` как единственные источники UI (ссылка на [`design_tokens_contract.md`](../contracts/design_tokens_contract.md) и [`game_kit_contract.md`](../contracts/game_kit_contract.md)); `ui-messages-*` описывают словари `shared/i18n` и `games/<slug>/i18n` ([`i18n_contract.md`](../contracts/i18n_contract.md)); `ui-mutation-pending`, `ui-optimistic-mutations`, `admin-forms-layout`, `patterns-tables-dnd` — `alwaysApply: false`, без `globs`
      Paths: n/a — docs-only
- [ ] R01-T17 · T1 · Spec: [plan §A.4.2](../../meta/repo_restructure_plan.md)
      Files: `.cursor/rules/README.md`, `.cursor/skills/app-conventions/SKILL.md`
      Acceptance: манифест перечисляет каждое правило по tier с одной строкой назначения и режимом (always / globs / requestable); skill `app-conventions` — индекс «область работы → правила и документы» по целевой структуре ([`repo_structure_contract.md`](../contracts/repo_structure_contract.md) §1); правила `import-boundaries` и `game-module-contract` перечислены как «создаётся в R02 / R03» → каждое правило в каталоге есть в манифесте ровно один раз и наоборот
      Paths: n/a — docs-only

**CU DoD:** `npm run encoding:check` · проверка манифеста (T17) · `rg -i "pulse|monorepo|PACKAGE_SCOPE|\.claude" .cursor` пуст

### R01-CU6 — docs(docs): add react, typescript, nextjs, security and testing guides · Review: diff-only · Smoke: none · Commit: auto

- [ ] R01-T18 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/guidelines/README.md`, `docs/guidelines/agent-phase-orchestration.md`, `docs/guidelines/ai_code_review_protocol.md`, `docs/guidelines/typography_text_guidelines.md`
      Acceptance: перенесены и адаптированы (пути к драйверу — `scripts/`, фазы — `docs/implementation/phases/`); `README.md` — индекс guidelines с таблицей правил → ссылки открываются, `agent-phase-orchestration.md` согласован с изменениями `unit-driver.mjs` из T7
      Paths: n/a — docs-only
- [ ] R01-T19 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/guidelines/react/README.md`, `docs/guidelines/react/ai_component_guidelines.md`, `docs/guidelines/react/ai_react_hooks_guidelines.md`, `docs/guidelines/react/ai_react_state_management_guidelines.md`, `docs/guidelines/react/ai_semantics_a11y_guidelines.md`, `docs/guidelines/react/copy_and_messages.md`, `docs/guidelines/react/ai_browser_rendering_performance.md`
      Acceptance: перенесены из `docs/guidelines/react/`; `copy_and_messages.md` переписан под словари `shared/i18n` и `games/<slug>/i18n`; отложенные (`optimistic`, `form_handling`, `responsive_table`) не перенесены
      Paths: n/a — docs-only
- [ ] R01-T20 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/guidelines/typescript/README.md`, `docs/guidelines/typescript/ai_javascript_fundamentals_guidelines.md`, `docs/guidelines/typescript/ai_typescript_guidelines.md`
      Acceptance: `ai_typescript_guidelines.md` — переписанная версия `ai_typescript_monorepo_guidelines.md` под одно приложение (слои `shared/domain`, `server/*`, `games/*`, константы вместо inline-строк)
      Paths: n/a — docs-only
- [ ] R01-T21 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/guidelines/nextjs/README.md`, `docs/guidelines/nextjs/ai_data_fetching_patterns.md`, `docs/guidelines/nextjs/ai_loading_patterns.md`, `docs/guidelines/nextjs/ai_client_lazy_loading.md`, `docs/guidelines/nextjs/ai_vercel_runtime_compatibility.md`, `docs/guidelines/nextjs/ai_nextjs_db_data_handle.md`
      Acceptance: перенесены; ссылки на S3/Blob/PSI/admin-interface удалены; версии Next.js — 16.2.6
      Paths: n/a — docs-only
- [ ] R01-T22 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/guidelines/security/README.md`, `docs/guidelines/security/ai_security_xss_csrf_guidelines.md`, `docs/guidelines/auth/ai_auth_implementation_guide.md`, `docs/general/01-security-xss-csrf.md`, `docs/general/03-accessibility.md`, `docs/general/ai_agent_ui_ux_guideline.md`
      Acceptance: перенесены; auth-руководство описывает Credentials + JWT + роль `admin` (Telegram OIDC не переносится); `docs/general/README.md` создан как индекс этих трёх файлов
      Paths: n/a — docs-only
- [ ] R01-T23 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/guidelines/testing/ai_testing_guidelines.md`, `docs/guidelines/testing/ai_ui_verification.md`
      Acceptance: тестирование адаптировано под `lean` (Vitest на логику игр, реестр, валидаторы; UI вручную); `ai_ui_verification.md` — проверка экрана в браузере на 360/768/1280 без ролей и seed-учёток (публичные страницы), формат строки `UI-check: …`; `ai_dev_accounts_and_seed.md` не переносится
      Paths: n/a — docs-only

**CU DoD:** `npm run encoding:check` · `rg -i "pulse|monorepo|apps/web|packages/|\{\{|S3|Telegram" docs/guidelines docs/general` пуст

### R01-CU7 — docs(docs): add architecture decisions and archive legacy docs · Review: diff-only · Smoke: none · Commit: auto

- [ ] R01-T24 · T1 · Spec: [plan §A.4.4](../../meta/repo_restructure_plan.md)
      Files: `docs/architecture/adr_index.md`, `docs/architecture/decision_process.md`
      Acceptance: перенесены из `docs/prds/07_governance/*.template.md`; индекс содержит ADR-001…006 со статусами
      Paths: n/a — docs-only
- [ ] R01-T25 · T2 · Spec: [plan §0 D1–D3, D7](../../meta/repo_restructure_plan.md), [`repo_structure_contract.md`](../contracts/repo_structure_contract.md)
      Files: `docs/architecture/ADR-003-repo-structure.md`
      Acceptance: Status `Accepted`; Context (Vite→Next, портал игр), Decision (одно приложение, `games/`, `shared/`, `server/`, границы импортов, данные у игр), Rejected alternatives (монорепо с `apps/*`/`packages/*`, общий банк вопросов), Consequences; ссылка на контракт структуры
      Paths: n/a — docs-only
- [ ] R01-T26 · T2 · Spec: [plan §0 D4–D5](../../meta/repo_restructure_plan.md), [`game_routing_contract.md`](../contracts/game_routing_contract.md), [`game_manifest_contract.md`](../contracts/game_manifest_contract.md)
      Files: `docs/architecture/ADR-004-game-routing-and-registry.md`
      Acceptance: Decision — `/<slug>`, реестр игр, зарезервированные slug'и, `dynamicParams = false`, редирект `/game`; Rejected — `/games/<slug>`, `/play/<slug>`, автообнаружение игр по файловой системе
      Paths: n/a — docs-only
- [ ] R01-T27 · T2 · Spec: [`docs/examples/ai_first_tmp/docs/prds/07_governance/adr_002_nextjs_vercel_runtime_policy.template.md`](../../examples/ai_first_tmp/docs/prds/07_governance/adr_002_nextjs_vercel_runtime_policy.template.md)
      Files: `docs/architecture/ADR-005-nextjs-vercel-runtime.md`
      Acceptance: адаптирован под фактический стек (Next.js 16.2.6, Node по `engines`, Vercel, Neon, Prisma 7, `proxy.ts`); `cacheComponents`/Instant Navigations — «не включено, вернуться отдельным ADR»; расхождения с прежним `AGENTS.md` (Prisma 6.x → 7.x) зафиксированы
      Paths: n/a — docs-only
- [ ] R01-T28 · T2 · Spec: [plan §0 D6–D7](../../meta/repo_restructure_plan.md), [`i18n_contract.md`](../contracts/i18n_contract.md)
      Files: `docs/architecture/ADR-006-i18n-and-game-data.md`
      Acceptance: Decision — RU/EN, cookie `locale` без префикса в URL, словари портала и игры, `uk/de/ro` выключены; данные каждой игры принадлежат игре (`games/<slug>/data`, `games/<slug>/server`, таблицы `QuestionSuite`/`Question` — Alphabet); Rejected — `[locale]`-сегмент, общий банк вопросов; Consequences — SEO на одном URL (см. контракт §1)
      Paths: n/a — docs-only
- [ ] R01-T29 · T1 · Spec: [plan §A.6](../../meta/repo_restructure_plan.md)
      Files: `docs/archive/AGENTS.pre-restructure.md`, `docs/archive/documentation_creation_guide.md`, `docs/archive/PORTAL_PROMPT.md`, `docs/archive/ALPHABET_GAME_PROMPT.md`, `docs/meta/documentation_creation_guide.md`, `docs/PORTAL_PROMPT.md`, `docs/ALPHABET_GAME_PROMPT.md`, `docs/architecture/ADR-001-migration-to-nextjs.md`, `docs/architecture/ADR-002-ai-generator.md`, `docs/architecture/i18n-approach.md`
      Acceptance: `git mv` в `docs/archive/` (копия `AGENTS.md` — `cp`, сам файл заменяется в CU8); в ADR-001 добавлена строка статуса «Accepted, реализовано; структура пересмотрена в ADR-003», в ADR-002 — «генератор вопросов принадлежит games/alphabet (ADR-003)», в начало `i18n-approach.md` — «обновляется в R03; решение — ADR-006» → ссылки на перенесённые файлы исправлены (`docs:links` — только ссылки вперёд)
      Paths: n/a — docs-only

**CU DoD:** `npm run encoding:check` · `adr_index.md` согласован с файлами каталога

### R01-CU8 — docs(docs): rewrite agent instructions and readme, close phase · Review: diff-only · Smoke: none · Commit: auto

- [ ] R01-T30 · T2 · Spec: [`AGENTS.template.md`](../../examples/ai_first_tmp/AGENTS.template.md), [`repo_structure_contract.md`](../contracts/repo_structure_contract.md) §1, [plan §A.3](../../meta/repo_restructure_plan.md)
      Files: `AGENTS.md`
      Acceptance: ≤ 120 строк; разделы — суть проекта, методология (ссылки), профиль качества, целевая структура (с пометкой «достигается в R02–R03»), инварианты ([`repo_structure_contract.md`](../contracts/repo_structure_contract.md) §5), роли пользователей, цикл агента, коммиты/ревью (ссылки на правила), точки входа в документацию, текущий статус (`R01` → список фаз и ссылки), проверки перед коммитом; стек и версии соответствуют `package.json`; нет Pulse/monorepo/`{{` → `wc -l AGENTS.md` ≤ 120; все ссылки открываются
      Paths: n/a — docs-only
- [ ] R01-T31 · T1 · Spec: [`AGENTS.md`](../../../AGENTS.md)
      Files: `README.md`
      Acceptance: коротко: что за проект (каталог христианских игр EdenGames), как запустить (`npm ci`, `.env.local.example`, `npm run dev`), скрипты, ссылка на `AGENTS.md` и `docs/`; без устаревших инструкций Vite/AI Studio
      Paths: n/a — docs-only
- [ ] R01-T32 · T1 · Spec: [R01_phase_description §Phase DoD](R01_phase_description.md#phase-dod)
      Files: `docs/implementation/phases/R01_tasks.md`
      Acceptance: выполнен весь Phase DoD; в разделе Verification ниже заполнены отметки и приложен список понижённых lint-правил (T2); пути в `R02_*`/`R03_*`/контрактах/спецификациях проверены `docs:links`; зафиксированы в отчёте результат dry-run драйвера и вопросы, оставшиеся к владельцу
      Paths: n/a — docs-only

**CU DoD:** весь набор проверок: `npm run docs:links` · `encoding:check` · `deps:check` · `typecheck` · `lint` · `test` · `build`

## Verification (phase)

- [ ] Все CU закоммичены; у каждого trace `Review: …`
- [ ] Phase DoD из [`R01_phase_description.md`](R01_phase_description.md#phase-dod)
- [ ] Чек-лист [plan §A.8](../../meta/repo_restructure_plan.md) выполнен
- [ ] Список понижённых lint-правил (legacy) записан здесь: _(заполняется в R01-T2/T32)_
- [ ] Вопросы, оставшиеся к владельцу: _(заполняется по ходу)_

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [`R01_phase_description.md`](R01_phase_description.md) | DoD фазы |
| [`repo_restructure_plan.md`](../../meta/repo_restructure_plan.md) | Решения, белый список переноса |
| [`ai_agent_model_routing.md`](../../meta/ai_agent_model_routing.md) | DoR, task tiers, commit units (после R01-T8) |
| [`R02_phase_description.md`](R02_phase_description.md) | Следующая фаза |
