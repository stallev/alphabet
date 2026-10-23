# Phase run — прогон R{NN}

## Роль

Тонкий оркестратор одной фазы. Код commit unit пишет свежий `implementer`. Поток не копировать отсюда: канон — [`docs/guidelines/agent-phase-orchestration.md`](../guidelines/agent-phase-orchestration.md) (после R01-T18; до этого — [`phase_driver_contract.md`](../implementation/contracts/phase_driver_contract.md)).

## Preconditions

- [ ] `docs/implementation/phases/R{NN}_tasks.md` существует, Phase DoR audit закрыт
- [ ] У каждого CU в заголовке есть `Review`, `Smoke` и `Commit: auto` ([`phase_tasks.template.md`](../meta/phase_tasks.template.md) — после R01-T8)
- [ ] Для фаз с UI: миграции применены, `npm run db:seed` выполнен на dev-БД, есть `.local/dev-users.json` ([`ai_dev_accounts_and_seed.md`](../guidelines/testing/ai_dev_accounts_and_seed.md)); UI-задачи размечены строкой `UI:`
- [ ] Скрипты драйвера на месте: `scripts/run-phase.mjs`, `scripts/cu-verify.mjs`, `scripts/cu-commit.mjs`

## Стартовая фраза

Код пишет **Cursor AI** (основная среда). Человек запускает фазу одной фразой. В ней **обязана** быть среда: **`Среда: Cursor AI`**.

```text
Реализуй фазу R{NN} по docs/implementation/phases/R{NN}_tasks.md.
Среда: Cursor AI.
Коммиты CU заранее разрешены (Commit: auto). Не пушить.
```

Другие готовые фразы запуска (Phase DoR audit, возобновление) — [`launch-prompts.md`](launch-prompts.md).

Коммиты между CU не переспрашивать. Push, PR и deploy — после фазы, человеком.

## Task

### Cursor AI — `--environment cursor`

Один вызов на CU, из чата:

```bash
node scripts/run-phase.mjs R{NN} --environment cursor
```

Чат не пишет код и не читает исходники и diff. Блоки `IMPLEMENTER` и `ORCHESTRATOR` со stdout передать как есть: код — свежему `implementer`, review и commit — по блоку оркестратора. Между CU переносится только строка `<CU> — <hash>`. Следующий CU — снова `run-phase.mjs`.

## Forbidden

- `git push`, открытие PR, deploy, merge
- Сырые `git add` и `git commit` (только `cu-commit.mjs`)
- Production build в сессии (его выполняет hook)
- Вопрос человеку между CU
- Перенос diff, логов и review-транскрипта в следующий CU
- Пароли из `.local/dev-users.json` в ответах, логах, task-файле и коммите

## Verification

- [ ] Первая строка stdout драйвера — `STATUS:`
- [ ] После фазы все чекбоксы CU отмечены, есть `R{NN}-smoke.md` в `.local/phase-runs/`
- [ ] У каждого CU с `UI:`-задачами в ответе была строка `UI-check: … ok` ([`ai_ui_verification.md`](../guidelines/testing/ai_ui_verification.md))
- [ ] Ничего не запушено
