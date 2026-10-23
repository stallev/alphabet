# Agent phase orchestration

Канон прогона фазы реализации без подтверждения каждого commit unit (CU). **Среда по умолчанию:** Cursor AI — тонкий чат + свежий субагент `implementer` на CU.

**Контракты (реализация в репозитории):**

- [`phase_driver_contract.md`](../implementation/contracts/phase_driver_contract.md) — `scripts/phase-driver.mjs`, `run-phase.mjs`
- [`cu_boundary_scripts_contract.md`](../implementation/contracts/cu_boundary_scripts_contract.md) — `cu-verify.mjs`, `cu-commit.mjs`
- [`precommit_build_gate_contract.md`](../implementation/contracts/precommit_build_gate_contract.md) — hook сборки

**Запуск:** [`docs/prompts/phase-implementation.md`](../prompts/phase-implementation.md) · фразы — [`launch-prompts.md`](../prompts/launch-prompts.md)

## Роли

| Роль | Когда |
|------|--------|
| Оркестратор (чат) | `node scripts/run-phase.mjs R{NN} --environment cursor` → передаёт блоки IMPLEMENTER/ORCHESTRATOR |
| `implementer` | Один CU: код, чекбоксы, `cu-verify`, `cu-commit stage` |
| `architect` | DoR fail, spec-gap |
| `reviewer` | CU с `Review: reviewer` (T3 / Paths S) |

Драйвер **не LLM**: парсит `docs/implementation/phases/R{NN}_tasks.md`, пишет `.local/phase-runs/<CU>.paths`, не трогает git.

## Один CU (cursor)

1. `STATUS: cu R{NN}-CUk` + двухблочный промпт.
2. Implementer: DoR → работа → UI-check при строке `UI:` → `node scripts/cu-verify.mjs` → `node scripts/cu-commit.mjs stage --paths-file .local/phase-runs/R{NN}-CUk.paths`.
3. Оркестратор: `Review: diff-only` или `reviewer` → `cu-commit commit`.
4. Следующий вызов `run-phase.mjs` — следующий открытый CU.

Состояние между CU: только git и файл задач. Push/PR/deploy — после фазы, человеком.

## Файл задач

- Заголовок CU: `### R02-CU3 — type(scope): subject · Review: … · Smoke: … · Commit: auto`
- Задачи `- [ ] R02-T7 · T2 · Spec: …` с `Files`, `Acceptance`, `Paths`, опционально `UI:`.
- CU закрыт, когда все задачи `[x]` (не по тексту в заголовке).

## Запрещено в сессии

Сырые `git add`/`git commit`, `push`, production build в чате (build — в pre-commit hook), пароли из `.local/` в логах.

Claude Code headless (`--environment claude-code`) в проекте не используется; код в `run-phase.mjs` сохранён для совместимости с шаблоном.
