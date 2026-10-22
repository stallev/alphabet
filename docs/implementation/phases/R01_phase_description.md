# R01 — Основа процесса

**Тип:** Phase description  
**Статус:** Draft (готова к Phase DoR audit)  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** [`repo_restructure_plan.md`](../../meta/repo_restructure_plan.md) (Часть A, §0)  
**Задачи:** [`R01_tasks.md`](R01_tasks.md)  
**Следующая фаза:** [`R02_phase_description.md`](R02_phase_description.md)

---

## Цель

Репозиторий получает процесс разработки для AI-агентов в Cursor: методологию, правила, guidelines, шаблоны документов, ADR, автоматические проверки и драйвер прогона фаз. **Код приложения не меняется** (кроме конфигурации линтера, тестов и зависимостей).

## Scope

1. Инструменты и гейты: проверка ссылок и кодировки, ESLint (flat config), Vitest, точные версии зависимостей, commitlint + husky + lint-staged, CI, подключение драйвера фаз (скрипты уже написаны: [`phase_driver_contract.md`](../contracts/phase_driver_contract.md), [`cu_boundary_scripts_contract.md`](../contracts/cu_boundary_scripts_contract.md), [`precommit_build_gate_contract.md`](../contracts/precommit_build_gate_contract.md)) — npm-скрипты, hook, CI.
2. `docs/meta/`: методология, маршрутизация моделей, профиль качества `lean`, реестр документации, шаблон задач фазы, шаблоны PRD/contract/spec/ADR/описания игры.
3. `.cursor/`: правила (tier 0–2) по [`repo_restructure_plan.md` §A.4.3](../../meta/repo_restructure_plan.md), субагенты `architect`/`implementer`/`reviewer`, skill `app-conventions`, манифест правил.
4. `docs/guidelines/`: перенесённые и адаптированные руководства (§A.4.4).
5. `docs/architecture/`: ADR-003…006, индекс ADR, процесс принятия решений, пометки в ADR-001/002, архив устаревших документов.
6. Новый `AGENTS.md` (≤ 120 строк) и `README.md`.

## Out of scope

- Любые изменения структуры кода (R02), UI-кит и i18n (R03).
- Правила `import-boundaries` и `game-module-contract` (создаются в R02 и R03).
- Claude Code (`CLAUDE.md`, `.claude/`, `rules:sync`) — D13.
- Рефакторинг существующих `.cursor/rules` сверх объединения по §A.4.3.

## Входные условия

- [ ] Документ [`repo_restructure_plan.md`](../../meta/repo_restructure_plan.md) утверждён владельцем.
- [ ] Скрипты драйвера (`scripts/`), контракты `docs/implementation/contracts/{phase_driver,cu_boundary_scripts,precommit_build_gate}_contract.md` и `.local/` в `.gitignore` закоммичены отдельным коммитом (драйвер требует чистое дерево).
- [ ] Рабочее дерево чистое (кроме удаления `docs/examples/fitapp`, которое пользователь оставляет как есть: перед запуском закоммитить или восстановить это удаление) — создана ветка `R01-process-foundation`.
- [ ] Node.js LTS и npm доступны; `npm ci` проходит.

## Принятые решения для фазы

| Вопрос | Решение |
|--------|---------|
| Идентификаторы | Фаза `R01`, CU `R01-CU{k}`, задачи `R01-T{k}` |
| Профиль качества | `lean` (D8) |
| Lint-политика на старте | Правила, которые ломаются на унаследованном коде, понижаются до `warn` в `eslint.config.mjs` с комментарием `// legacy: …` и списком в `R01_tasks.md` (Verification). `lint-staged` использует `eslint --fix` без `--max-warnings=0` (ошибки блокируют, предупреждения — нет) |
| Pre-commit | `lint-staged`; если в индексе есть `*.ts, *.tsx, *.mjs, *.js` — дополнительно `npm run typecheck`. Production build не входит в hook, он в CI и в Phase DoD |
| Точные версии | Все зависимости в `package.json` без `^`/`~` (правило `dependency-pinning`); версии берутся из `package-lock.json` (уже установленные) — не обновляются |
| Новые dev-зависимости | `vitest`, `@commitlint/cli`, `@commitlint/config-conventional`, `husky`, `lint-staged`; версии — актуальные стабильные на момент выполнения (`npm view <pkg> version`), фиксируются точно |
| Именование scope коммитов | `portal`, `games`, `game-kit`, `ui`, `shared`, `server`, `db`, `auth`, `i18n`, `docs`, `rules`, `config`, `ci`, `deps` |
| Claude Code | не используется (D13) |

## Артефакты на выходе

См. таблицу в [`R01_tasks.md`](R01_tasks.md) (поле `Files` у каждой задачи). Сводно:

| Группа | Результат |
|--------|-----------|
| Корень | `AGENTS.md`, `README.md`, `.cursorignore`, `eslint.config.mjs`, `vitest.config.mjs`, `commitlint.config.mjs`, `.husky/`, `.github/workflows/ci.yml` |
| Промпты | `docs/prompts/phase-implementation.md`, `docs/prompts/launch-prompts.md` |
| Скрипты | Уже есть до старта: `phase-driver.mjs`, `run-phase.mjs`, `cu-verify.mjs`, `cu-commit.mjs`, `precommit-build-check.mjs`, `check-build-isolation.mjs` (+ тесты). Добавляет R01: `check-doc-links.mjs`, `check-text-encoding.mjs`, `check-exact-deps.mjs` |
| Meta | `docs/meta/{ai_first_methodology, ai_agent_model_routing, project_quality_profile, documentation_registry, phase_tasks.template}.md`, `docs/meta/templates/*` |
| Rules/agents | `.cursor/rules/*.mdc` (+`README.md`), `.cursor/agents/{architect,implementer,reviewer}.md`, `.cursor/skills/app-conventions/SKILL.md` |
| Guidelines | `docs/guidelines/**` по §A.4.4 |
| Architecture | `docs/architecture/{adr_index, decision_process, ADR-003…006}.md`, пометки в ADR-001/002 |
| Архив | `docs/archive/{AGENTS.pre-restructure, documentation_creation_guide, PORTAL_PROMPT, ALPHABET_GAME_PROMPT}.md` |

## Phase DoD

- [ ] Все CU фазы закоммичены; у каждого trace `Review: …`
- [ ] `npm run docs:links`, `encoding:check`, `deps:check`, `typecheck`, `lint`, `test` — зелёные; `npm run build` проходит (код не сломан)
- [ ] Чек-лист [`repo_restructure_plan.md` §A.8](../../meta/repo_restructure_plan.md) выполнен полностью
- [ ] Драйвер: `node scripts/run-phase.mjs R01 --environment cursor` корректно печатает блоки для первого открытого CU (dry-run на копии файла задач; тесты `scripts/*.test.mjs` зелёные; тестовый коммит с изменением `package.json` запускает `precommit-build-check`)
- [ ] `AGENTS.md` ≤ 120 строк, ссылки открываются, структура проекта соответствует [`repo_structure_contract.md`](../contracts/repo_structure_contract.md) §1 как **целевая**
- [ ] В `docs/**` (кроме `docs/examples/`, `docs/archive/`) нет слов «Pulse», «monorepo», `apps/web`, `packages/`, `{{`
- [ ] Документы R02 и R03 прошли ссылочную проверку после переноса meta-файлов (пути в них актуальны)

## Риски

| Риск | Смягчение |
|------|-----------|
| `next lint` удалён в Next.js 16, текущий `lint`-скрипт не работает | R01-T2: `eslint .` + flat config на `eslint-config-next` |
| Закрепление версий меняет `package-lock.json` и ломает сборку | R01-T3 берёт версии из lock-файла; acceptance — `npm ci && npm run build` |
| Правила из шаблона содержат остатки Pulse/monorepo | Чек-лист §A.5 + grep-проверка в DoD |
| `lint` на унаследованном коде даёт сотни ошибок | Политика `warn` для legacy-правил (см. выше) |
| husky/commitlint блокируют ручные коммиты владельца | Hook принимает коммиты без branch-префикса на `master`/`main` (как в шаблоне) |
| Агент утаскивает лишнее из `docs/examples/` | Белый список в `R01_tasks.md` + `.cursorignore` |

## Связанные документы

| Документ | Роль |
|----------|------|
| [`repo_restructure_plan.md`](../../meta/repo_restructure_plan.md) | Источник решений и белого списка переноса |
| [`R01_tasks.md`](R01_tasks.md) | Задачи и commit units |
| [`docs/examples/ai_first_tmp/`](../../examples/ai_first_tmp/) | Источник переносимых файлов (read-only) |
