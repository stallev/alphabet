# Контракт скриптов границы CU (`cu-verify`, `cu-commit`)

**Тип:** Contract  
**Статус:** Canonical (скрипты написаны 2026-10-23; `cu-verify` проверен на отсутствие конфигурации линтера — ожидаемый отказ до R01-T2)  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Реализация:** [`scripts/cu-verify.mjs`](../../../scripts/cu-verify.mjs), [`scripts/cu-commit.mjs`](../../../scripts/cu-commit.mjs); чистая логика — [`scripts/phase-driver.mjs`](../../../scripts/phase-driver.mjs)  
**Смежные контракты:** [`phase_driver_contract.md`](phase_driver_contract.md), [`precommit_build_gate_contract.md`](precommit_build_gate_contract.md)  
**Источник:** `docs/examples/ai_first_tmp/scaffold/scripts/{cu-verify,cu-commit}.mjs`

---

## §1 Назначение

На границе commit unit агент не вызывает `git add`, `git commit`, `npm run test` и т. п. напрямую. Все проверки и запись в git идут через два скрипта:

| Скрипт | Роль |
|--------|------|
| `cu-verify.mjs [--full]` | Детерминированная проверка перед stage и review |
| `cu-commit.mjs stage\|commit --paths-file <f> [--subject "<s>"]` | **Единственный** способ изменить индекс и создать коммит |

Обоснование: сырой `git add -- .` и префиксные разрешения (`git commit --amend`, `--no-verify`) обходят защиту; скрипт отказывает им сам.

## §2 `cu-verify`

### §2.1 Шаги

Порядок выполнения; шаг пропускается, если его исполняемый файл ещё не существует (это позволяет запускать драйвер в R01, пока инструменты устанавливаются).

| # | Метка | Что запускается | Режим |
|---|-------|-----------------|-------|
| 1 | `lint` | `node_modules/eslint/bin/eslint.js .` | всегда |
| 2 | `deps` | `scripts/check-exact-deps.mjs` | всегда |
| 3 | `encoding` | `scripts/check-text-encoding.mjs` | всегда |
| 4 | `tokens` | `scripts/check-design-tokens.mjs` (появляется в R03-T1) | всегда |
| 5 | `test` | `node_modules/vitest/vitest.mjs run` | всегда; держит блокировку |
| 6 | `typecheck` | `node_modules/typescript/bin/tsc --noEmit` | только `--full` |

`docs:links` в `cu-verify` **не входит**: ссылки между документами фазы ссылаются вперёд (на файлы, создаваемые следующими CU), поэтому полная проверка ссылок — команда `npm run docs:links` в CU DoD документальных CU (там, где все цели уже существуют) и в CI.

- Каждый шаг запускается как `node <файл>` с `shell: false` (предсказуемое квотирование и завершение процессов).
- `--full` используется **только перед `reviewer`** (`Review: reviewer`), чтобы ревьюер не читал «красный» diff. Для `diff-only` CU типы проверяет pre-commit hook.
- Production build **не запускается**: его выполняет hook ([`precommit_build_gate_contract.md`](precommit_build_gate_contract.md)).
- Первый упавший шаг останавливает проверку.

### §2.2 Блокировка и сбой окружения Vitest

- Шаг `test` берёт `.local/phase-runs/vitest.lock` (ожидание живого владельца до 4 минут; мёртвый владелец снимается).
- Если Vitest запустился и не выполнил ни одного теста (`Tests  no tests` и `reading 'config'`) — шаг повторяется **один раз** внутри скрипта.
- Повторный сбой → `cu-verify: test harness-failed`, код выхода **3**. Это не ошибка кода: исполнитель код не меняет (`RESULT: verify-flake`, [`phase_driver_contract.md` §4.3](phase_driver_contract.md)).

### §2.3 Вывод и коды выхода

| Код | Вывод |
|-----|-------|
| 0 | `cu-verify: ok (<метки шагов>)` и `log: .local/phase-runs/verify-<ts>.log` |
| 1 | `cu-verify: <метка> failed`, хвост 40 строк, `log: …` |
| 3 | `cu-verify: test harness-failed`, хвост 40 строк, `log: …` |

Полный вывод пишется в лог; агент читает только хвост.

### §2.4 Ограничения

- Не пишет в git и в рабочие файлы проекта; пишет только в `.local/phase-runs/`.
- Проверки `deps`, `encoding`, `tokens` вызывает файлами напрямую (не через `npm run`); одноимённые `npm`-скрипты в `package.json` существуют для ручного запуска и CI.
- Агент не запускает второй `npm run test` / `vitest`: промпт CU запрещает это ([`phase_driver_contract.md` §4.3](phase_driver_contract.md)).

## §3 `cu-commit`

### §3.1 Аргументы (строгий разбор `parseCuCommitArgs`)

| Режим | Обязательные | Запрещённые |
|-------|-------------|-------------|
| `stage` | `--paths-file <f>` | `--subject` |
| `commit` | `--paths-file <f>`, `--subject "<type(scope): subject>"` | — |

`--amend`, `--no-verify`, `--force`, `--push`, `push` и неизвестные аргументы отклоняются (`forbidden`, `unknown`, `mode`, `paths-file`, `subject`).

### §3.2 Файл путей

Текстовый файл, по одному относительному пути в строке; пустые строки и `#`-комментарии игнорируются. Запись путей — ответственность исполнителя CU (драйвер заранее вписал все существующие `Files`).

Проверки (`assertStagePaths`): список не пуст; нет абсолютных путей и `..`; нет `.env*` (кроме `.env.example`) и ничего под `.local/`; каждый путь после нормализации лежит внутри репозитория; дубликаты схлопываются.

### §3.3 `stage`

1. Прочитать и проверить список (§3.2).
2. `git status --porcelain --untracked-files=all` → `partitionChangedPaths`: пути без изменений выводятся как `unchanged: <path>` и отбрасываются (каталог остаётся, если изменено что-то внутри).
3. Нет ни одного изменённого пути → ошибка `в списке путей нет изменённых файлов`.
4. `git add -- <paths>`; вывод `cu-commit: staged` + список.

### §3.4 `commit`

1. Те же проверки и отбрасывание неизменённых путей.
2. Сообщение: `buildCommitMessage(<git branch --show-current>, <subject>)`; отказы `branch` / `subject` / `length` останавливают коммит.
3. Индекс (`git diff --cached --name-only -z`) должен **совпасть** со списком (`assertCommitIndex`): лишний или недостающий файл → отказ с перечислением `extra` / `missing`.
4. `git commit -m "<branch>: <subject>"`; хуки выполняются (`commit-msg`, `pre-commit`); вывод пишется в лог.
5. Успех: `cu-commit: <hash>` + хвост вывода хука + путь лога. Падение хука → код 1 и хвост; исполнитель исправляет причину и повторяет `commit` (новый коммит, **никогда** `--amend`).

### §3.5 Логи

`.local/phase-runs/<stage|commit>-<ts>.log` рядом с файлом путей. При любой ошибке: `cu-commit: <причина>`, хвост ≤ 40 строк, путь лога, код выхода 1.

## §4 Инварианты

1. Индекс и история меняются только `cu-commit`. Сырые `git add`/`git commit` в прогоне фазы запрещены.
2. `push`, `--amend`, `--no-verify`, `--force` недоступны ни одному скрипту фазы.
3. В коммит попадают только файлы CU и файл задач; секреты, `.env*` и `.local/**` отсекаются.
4. Заголовок коммита = `<ветка>: <тема CU>`; ветка берётся из git, не из аргументов.

## §5 Права в окружении агента (Cursor)

Разрешить автозапуск: `node scripts/cu-verify.mjs`, `node scripts/cu-commit.mjs`, `node scripts/run-phase.mjs`, чтение git (`status`, `diff`, `log`). Не разрешать сырые `git add`/`git commit`/`push`. Для Claude Code (не используется, D13) допустим `.claude/settings.json` из шаблона.

## §6 Тесты

Логика отказов и сообщений покрыта в `scripts/phase-driver.test.mjs` (`assertStagePaths`, `assertCommitIndex`, `buildCommitMessage`, `parseCuCommitArgs`, `partitionChangedPaths`, `isHarnessTestFailure`, `logTail`). Интеграционный прогон скриптов — в Phase DoD R01.

## §7 Критерии соответствия

- [ ] `node scripts/cu-verify.mjs` на чистом проекте после R01-CU1 завершается `cu-verify: ok`
- [ ] `node scripts/cu-commit.mjs commit --paths-file x --subject "feat: x" --amend` отклоняется (`forbidden`)
- [ ] Путь `.local/x` и `.env.local` в файле путей отклоняются
- [ ] `commit` отказывает, если в индексе есть файл вне списка
- [ ] Скрипты не содержат `push` и `--no-verify` вне списка запрещённых
