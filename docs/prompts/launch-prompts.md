# Launch prompts — фазы реализации (R{NN})

Копируйте блок целиком в новую сессию агента. Поток, роли и гейты — в [`phase-implementation.md`](phase-implementation.md) и [`phase_driver_contract.md`](../implementation/contracts/phase_driver_contract.md). Заменяйте `{NN}` номером фазы. Не вставляйте пароли, токены и ключи.

| Что запускаем | Среда | Раздел |
|---------------|-------|--------|
| Phase DoR audit, фаза R{NN} | **Cursor AI** | [§1](#1-реализация-фаза-rnn) |

---

## 1. Реализация: фаза R{NN}

Канон: [`phase-implementation.md`](phase-implementation.md), [`phase_driver_contract.md`](../implementation/contracts/phase_driver_contract.md) §4.

### 1.1 Phase DoR audit (один раз на фазу, до первого CU)

```text
Выполни Phase DoR audit фазы R{NN}: роль architect, режим spec-gap. Проверь все задачи docs/implementation/phases/R{NN}_tasks.md по Definition of Ready, включая строку UI: у каждой UI-задачи и строку Seed: у задач с данными. Правь только docs/**. Верни ≤ 15 строк: изменённые файлы и закрытые пункты DoR.
```

### 1.2 Прогон фазы

**Cursor AI** (основная среда):

```text
Реализуй фазу R{NN} по docs/implementation/phases/R{NN}_tasks.md.
Среда: Cursor AI.
Коммиты CU заранее разрешены (Commit: auto). Не пушить.
```

Пример для следующей фазы кода:

```text
Реализуй фазу R02 по docs/implementation/phases/R02_tasks.md.
Среда: Cursor AI.
Коммиты CU заранее разрешены (Commit: auto). Не пушить.
```

**Возобновление** — драйвер продолжает с первого открытого CU:

```text
Продолжи фазу R{NN}: запусти node scripts/run-phase.mjs R{NN} --environment cursor и действуй по блокам IMPLEMENTER и ORCHESTRATOR. Между CU переноси только строку «<CU> — <hash>».
```

### 1.3 Что значит первая строка stdout (`STATUS:`)

| STATUS | Действие |
|--------|----------|
| `cu <id>` | Выполнить блоки; следующий CU — снова драйвер |
| `smoke-blocking <id>` | Человек делает ручной smoke, меняет `Smoke:` на `deferred`/`none`, запуск повторить |
| `dirty <id>` | Дерево изменено вне CU — разобрать, запуск повторить |
| `complete` | Фаза готова: `R{NN}-smoke.md` в `.local/phase-runs/`, push/PR — человеком |

Полная таблица кодов выхода — [`phase_driver_contract.md`](../implementation/contracts/phase_driver_contract.md) §4.5.
