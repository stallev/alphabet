# Перестройка репозитория в каталог игр — перенос методологии и план фаз

**Тип:** Meta / Plan  
**Статус:** Draft (ждёт утверждения владельца)  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Аудитория:** владелец проекта + AI-агенты в Cursor  
**Источник методологии:** [`docs/examples/ai_first_tmp/`](../examples/ai_first_tmp/) (read-only шаблон, далее — «шаблон»)

Документ состоит из двух частей:

- **Часть A** — инструкция: что из шаблона переносить, во что адаптировать, куда класть, что игнорировать.
- **Часть B** — план написания документов трёх фаз реализации (R1–R3), которые перестроят репозиторий.

Сам код этот документ не меняет. Исполнитель Части A — агент в Cursor, по одному пункту за сессию.

---

## 0. Принятые решения

Решения приняты владельцем или выбраны по умолчанию как оптимальные. Каждое оформляется ADR в фазе R1 (§B.2), пока этот раздел — их единственный источник.

| # | Решение | Обоснование |
|---|---------|-------------|
| D1 | **Одно Next.js-приложение, не монорепо.** Нет `apps/*`, `packages/*`, npm workspaces | Один деплой на Vercel, общий код нужен постоянно; монорепо удваивает конфигурацию без выгоды |
| D2 | **Игры — модули в `games/<slug>/`**, подключаются через `games/registry.ts` | Добавление игры = папка + одна строка |
| D3 | **Единый UI-кит**: `shared/ui` (примитивы) и `shared/game-kit` (каркас игры: `GameShell`, табло, таймер, модалка вопроса, экран победы, правила) | Требование «все игры похожи» обеспечивается кодом, а не только соглашением |
| D4 | **Красивые URL:** каталог — `/`, игра — `/<slug>` (например `/alphabet`). Правила показываются внутри игры (`RulesDialog`), отдельного маршрута `/<slug>/rules` нет | Требование владельца; вложенные маршруты не конфликтуют с системными |
| D5 | **Зарезервированные slug'и:** `admin`, `api`, `about`, `login`, `games`, `rules`, `privacy`, `_next`, `favicon.ico`, `robots.txt`, `sitemap.xml`. Реестр проверяет slug при старте и в тесте | Корневые URL игр конфликтуют с системными маршрутами |
| D6 | **i18n: RU и EN**, словари — `shared/i18n` (портал) и `games/<slug>/i18n` (игра). Локаль хранится в cookie `locale` (SSR видит её), без префикса в URL. Прочие локали (`uk`, `de`, `ro`) из текущего кода остаются выключенными | Сохраняет красивые URL; текущий клиентский подход ([`i18n-approach.md`](../architecture/i18n-approach.md)) расширяется, а не переписывается |
| D7 | **Данные у каждой игры свои:** `games/<slug>/data/`. Общей таблицы вопросов в БД нет; `QuestionSuite` / `Question` остаются таблицами игры Alphabet и принадлежат её DAL (`server/db/dal/alphabet/`) | Решение владельца |
| D8 | **Профиль качества: `lean`** (+ security floor профиля). Тесты — на чистую логику игр (`games/*/logic`) и реестр; e2e не требуются | Проект небольшой, агенты пишут код под присмотром; `standard` удорожает каждый CU |
| D9 | **Оркестрация фаз — по шаблону**: Commit Unit (CU), Definition of Ready, `implementer` / `architect` / `reviewer`, auto-commit на границе CU | Решение владельца ([см. §A.4](#a4-что-переносим-таблицы)) |
| D10 | **Имя портала в документах — `EdenGames`** (рабочее, из `docs/PORTAL_PROMPT.md`). Значение живёт в одном месте — `shared/config/site.ts` (создаётся в R3); в документах пишем `{{PROJECT_NAME}}`-эквивалент только в шаблонах | Имя можно сменить одной правкой |
| D11 | **Нумерация фаз — `R1…R3`** (R = restructure) в тексте; в именах файлов и ID задач — двузначная форма **`R01`, `R02`, `R03`** (`R01-CU1`, `R01-T1`), потому что драйвер фаз требует `<буква><две цифры>`; в R01 его паттерны расширяются до `[PR]\d{2}` | Не путать со старыми `P1`/`P02` из `AGENTS.md` и git-истории |
| D12 | **Каталог артефактов фаз:** `docs/implementation/phases/` (`R0N_phase_description.md`, `R0N_tasks.md`). Контракты — `docs/implementation/contracts/`, спецификации — `docs/implementation/specs/` | Один каталог для всех будущих фаз, не `mvp/` |
| D13 | **Claude Code не используется** (только Cursor): `CLAUDE.md`, `.claude/`, `rules:sync` не переносятся; вернуть можно отдельной задачей | Решение по умолчанию; снимает дублирование правил |
| D14 | **Документы всех трёх фаз и их контракты/спецификации написаны заранее** (2026-10-22). Документы R02 и R03 перед запуском проходят Phase DoR audit против фактического состояния репозитория после предыдущей фазы | Решение владельца; риск устаревания гасится аудитом |

---

# Часть A. Инструкция переноса

## A.1 Принципы

1. **Белый список.** Переносится только то, что названо в §A.4. Всё остальное в шаблоне — игнорировать, даже если выглядит полезным.
2. **Копировать, затем адаптировать.** Файл копируется из шаблона, потом правится под этот проект (§A.5). Ссылок из рабочих документов на `docs/examples/**` не оставлять (кроме явного раздела «Reference»).
3. **Шаблон не править.** `docs/examples/ai_first_tmp/` остаётся read-only; проверка ссылок ([`check-doc-links`](../examples/ai_first_tmp/scripts/check-doc-links.mjs)) его уже исключает. В Cursor добавляется `.cursorignore` (§A.7), чтобы агент не принимал шаблон за часть проекта.
4. **Single source.** Списки правил, уровни профиля, критерии путей H/N/S, уровни review живут в одном месте (в перенесённых файлах); остальные документы ссылаются, не копируют.
5. **Один пункт — одна сессия** агента. Пункт считается готовым только после проверок §A.8.
6. **Конфликт источников** — по иерархии (§A.6): сначала правила `.cursor/rules`, потом `AGENTS.md`, дальше ADR, contracts, PRD, guidelines, прототипы.

## A.2 Профиль качества и значения плейсхолдеров

Профиль: **`lean`** (D8). Создаётся из [`project_quality_profile.template.md`](../examples/ai_first_tmp/docs/meta/project_quality_profile.template.md) в `docs/meta/project_quality_profile.md`; значения D2–D11 профиля — по умолчанию уровня `lean`, отличия вносятся явно:

| Параметр профиля | Значение |
|------------------|----------|
| Тесты (Vitest) | Обязательны для `games/*/logic/**`, `games/registry.ts`, `lib/validators/**`; UI — не обязательны |
| Review (D6) | `lean`: `reviewer` — только CU с T3 / Paths S / runtime в sensitive zone |
| Включённые модули стека | Next.js, Prisma/Neon, Auth.js (admin), Tailwind v4, shadcn/ui, Zustand, Framer Motion, Gemini/OpenRouter. **Выключены:** S3, Sentry, Resend, Telegram OIDC, cacheComponents/PSI-lab (вернёмся отдельным ADR) |
| Security floor | Применяется (шаблон профиля §5) |

Плейсхолдеры шаблона заменяются так:

| Плейсхолдер | Значение |
|-------------|----------|
| `{{PROJECT_NAME}}` | EdenGames (D10) |
| `{{PRODUCT_DESCRIPTION}}` | Каталог христианских браузерных игр для молодёжного служения (RU/EN) |
| `{{USER_ROLES}}` | `admin` (MVP). `editor`, `subscriber` — post-MVP |
| `{{PACKAGE_SCOPE}}` | не используется — монорепо нет (D1). Упоминания `@scope/domain` заменяются на `@/shared/domain` (см. §A.5) |
| `{{DESIGN_SYSTEM_NAME}}` | определяется в R3 (токены); до того — «portal tokens» |
| `{{MAIN_PROTOTYPE_HTML}}` | не используется — прототипа нет; ссылки на него удалить |
| `{{INTERIM_DOCS_GLOB}}` | `docs/OVERVIEW.md` и `docs/GAME_DESCRIPTION.md` до появления PRD |
| `{{CURRENT_PHASE}}` | `R1 — Process foundation` |

## A.3 Итоговая структура процесса (после R1)

```
AGENTS.md                      # короткий (≤ 120 строк), по AGENTS.template.md
CLAUDE.md                      # @AGENTS.md (для Claude Code, опционально)
.cursorignore                  # docs/examples/**, .claude/** и т.п.
.cursor/
  rules/                       # *.mdc (SoT) — см. §A.4.3
  agents/                      # architect, implementer, reviewer
  skills/app-conventions/      # SKILL.md проекта
docs/
  meta/                        # методология, профиль, registry, routing, phase template
  guidelines/                  # HOW: react, typescript, nextjs, security, testing, review, orchestration
  architecture/                # ADR-001…ADR-00N (+ index), database_schema.md
  prds/                        # product scope, game catalog PRD, per-game PRD
  implementation/
    phases/                    # R01–R03 phase descriptions + tasks
    contracts/                 # контракты (game manifest, game-kit, routing, boundaries, i18n)
    specs/                     # спецификации (portal home, GameShell, ...)
  games/<slug>.md              # описание и правила каждой игры (пользовательский уровень)
  examples/ai_first_tmp/       # read-only шаблон (не канон)
scripts/                       # check-doc-links, check-text-encoding, check-exact-deps, sync-claude-rules
```

## A.4 Что переносим (таблицы)

Пути слева — в шаблоне (`docs/examples/ai_first_tmp/…`); справа — в этом репозитории.

### A.4.1 Корневые файлы

| Источник | Действие | Назначение |
|----------|----------|-----------|
| `AGENTS.template.md` | **Адаптировать** | Заменяет текущий `AGENTS.md` (старый — в `docs/archive/AGENTS.pre-restructure.md`, см. §A.6). Убрать: Monorepo structure, Pulse reference, workers, policy-packages, S3, Sentry, Resend. Добавить: структуру из §A.3, правила границ слоёв (§B.3.R2), «как добавить игру» (ссылка) |
| `CLAUDE.md` | Копировать (3 строки) | Только если нужен Claude Code; иначе пропустить |
| `AGENTS.md`, `README.md`, `BOOTSTRAP.md`, `PLACEHOLDERS.md` | **Игнорировать** | Это сопровождение самого шаблона. Из `BOOTSTRAP.md` берём лишь идею порядка шагов (она отражена в Части B) |
| `package.json` шаблона | **Игнорировать** | Скрипты (`rules:*`, `deps:check` и т.д.) добавляются в корневой `package.json` проекта (§A.4.5) |

### A.4.2 `.cursor/agents` и skills

| Источник | Действие |
|----------|----------|
| `.cursor/agents/architect.md`, `implementer.md`, `reviewer.md` | **Копировать**, адаптировать (убрать упоминания monorepo, Pulse; модели оставить как в шаблоне — менять только по решению владельца) |
| `.cursor/agents/doc-writer.md`, `doc-reviewer.md` | **Пропустить.** Нужны только для драйвера `run-wave` (Claude Code); документацию в этом проекте пишет обычный агент, сессия = 1–3 файла |
| `.cursor/skills/app-conventions/` | **Переписать** под структуру из §A.3 (индекс «какое правило читать для какой области»). Шаблонный `references/nextjs-rsc-streaming.md` — перенести только после проверки актуальности для Next.js 16.2.6 |

### A.4.3 `.cursor/rules` — таблица решений

Источник: `.cursor/rules/tiers/**`. В проекте правила лежат плоско в `.cursor/rules/*.mdc` (так требует Cursor). Манифест — `.cursor/rules/README.md` (из шаблона, адаптировать список).

**Tier 0 — всегда активны:**

| Правило | Решение |
|---------|---------|
| `agent-commit-pipeline` | **Взять.** Scopes заменить на: `portal` · `games` · `game-kit` · `ui` · `server` · `db` · `auth` · `i18n` · `docs` · `config` · `ci` · `deps`. Убрать упоминание monorepo/Windows hook как «P5 scaffold» |
| `agent-code-review-subagent` | **Взять.** Sensitive zones: `**/auth/**`, `app/api/**`, `server/db/**`, `prisma/**`, `proxy.ts`, `.env*`, `next.config.*` |
| `model-routing` | **Взять** без изменений структуры; убрать `doc-writer` и §2b (волны документации) |
| `product-docs-alignment` | **Взять**; таблицу «Where to look» привести к путям из §A.3 |
| `ai-dry-deduplication` | **Взять**; `packages/domain` → `shared/domain`, `@/lib` → `@/shared/lib` |
| `domain-literals-and-codes` | **Адаптировать:** константы кодов/ролей — `shared/domain/*`; убрать `@{{PACKAGE_SCOPE}}` |
| `typescript-monorepo-types` | **Переименовать → `typescript-types`**, переписать под одно приложение (слои: `shared/domain`, `server/*`, `games/*`) |
| `project-context.template` | **Адаптировать → `project-context.mdc`.** Иерархия источников истины (см. §A.6); стек — реальный (Next 16.2.6, Prisma, Auth.js v5) |
| (текущий) `alphabet-project-context` | **Удалить** после появления `project-context.mdc` (его содержимое переносится туда и в ADR) |

**Tier 1 — реализация:**

| Правило | Решение |
|---------|---------|
| `nextjs-vercel-app-router` | **Взять**, но cacheComponents/Instant Navigations убрать из обязательных (D8) |
| `auth-security` | **Объединить** с текущим `.cursor/rules/auth-security.mdc` (текущее — база, из шаблона взять только проверки Server Actions/CSRF, если нет в текущем) |
| `data-server-actions-and-api` | **Объединить** с текущим `data-layer-prisma.mdc` (сохранить Prisma/Neon-специфику текущего) |
| `security-xss-csrf` | **Взять** |
| `dependency-pinning` | **Взять** (подключает `deps:check`) |
| `javascript-fundamentals` | **Взять** |
| `testing` | **Адаптировать** под профиль `lean` (Vitest на `logic/` и реестр) |
| `app-router-streaming-loading` | Взять **в сокращённом виде**: только `loading.tsx` / Suspense, без cacheComponents |
| `policy-packages`, `s3-file-asset-uploads`, `ios-safari-mutation-transport`, `psi-lab-testing` | **Не переносить** (нет монорепо, S3, мутационной специфики Pulse, PSI-lab). Вернём отдельным ADR, если понадобится |
| (текущие) `nextjs-app-router`, `react-component-patterns`, `admin-json-import` | `nextjs-app-router` — слить в `nextjs-vercel-app-router`; `react-component-patterns` — слить в `react-ui-components`; `admin-json-import` — оставить, но перенести описание в область `games/alphabet` (после R2) |

**Tier 2 — UI (критично для единообразия игр):**

| Правило | Решение |
|---------|---------|
| `react-one-component-per-file`, `react-naming-conventions`, `react-logic-presentation`, `react-ui-components`, `react-state-management` | **Взять** |
| `ui-design-system-shadcn` | **Адаптировать** → `ui-design-system.mdc`: токены портала, запрет «сырых» цветов, `shared/ui` + `shared/game-kit` — единственные источники UI |
| `ui-mobile-first`, `ui-semantics-a11y`, `ui-icons-lucide`, `ui-animation-performance`, `ui-toast-mutations` | **Взять** |
| `ui-messages-and-copy`, `ui-messages-bundle-splitting` | **Адаптировать** под D6: строки — в `shared/i18n/*` и `games/<slug>/i18n/*`, не inline; сплиттинг словарей по игре |
| `ui-mutation-pending`, `ui-optimistic-mutations`, `admin-forms-layout`, `patterns-tables-dnd` | **Отложить** (пригодятся для admin и будущих игр с мутациями): перенести, но с пометкой `alwaysApply: false` и без `globs` до появления соответствующих страниц |
| `ui-prototype-fidelity`, `ui-runtime-verification` | **Не переносить** (нет HTML-прототипа; runtime-проверка — по явной просьбе) |

**Новые правила, которых нет в шаблоне (пишутся в R2/R3):**

| Правило | Фаза | Содержание |
|---------|------|------------|
| `import-boundaries` | R2 | `games/*` ← `shared/*`; `games/*` не импортирует другую игру и `server/*`; `shared/*` не импортирует `games/*`; `server/*` не импортируется из клиента |
| `game-module-contract` | R3 | Каждая игра = `manifest.ts` + `Game` внутри `GameShell`; запрет самописных шапки/табло/модалки вопроса |

### A.4.4 Документы

| Источник | Действие | Назначение |
|----------|----------|-----------|
| `docs/meta/ai_first_project_methodology.md` | **Взять**, сократить (убрать Pulse/волны W0–W14) | `docs/meta/ai_first_methodology.md` |
| `docs/meta/ai_agent_model_routing.md` | **Взять** | `docs/meta/ai_agent_model_routing.md` |
| `docs/meta/phase_tasks.template.md` | **Взять** | `docs/meta/phase_tasks.template.md` |
| `docs/meta/project_quality_profile.template.md` | **Взять** → заполнить (§A.2) | `docs/meta/project_quality_profile.md` |
| `docs/meta/documentation_creation_registry.md` (696 строк) | **Взять только** §2.3.2a (критерии путей H/N/S) и §2.3.6 (DoR-чеклист), остальное — не нужно (волны W0–W14) | `docs/meta/documentation_registry.md` (≤ 150 строк) |
| (текущий) `docs/meta/documentation_creation_guide.md` | **Заменить** документом выше; старый — в `docs/archive/` | — |
| `docs/guidelines/agent-phase-orchestration.md` | **Взять** | `docs/guidelines/agent-phase-orchestration.md` |
| `docs/guidelines/agent-docs-orchestration.md` | **Не переносить** (волны документации) | — |
| `docs/guidelines/ai_code_review_protocol.md` | **Взять** | `docs/guidelines/ai_code_review_protocol.md` |
| `docs/guidelines/react/*` (ai_component_guidelines, ai_react_hooks, state_management, optimistic, form_handling, semantics_a11y, copy_and_messages, responsive_table, browser_rendering) | **Взять**: component, hooks, state_management, semantics_a11y, copy_and_messages, browser_rendering. **Отложить:** optimistic, form_handling, responsive_table | `docs/guidelines/react/` |
| `docs/guidelines/typescript/*` | **Взять** `ai_javascript_fundamentals_guidelines.md`; `ai_typescript_monorepo_guidelines.md` — **переписать** → `ai_typescript_guidelines.md` | `docs/guidelines/typescript/` |
| `docs/guidelines/nextjs/*` | **Взять** `ai_data_fetching_patterns`, `ai_loading_patterns`, `ai_client_lazy_loading`, `ai_vercel_runtime_compatibility`, `ai_nextjs_db_data_handle`. **Не брать:** S3/Blob/PSI/admin-interface | `docs/guidelines/nextjs/` |
| `docs/guidelines/security/*` | **Взять** | `docs/guidelines/security/` |
| `docs/guidelines/auth/ai_auth_implementation_guide.md` | **Адаптировать** (Credentials + JWT + роль `admin`); Telegram OIDC — не брать | `docs/guidelines/auth/` |
| `docs/guidelines/testing/ai_testing_guidelines.md` | **Адаптировать** под `lean` | `docs/guidelines/testing/` |
| `docs/guidelines/testing/ai_ui_verification.md`, `ai_dev_accounts_and_seed.md` | **Отложить до R3**: нужны, когда появятся UI-задачи с `UI:` | — |
| `docs/guidelines/typography_text_guidelines.md` | **Взять** | `docs/guidelines/` |
| `docs/general/*` | **Взять** `03-accessibility`, `01-security-xss-csrf`, `ai_agent_ui_ux_guideline.md`; остальное — позже | `docs/general/` |
| `docs/prds/07_governance/adr_index.template.md`, `decision_process.template.md` | **Взять** | `docs/architecture/adr_index.md`, `docs/architecture/decision_process.md` |
| `docs/prds/07_governance/adr_002_nextjs_vercel_runtime_policy.template.md` | **Адаптировать** в ADR о рантайме Next 16.2.6/Vercel | `docs/architecture/ADR-005-nextjs-vercel-runtime.md` |
| `specs/design_system_lab_spec.template.md` | **Отложить** (R3: опциональный `/design-system` как каталог UI-кита) | — |
| `docs/reference/*`, `docs/examples/*`, `docs/ops/*`, `docs/prototypes/`, `docs/project-react-skill-requirements.md`, `docs/claude-code-cursor-rules-sync.md` | **Игнорировать** (последний — только если выбран Claude Code, §A.4.1) |

**Шаблоны новых документов** (создаются в R1 в `docs/meta/templates/`, по образцу шаблона): `prd.template.md`, `contract.template.md`, `spec.template.md`, `adr.template.md`, `game_description.template.md`. Содержание — по принципу «заголовки + таблицы + checklist» из [`documentation_creation_guide.md`](documentation_creation_guide.md); у каждого — метаданные (Тип, Статус, Версия, Дата, Зависит от).

### A.4.5 Скрипты, git-хуки, CI

| Источник | Действие | Примечание |
|----------|----------|-----------|
| `scripts/check-doc-links.mjs` | **Взять** | `npm run docs:links` |
| `scripts/check-text-encoding.mjs` | **Взять** | `npm run encoding:check` — критично: кириллица и Windows |
| `scripts/check-exact-deps.mjs` | **Взять** | `npm run deps:check` |
| `scripts/sync-claude-rules.mjs` | **Взять только если** выбран Claude Code (§A.4.1) | `npm run rules:sync` / `rules:check` |
| `scripts/{phase-driver,run-phase,precommit-build-check}.mjs` (+ тест), `scaffold/scripts/{cu-verify,cu-commit}.mjs` | **Уже перенесены и адаптированы** (2026-10-23): `[PR]`-идентификаторы, `PHASES_DIR`, `.local/` как секрет, строка UI-check, расширенный `cu-verify`; новый `check-build-isolation.mjs`. Контракты — `docs/implementation/contracts/{phase_driver,cu_boundary_scripts,precommit_build_gate}_contract.md`. R01 лишь подключает их (npm-скрипты, hook, CI) | `unit-driver.mjs`, `run-unit.mjs`, `doc-verify.mjs`, `run-wave.mjs` не переносятся |
| `scaffold/scripts/doc-verify.mjs`, `run-wave.mjs` | **Не брать** | Волны документации |
| `scaffold/commitlint.config.mjs`, `scaffold/.husky/*` | **Взять** (commitlint + lint-staged; `HUSKY=0` на Vercel) | Формат `<branch>: type(scope): subject` |
| `scaffold/.github/workflows/ci.template.yml` | **Адаптировать** → `.github/workflows/ci.yml`: `typecheck`, `lint`, `test`, `docs:links`, `encoding:check`, `deps:check`, `build` | Один job |
| `scaffold/.claude/settings.json`, `scaffold/apps/**`, `scaffold/packages/**`, `scaffold/.npmrc` | **Не брать** (`.npmrc` — прочитать и взять только строки про точные версии, если они есть) | — |
| `prompts/*` | **Взять**: `phase-implementation.md` (адаптировать), `launch-prompts.md` (адаптировать, только фразы про фазы/CU). Остальное (P0–P6, wave-run, P1-html-prototype, …) — **не брать** | `docs/prompts/` |

## A.5 Правила адаптации скопированных файлов

Выполняются для каждого перенесённого файла:

1. **Удалить:** всё, что про monorepo (`apps/*`, `packages/*`, workspace), Pulse (тренеры, бронирование, `fitapp`), S3/Sentry/Resend/Telegram, волны документации W0–W14, `docs/examples/pulse/**`, `{{...}}` без значения.
2. **Заменить пути** по таблице:

| В шаблоне | В проекте |
|-----------|-----------|
| `apps/web/src/lib/messages` | `shared/i18n` (портал) и `games/<slug>/i18n` (игра) |
| `apps/web/src/actions`, `.../dal` | `server/actions`, `server/db/dal` |
| `packages/domain` (`@{{PACKAGE_SCOPE}}/domain`) | `shared/domain` |
| `packages/db` | `prisma/` + `server/db` |
| `packages/policy/server`, `.../edge` | `server/auth` (policy в Server Actions), `proxy.ts` (JWT role gate) |
| `docs/implementation/mvp/*` | `docs/implementation/*` (contracts, specs) и `docs/implementation/phases/*` (фазы) |
| `docs/prds/07_governance` | `docs/architecture` |

3. **Версии:** Next.js — как в `package.json` проекта (**16.2.6**, точный pin); Node — LTS, указывается в `engines` (ADR-005, пишется в R1). Версии библиотек не копировать из шаблона.
4. **Каждый файл** получает метаданные в шапке; «Pulse reference» заменяется на блок «Источник: ai_first_tmp, адаптировано 2026-10-22».
5. **Ссылки** — относительные в `.md`, от корня репозитория в `.mdc`. Битых ссылок быть не должно; ссылки на документы, которые создаются в той же фазе, допустимы только со статусом «TBD в R{N}» в таблице документа.
6. **Кодировка** — UTF-8, без BOM, переводы строк LF для `.mdc` и скриптов.
7. **Объём:** `AGENTS.md` ≤ 120 строк, правило `.mdc` ≤ 150 строк, guideline — без ограничения, но разделы короткие.

## A.6 Судьба существующих документов

| Файл | Решение |
|------|---------|
| `AGENTS.md` | Заменяется (см. §A.4.1); копия — `docs/archive/AGENTS.pre-restructure.md` |
| `docs/meta/documentation_creation_guide.md` | Заменяется набором meta-файлов; копия — `docs/archive/` |
| `docs/architecture/ADR-001-migration-to-nextjs.md` | **Остаётся**; добавить строку статуса «Accepted, реализовано; структура репозитория пересмотрена в ADR-003» |
| `docs/architecture/ADR-002-ai-generator.md` | **Остаётся**; генератор вопросов становится частью `games/alphabet` (упомянуть в ADR-003) |
| `docs/architecture/i18n-approach.md` | **Остаётся**, обновляется в R3 под D6 (cookie вместо localStorage, RU/EN); до того — пометка «обновляется в R3» |
| `docs/architecture/database_schema.md` (если есть, иначе создаётся) | Остаётся как канон схемы; в R2 дополняется владельцем таблиц (Alphabet) |
| `docs/OVERVIEW.md`, `GAME_DESCRIPTION.md` | → `docs/games/alphabet.md` (R2), в корне остаются ссылки-заглушки на 1 релиз |
| `docs/AI_SYSTEM.md`, `UI_COMPONENTS.md`, `STATE_MANAGEMENT.md` | → `docs/games/alphabet/` как `ai_system.md`, `ui_components.md`, `state_management.md` (R2); общие части UI → `shared/game-kit` документация (R3) |
| `docs/PORTAL_PROMPT.md`, `ALPHABET_GAME_PROMPT.md` | → `docs/archive/` (исходные промпты, только история) |
| `.cursor/rules/*.mdc` (6 текущих) | По §A.4.3 |

**Иерархия источников истины** (одна, живёт в `project-context.mdc`; здесь для справки):
1. Cursor Rules → 2. `AGENTS.md` → 3. ADR → 4. Contracts → 5. PRD → 6. Guidelines → 7. Specs / примеры.

(Отличие от шаблона: ADR стоят выше Contracts — у проекта их мало, и они фиксируют структуру. Иерархия записывается в `project-context.mdc` в R1 и больше нигде не дублируется.)

## A.7 `.cursorignore` и `.gitignore`

В R1 создаётся `.cursorignore`:

```
docs/examples/
docs/archive/
.claude/
node_modules/
.next/
```

Если выбран Claude Code (§A.4.1) — `.claude/` исключается из Cursor, но коммитится. В `.gitignore` добавить `.local/` (логи драйвера фаз).

## A.8 Верификация переноса

После каждого пункта и в конце R1 должны проходить:

```bash
npm run docs:links
npm run encoding:check
npm run deps:check
npm run typecheck
npm run lint
```

и вручную (чек-лист):

- [ ] В `docs/**` (кроме `docs/examples/`, `docs/archive/`) нет слов «Pulse», «monorepo», `apps/web`, `packages/`, `{{`
- [ ] В `.cursor/rules/` нет правил из списка «Не переносить»
- [ ] Каждое правило из §A.4.3 присутствует в манифесте `.cursor/rules/README.md` ровно один раз
- [ ] Иерархия источников истины записана только в `project-context.mdc`
- [ ] `AGENTS.md` ≤ 120 строк, все ссылки открываются
- [ ] Существующие `docs/architecture/ADR-001/002` не потеряны

---

# Часть B. План написания документов фаз реализации

## B.1 Принцип: документы фаз пишутся последовательно, не все сразу

> **Ревизия 2026-10-22 (D14).** Документы всех трёх фаз написаны заранее: [`R01`](../implementation/phases/R01_phase_description.md), [`R02`](../implementation/phases/R02_phase_description.md), [`R03`](../implementation/phases/R03_phase_description.md) (описание + задачи), контракты — [`docs/implementation/contracts/`](../implementation/contracts/), спецификации — [`docs/implementation/specs/`](../implementation/specs/). Они **заменяют** раскладку CU и список документов в §B.2–B.4 ниже (там — исходный замысел; разбивка на CU и состав документов уточнены в `R0N_tasks.md`). Таблица «Что пишем и когда» ниже сохранена как история.

Документы последующих фаз зависят от результата предыдущих (реальные имена файлов, форма `GameShell`). Поэтому:

| Шаг | Что пишем | Когда |
|-----|-----------|-------|
| **D0** | Этот документ (утверждение владельцем) | Сейчас |
| **D1** | R1: `R1_phase_description.md` + `R1_tasks.md` — полностью | Сразу после утверждения D0 |
| **D2** | ADR-003…ADR-006 (из §0), контракты и спецификации для R2 (§B.3), `R2_phase_description.md` | В конце R1 (по ходу фазы, как часть R1 — см. R1-CU) |
| **D3** | `R2_tasks.md` | После Phase DoR audit R2 (сразу после завершения R1) |
| **D4** | Контракты и спецификации для R3, `R3_phase_description.md`, `R3_tasks.md` | В конце R2, после того как структура `games/` и `shared/game-kit` существует на деле |

Каждый документ фазы проходит Definition of Ready: ссылки на `§N.M` контрактов открываются, Acceptance проверяем, файлы названы, нет TBD, пути H/N/S описаны там, где нужны (при `lean` — в объёме профиля).

Формат файлов — по `phase_tasks.template.md` (в шаблоне уже есть структура: Purpose · Phase DoR audit · Commit plan · Tasks · Phase DoD). Размер CU — до ≈400 рукописных строк.

## B.2 Фаза R1 — Основа процесса (код не меняется)

**Цель:** репозиторий получает методологию, правила, guidelines, шаблоны и проверки; старые документы приведены в порядок.  
**Вход:** утверждённый D0.  
**Тип работы:** docs / config / tooling.

**Артефакты (создаются в R1):**

| Группа | Файлы |
|--------|-------|
| Корень | `AGENTS.md` (новый), `CLAUDE.md` (опц.), `.cursorignore`, `commitlint.config.mjs`, `.husky/`, `.github/workflows/ci.yml`, скрипты `scripts/*` |
| Meta | `docs/meta/ai_first_methodology.md`, `ai_agent_model_routing.md`, `project_quality_profile.md`, `documentation_registry.md`, `phase_tasks.template.md`, `templates/*` |
| Rules | `.cursor/rules/*.mdc` по §A.4.3 (кроме `import-boundaries`, `game-module-contract`), `.cursor/rules/README.md` |
| Agents/skills | `.cursor/agents/{architect,implementer,reviewer}.md`, `.cursor/skills/app-conventions/SKILL.md` |
| Guidelines | по §A.4.4 |
| ADR | `docs/architecture/adr_index.md`, `decision_process.md`, **ADR-003** (структура репозитория: single-app, `games/`, `shared/`, `server/`; D1–D3), **ADR-004** (роутинг игр, D4–D5), **ADR-005** (рантайм Next/Vercel), **ADR-006** (i18n RU/EN, D6; данные игр, D7) |
| Архив | `docs/archive/*` по §A.6 |
| Phase docs | `docs/implementation/phases/R01_*`, `R2_phase_description.md` (D2) |

**Commit plan (ориентир, 6 CU):**

| CU | Заголовок | Содержимое |
|----|-----------|-----------|
| R1-CU1 | `chore(config): add tooling and quality gates` | Скрипты, commitlint, husky, CI, `.cursorignore`, npm scripts |
| R1-CU2 | `docs(meta): add methodology, profile and templates` | Meta + шаблоны + registry |
| R1-CU3 | `docs(rules): add cursor rules, agents and skill` | Правила, агенты, skill, манифест |
| R1-CU4 | `docs(guidelines): add react, typescript, nextjs, security, testing guides` | Guidelines |
| R1-CU5 | `docs(architecture): add ADR-003…006 and archive legacy docs` | ADR, архив, пометки в ADR-001/002 |
| R1-CU6 | `docs(agents): rewrite AGENTS.md and write R2 contracts` | Новый `AGENTS.md`, контракты и спецификации R2 (§B.3), `R2_phase_description.md` |

**Phase DoD:** проверки §A.8 зелёные; `npm run build` не сломан (код не тронут); `AGENTS.md` соответствует §A.3; в манифесте правил нет файлов вне белого списка; `R2_phase_description.md` и контракты R2 прошли DoR.

## B.3 Фаза R2 — Перестройка репозитория и перенос Alphabet в `games/alphabet`

**Цель:** структура репозитория соответствует ADR-003; игра Alphabet работает по `/alphabet`; сборка зелёная на каждом CU.  
**Вход:** R1 завершена; контракты R2 готовы.

**Документы, которые пишутся в конце R1 (D2):**

| Документ | Тип | Содержание |
|----------|-----|-----------|
| `contracts/repo_structure_contract.md` | Contract | Дерево каталогов, правила `import-boundaries`, что куда класть (решения D1, D2, D7) |
| `contracts/game_manifest_contract.md` | Contract | Тип `GameManifest` (slug, title/description по локалям, tags, статус `active | coming-soon`, cover, minAge), валидация slug (D5), формат `registry.ts` |
| `contracts/game_routing_contract.md` | Contract | `/`, `/[game]`, `/[game]/rules`, 404 для неизвестных, редирект со старого `/game` → `/alphabet`, зарезервированные slug'и, генерация статических параметров |
| `specs/alphabet_migration_spec.md` | Spec | Таблица «старый путь → новый путь» из §A.6 и таблицы переноса кода; что делать с `store.ts`, `types.ts`, `constants.ts`, `data/*`, `utils/audio.ts`, `lib/demo-questions.ts`, `prisma/seed|import-suites` |
| `R2_phase_description.md` | Phase | Цель, Scope, Out-of-scope (UI-кит — в R3), DoD |

**Commit plan (ориентир, 7 CU) — пишется в `R2_tasks.md` (D3):**

| CU | Содержимое |
|----|-----------|
| R2-CU1 | Каркас каталогов (`games/`, `shared/`, `server/`), алиасы `tsconfig`, пустые `index.ts`; `registry.ts` и `GameManifest`-тип; тесты реестра и slug-валидации |
| R2-CU2 | Перенос `server/*`: `lib/auth*`, `lib/db.ts`, `src/data`, `src/actions` → `server/`; `proxy.ts` обновлён; ESLint `no-restricted-imports` по `import-boundaries.mdc` |
| R2-CU3 | Перенос общих типов/констант в `shared/domain`, утилит — `shared/lib`; `store.ts`/`types.ts` разнесены на `shared` (общее) и `games/alphabet` (игровое) |
| R2-CU4 | Перенос компонентов игры в `games/alphabet/components/` (`GameApp`, `Card`, `GameSettings`, `LevelSelectModal`, `StepperInput`, `AIGenerator`, `QuestionLibrary*`, `QuestionEditor`, `OperatorGuide`, `PromptPage`), данных — в `games/alphabet/data/`, логики — `games/alphabet/logic/` с тестами подсчёта очков/колоды |
| R2-CU5 | Роутинг: `app/[game]/page.tsx`, `app/[game]/rules/page.tsx`, главная `/` показывает каталог из реестра (минимальная версия), редирект `/game` → `/alphabet`, 404 |
| R2-CU6 | Admin и API: `app/admin/**`, `app/api/**` переведены на новые импорты; `prisma/seed|import-suites` обновлены; проверка прав сохранена (T3: отдельный CU, review `reviewer`) |
| R2-CU7 | Документация: `docs/games/alphabet.md`, обновление `database_schema.md`, `AGENTS.md` (структура), правило `import-boundaries.mdc`, пометки в ADR |

**Phase DoD:** `typecheck`, `lint`, `test`, `build` зелёные; `/alphabet` играбелен как до перестройки (ручной smoke: старт игры, пара карточек, бонусный вопрос, победа); `/` показывает карточку Alphabet; `/game` редиректит; `docs:links` зелёный; `import-boundaries` проверен линтером (нарушение даёт ошибку); T3-CU пройдены `reviewer`'ом.

**Риски:** (1) массовый перенос ломает импорты → каждый CU заканчивается зелёным `typecheck`; (2) конфликт slug'ов с системными маршрутами → тест реестра; (3) sensitive-зона (`auth`, `api`) → отдельный CU с `reviewer`.

## B.4 Фаза R3 — Общий UI-кит, портал и каркас новых игр

**Цель:** единый вид игр обеспечивается кодом; главная страница — полноценный каталог; RU/EN работает для портала и Alphabet; новая игра добавляется по инструкции за один рабочий день.  
**Вход:** R2 завершена, контракты R3 готовы.

**Документы, которые пишутся в конце R2 (D4):**

| Документ | Тип | Содержание |
|----------|-----|-----------|
| `contracts/game_kit_contract.md` | Contract | Состав `shared/game-kit` (`GameShell`, `GameSettingsPanel`, `ScoreBoard`, `Timer`, `QuestionModal`, `VictoryScreen`, `RulesDialog`, `LevelSelect`), API каждого компонента (props), что игра обязана использовать |
| `contracts/i18n_contract.md` | Contract | Формат словарей, cookie `locale`, SSR-чтение, переключатель, fallback `ru`, правила ключей, запрет inline-строк (D6) |
| `contracts/design_tokens_contract.md` | Contract | Токены (цвета, шрифты, радиусы, тени, отступы) в Tailwind v4 `@theme`, светлая/тёмная темы (опц.), запрет сырых цветов |
| `specs/portal_home_spec.md` | Spec | Hero, сетка карточек, фильтры (опц.), «Coming soon», доступность и мобильная вёрстка (360/768/1280) |
| `specs/game_shell_spec.md` | Spec | Состояния: лобби → игра → пауза → победа; навигация «назад в каталог», настройки, правила |
| `specs/adding_a_game_spec.md` | Spec | Чек-лист новой игры (manifest, registry, i18n, обложка, логика + тесты, документ `docs/games/<slug>.md`) |
| `R3_phase_description.md`, `R3_tasks.md` | Phase | — |

**Commit plan (ориентир, 7 CU):**

| CU | Содержимое |
|----|-----------|
| R3-CU1 | Токены темы и `shared/ui` (Button, Card, Dialog, Badge, Tabs, Toast, Input, Stepper) |
| R3-CU2 | `shared/i18n` + cookie-локаль + `LocaleSwitcher`; перенос строк портала |
| R3-CU3 | `shared/game-kit`: `GameShell`, `ScoreBoard`, `Timer`, `VictoryScreen`, `Confetti`, `RulesDialog` (обобщение из компонентов Alphabet) |
| R3-CU4 | `QuestionModal`, `LevelSelect`, `GameSettingsPanel` в game-kit; Alphabet переведён на game-kit, дублирующие компоненты удалены |
| R3-CU5 | Страница `/` (каталог), `shared/config/site.ts` (имя портала), SEO/метатеги (`generateMetadata`, hreflang не нужен — локаль в cookie) |
| R3-CU6 | `games/_template` + правило `game-module-contract.mdc` + `docs/adding-a-game.md`; временная игра-заглушка «coming soon» в реестре для проверки каталога |
| R3-CU7 | Док-CU: `i18n-approach.md` обновлён, `docs/games/*`, обновление `AGENTS.md` и `app-conventions` skill; закрытие фазы |

**Phase DoD:** `typecheck`, `lint`, `test`, `build`, `docs:links` зелёные; Alphabet использует `GameShell` и компоненты game-kit, собственных шапки/табло/модалки вопроса в игре нет; переключатель RU/EN меняет язык портала и Alphabet без перезагрузки URL; `games/_template` копируется в рабочую игру-пустышку, проходит валидацию реестра и открывается по `/<slug>`; UI-check на ширинах 360/768/1280 (строка `UI-check:` в отчёте CU); `docs/adding-a-game.md` проверен «холодным» прогоном (агент добавляет тестовую игру только по инструкции).

## B.5 Что вне этих фаз

Новые игры, редактор вопросов для других ролей (`editor`, `subscriber`), Google OAuth, cacheComponents/PSI-lab, S3, мониторинг — отдельные фазы после R3 (нумерация `P1…` в новом цикле, формат тот же).

## B.6 Порядок запуска

1. Владелец утверждает этот документ (или присылает правки к §0).
2. Агент выполняет Часть A (R1-CU1…R1-CU6) по `R1_tasks.md`; документ `R1_tasks.md` пишется первым действием после утверждения (D1) и проходит Phase DoR audit (`architect`, один вызов).
3. В конце R1 — D2; в начале R2 — Phase DoR audit R2; в конце R2 — D4; далее R3.
4. После R3 — владелец принимает результат по Phase DoD обеих фаз; шаблон `docs/examples/ai_first_tmp/` можно удалить из репозитория (ссылки на него — только в `docs/archive/`).

---

## Приложение. Контрольный список пунктов для владельца

- [ ] Согласны с решениями D1–D12 (§0)?
- [ ] Рабочее имя портала `EdenGames` (D10) подходит? Сменить можно позже одной правкой
- [ ] Использовать Claude Code вместе с Cursor (тогда в R1 добавляется `CLAUDE.md`, `rules:sync`) — да/нет
- [ ] Профиль `lean` (D8) достаточен, или нужен `standard`?
