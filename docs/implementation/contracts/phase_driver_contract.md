# Контракт драйвера фаз реализации

**Тип:** Contract  
**Статус:** Canonical (скрипты написаны и проверены тестами 2026-10-23)  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`agent-phase-orchestration.md`](../../guidelines/agent-phase-orchestration.md) (после R01-T18; до этого — [шаблон](../../examples/ai_first_tmp/docs/guidelines/agent-phase-orchestration.md)), [`phase_tasks.template.md`](../../meta/phase_tasks.template.md) (после R01-T8)  
**Реализация:** [`scripts/phase-driver.mjs`](../../../scripts/phase-driver.mjs), [`scripts/run-phase.mjs`](../../../scripts/run-phase.mjs), тесты — [`scripts/phase-driver.test.mjs`](../../../scripts/phase-driver.test.mjs)  
**Смежные контракты:** [`cu_boundary_scripts_contract.md`](cu_boundary_scripts_contract.md), [`precommit_build_gate_contract.md`](precommit_build_gate_contract.md)  
**Источник:** `docs/examples/ai_first_tmp/scripts/{phase-driver,run-phase}.mjs` (адаптация — §6)

---

## §1 Назначение и состав

Драйвер ведёт фазу кода по файлу задач: выбирает следующий открытый commit unit (CU), проверяет рабочее дерево, готовит файл путей и выдаёт промпт для сессии. Драйвер **ничего не пишет в git** и не вызывает сеть (в режиме `cursor`).

| Файл | Роль |
|------|------|
| `scripts/phase-driver.mjs` | Чистые функции (парсинг, решения, промпты, разбор аргументов). Без побочных эффектов |
| `scripts/run-phase.mjs` | CLI: читает файл задач, `git status`, пишет `.local/phase-runs/*`, печатает промпт |
| `scripts/cu-verify.mjs`, `scripts/cu-commit.mjs` | Граница CU: [`cu_boundary_scripts_contract.md`](cu_boundary_scripts_contract.md) |
| `scripts/phase-driver.test.mjs` | Тесты чистых функций (Vitest) |

Принцип: один свежий контекст на CU; состояние между CU — только файл задач и git.

## §2 Файл задач фазы

**Путь:** `docs/implementation/phases/<ID>_tasks.md`, где `<ID>` — `R01…R99` или `P01…P99` (`PHASE_PATTERN = /^[PR]\d{2}$/`). Путь строит `tasksPathFor(phase)`; каталог — константа `PHASES_DIR`.

### §2.1 Грамматика CU

```markdown
### R02-CU3 — refactor(games): move alphabet client code · Review: diff-only · Smoke: deferred · Commit: auto
```

| Элемент | Правило |
|---------|---------|
| Заголовок | `UNIT_HEADING_PATTERN = /^### ([PR]\d+-CU\d+) — (.+)$/`. Любой заголовок `## ` завершает CU |
| Первый сегмент (через ` · `) | Тема коммита `type(scope): subject`: типы `feat\|fix\|refactor\|perf\|docs\|test\|chore\|ci\|revert\|style`, scope `[a-z0-9-]+`, subject без точки и **без заглавных букв**; заголовок с префиксом ветки ≤ 120 символов |
| `Review: reviewer\|diff-only` | По умолчанию `reviewer` (безопасное значение) |
| `Smoke: none\|deferred\|blocking` | По умолчанию `none` |
| Прочие сегменты (`Commit: auto`, пометки) | Игнорируются |

### §2.2 Задачи

```markdown
- [ ] R02-T7 · T2 · Spec: [spec §N.M](path) · Contract: [contract §N.M](path)
      Files: `games/alphabet/components/**`, `games/alphabet/page.tsx`
      Acceptance: <проверка → исход>
      Paths: H [..] · N [..] · S [..]
      UI: /alphabet · roles: public · widths: 360,768,1280
```

- Задача — строка `- [ ] …` / `- [x] …` и все последующие строки до следующей задачи или заголовка.
- CU **выполнен** (`done`), если в нём есть хотя бы одна задача и все отмечены `[x]`. Пометка «выполнен» в заголовке CU **не** закрывает его.
- `Files:` — токены в обратных кавычках либо перечисление через запятую; `{a,b}` раскрывается; допустимы glob (`*`, `**`). Glob используются для проверки дерева, но **не** попадают в файл путей.
- `Paths:`, `Spec:`, `Acceptance:`, `UI:`, `Seed:` драйвером не разбираются (их читает исполнитель); строка `UI:` обязывает исполнителя к UI-проверке (§4.4).

## §3 `phase-driver.mjs`: публичный API

| Функция / константа | Контракт |
|---------------------|----------|
| `tasksPathFor(phase)` | `docs/implementation/phases/<phase>_tasks.md` |
| `parseCommitUnits(md)` | → `[{ id, subject, review, smoke, tasks, files, done }]` по §2 |
| `decidePhaseStep(units)` | → `{ action: 'complete' \| 'smoke-blocking' \| 'run', unit?, blocking?, next?, deferred }`; `smoke-blocking`, если выполненный CU **перед первым открытым** имеет `Smoke: blocking` |
| `classifyDirtyPaths(dirty, patterns, tasksFile)` | → `{ blocked, continuable }`: путь допустим, если совпал с `Files` CU или это файл задач |
| `parsePorcelain(text)` | Пути из `git status --porcelain` (для переименований — целевой) |
| `pathRefusalReason(p)` | `absolute` · `parent` (`..`) · `secret` (`.env`, `.env.*`, всё под `.local/`; `.env.example` разрешён) · иначе `null` |
| `assertStagePaths(list)` | Список непуст, без отказных путей, без дублей |
| `partitionChangedPaths(listed, changed)` | → `{ kept, unchanged }`; каталог в списке «изменён», если изменено что-либо внутри |
| `assertCommitIndex(staged, allowed)` | Индекс **равен** списку: ни лишнего, ни недостающего |
| `buildCommitMessage(branch, subject)` | `<branch>: <subject>`; отказы: `branch` (пусто/`:`/пробел), `subject`, `length` (> 120) |
| `concreteAllowPaths(unit, tasksFile)` | Файл задач + `Files` без glob |
| `renderSessionPrompt({unit, tasksPath, pathsFile, harness})` | Единственный промпт CU (§4.3) |
| `renderStatusLine(state, id)` | `STATUS: <state> <id>` |
| `renderSmokeList(phase, deferredUnits)` | Markdown-список отложенных smoke |
| `parseRunPhaseArgs(argv)` / `parseCuCommitArgs(argv)` | Строгий разбор; `--amend`, `--no-verify`, `--force`, `push` отклоняются |
| `isHarnessTestFailure(output)` | Vitest запустился и не выполнил тестов (`Tests  no tests` + `reading 'config'`) |
| `logTail(text, 40)` | Последние N строк — всё, что агент видит из лога |
| `summarizeSessionResult(stdout)` | Разбор JSON `claude -p` (только harness `claude`) |

## §4 `run-phase.mjs`

```
node scripts/run-phase.mjs <R01|…> [--environment cursor|claude-code] [--harness cursor|print|claude] [--model <m>] [--max-turns N]
```

### §4.1 Среды

| Значение | Поведение |
|----------|-----------|
| `--environment cursor` (по умолчанию), `--harness cursor` / `print` | **Один CU за вызов.** Печатает на stdout `STATUS: …` первой строкой, затем двухблочный промпт. Чат Cursor — тонкий оркестратор |
| `--environment claude-code`, `--harness claude` | Цикл `claude -p` на каждый CU. **Для проекта не используется** (решение D13); код сохранён для совместимости с шаблоном |
| Конфликт `--environment` и `--harness` | Выход 1, причина `environment-harness` |

### §4.2 Алгоритм одного вызова (cursor)

1. Проверить аргументы; нет файла задач → ошибка, выход 1.
2. `decidePhaseStep(parseCommitUnits(...))`.
3. `complete` → `STATUS: complete <phase>`, записать `.local/phase-runs/<phase>-smoke.md` (все `Smoke: deferred`), выход 0.
4. `smoke-blocking` → `STATUS: smoke-blocking <CU>`, выход 2.
5. `run` → `git status --porcelain`; пути вне `Files` CU и вне файла задач → `STATUS: dirty <CU>`, список в stderr, выход 1; пути внутри — «продолжение CU» (допустимо).
6. Записать `.local/phase-runs/<CU>.paths` — существующие конкретные пути из `Files` + файл задач.
7. `STATUS: cu <CU>` + промпт, выход 0.

Следующий вызов после коммита CU возобновляет с первого открытого CU.

### §4.3 Промпт CU (двухблочный, cursor)

`=== IMPLEMENTER ===` — выполняет **свежий субагент `implementer`**: читает только строки CU и указанные `§`; проверяет DoR; пишет код; отмечает чекбоксы CU **до** коммита; вписывает в файл путей ровно изменённые пути (драйвер заранее вписал все существующие `Files`; лишнее `cu-commit` пропускает как `unchanged`); UI-проверка при строке `UI:` (§4.4); `cu-verify`; `cu-commit stage`. Ответ ≤ 15 строк, первая строка `RESULT: staged | dor-fail | verify-fail | verify-flake`.

`=== ORCHESTRATOR ===` — выполняет чат: код и diff не читает; вызывает `implementer` с блоком дословно; по `RESULT`:

| RESULT | Действие оркестратора |
|--------|----------------------|
| `staged` | `Review: reviewer` → вызвать субагента `reviewer` (только id CU, путь задач, просьба прочитать `git diff --staged`; ответ ≤ 15 строк). `Review: diff-only` → перенести строку `Review:` implementer'а |
| `dor-fail` | Один вызов `architect` (spec-gap, только docs), затем один повторный вызов `implementer` |
| `verify-flake` | Один раз сам запустить `cu-verify`; зелёный → вызов `implementer` «только stage»; снова `harness-failed` → стоп |
| `verify-fail`, повторный `dor-fail` | Стоп, доклад пользователю |
| Blocker ревью | Исправление только blocker'а + тест, фиксирующий его; один review дельты. Если blocker тот же — один вызов `architect` (одна фраза инварианта в спеке), ещё один проход и review дельты; затем стоп. «Третьего круга нет» |
| Готов к коммиту | `node scripts/cu-commit.mjs commit --paths-file <f> --subject "<subject>"`. Хук упал — новый вызов `implementer` с хвостом; упал повторно — стоп |

После коммита оркестратор пишет одну строку `<CU> — <hash>` и снова вызывает `run-phase`. Сырые `git add`/`git commit`/`push` и production build в сессии запрещены.

### §4.4 UI-проверка

Если у задач CU есть строка `UI:`, исполнитель до `cu-verify` открывает экран на dev-сервере на указанных ширинах и возвращает в ответе `UI-check: <маршруты> · <роли> · <ширины> · ok`. Нет браузера/сервера после одного повтора — `ok` не пишется, это попадает в открытые вопросы. Задача с UI без строки `UI:` — провал DoR (`dor-fail`). Методика — `docs/guidelines/testing/ai_ui_verification.md` (создаётся в R01).

### §4.5 Коды выхода

| Код | Значение | Действие человека |
|-----|----------|-------------------|
| 0 | Следующий CU выдан (`STATUS: cu`) либо фаза завершена (`STATUS: complete`) | Различать по первой строке stdout |
| 1 | Грязное дерево вне `Files` · нет файла задач · неверные аргументы · сессия не удалась | Прочитать `.local/phase-runs/`, исправить, перезапустить — продолжится с первого открытого CU |
| 2 | `Smoke: blocking` на выполненном CU | Выполнить smoke, поменять заголовок на `deferred`/`none`, перезапустить |

## §5 Артефакты и безопасность

- Рабочий каталог `.local/phase-runs/` **обязан** быть в `.gitignore`; файлы путей, логи и `*-smoke.md` не коммитятся (`pathRefusalReason` отказывает любому пути под `.local/`).
- Драйвер отказывается обрабатывать пути с `..`, абсолютные, `.env*` (кроме `.env.example`).
- Коммиты между CU не переспрашиваются (`Commit: auto` утверждается вместе с файлом задач); push, PR, deploy — только человек после фазы.
- Перед стартом фазы рабочее дерево **чистое** (или содержит только файлы текущего CU): все документы планирования и сами скрипты закоммичены (R01 входное условие).

## §6 Отличия от шаблона (`ai_first_tmp`)

| Что | Шаблон | Проект |
|-----|--------|--------|
| ID фазы / CU | `P\d{2}`, `P\d+-CU\d+` | `[PR]\d{2}`, `[PR]\d+-CU\d+` (экспортируются как `PHASE_PATTERN`, `UNIT_HEADING_PATTERN`) |
| Файл задач | `docs/implementation/mvp/tasks/` | `docs/implementation/phases/` (`PHASES_DIR`, `tasksPathFor`) |
| Секреты | `.env*`, `.local/dev-secrets.json` | `.env*`, **любой** путь под `.local/` |
| Шаг `rules:sync` в промпте | есть | удалён (Claude Code не используется, D13) |
| UI-проверка в промпте | нет (только в руководстве) | строка `UI_CHECK_LINE` в блоке исполнителя |
| `cu-verify` | lint, test, [typecheck] | + проверки deps / encoding / tokens ([контракт](cu_boundary_scripts_contract.md) §2.1) |

Всё остальное — как в шаблоне; изменения поведения вносятся через этот контракт и тесты.

## §7 Тесты

`scripts/phase-driver.test.mjs` (Vitest) покрывает: парсинг CU и задач, `done`, раскрытие `{a,b}`, `decidePhaseStep` (complete / smoke-blocking / run), грязное дерево, отказные пути, индекс = список, сообщение коммита, аргументы CLI, маркеры промпта и ветвление `RESULT`, `isHarnessTestFailure`, разбор сессии `claude`, а также соглашения проекта (R-фазы, `tasksPathFor`, `.local/`, UI-строка, отсутствие `rules:sync`). Тесты выполняются в общем `npm run test`.

## §8 Критерии соответствия

- [ ] `npm run test` зелёный, включая `scripts/phase-driver.test.mjs`
- [ ] `node scripts/run-phase.mjs R01 --environment cursor` на чистом дереве печатает `STATUS: cu R01-CU1` и промпт
- [ ] Для `R01`, `R02`, `R03` `parseCommitUnits` находит 8 / 7 / 9 CU и все заголовки проходят `buildCommitMessage`
- [ ] `.local/` в `.gitignore`
- [ ] Драйвер не содержит вызовов `git add`, `git commit`, `git push`
