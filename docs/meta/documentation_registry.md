# Реестр документации EdenGames

**Тип:** Meta  
**Статус:** Canonical  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`project_quality_profile.md`](./project_quality_profile.md) (D1, D2), [`ai_agent_model_routing.md`](./ai_agent_model_routing.md) (DoR)

Краткий реестр для профиля **lean**: критерии путей H/N/S, DoR-ready чеклист и карта документов фаз R01–R03. Полный волновой реестр из шаблона не используется.

## §2.3.2a Критерии путей H / N / S

Единственный канон признаков; задачи ссылаются на `§N.M` в contract/spec, не дублируют текст.

| Путь | Обязателен, если | Что описать |
|------|------------------|-------------|
| **H** | Меняется наблюдаемое поведение: маршрут, flow, Server Action, API, DAL, фоновая задача | Предусловие → действие → исход (UI, redirect, toast, БД) |
| **N** | Внешний ввод; мутация/переход состояния; I/O может упасть; данных может не быть | validation · not found · conflict · invalid transition · I/O · empty + код/ключ сообщения/UI |
| **S** | Sensitive zone (`middleware`, `lib/auth*`, `prisma`, `app/api`, `app/admin`); доступ по роли/ownership; PII/секреты; публичный endpoint/upload | anon → login; чужая роль → 403; IDOR → 404; отказ на сервере |

**Освобождения** (`Paths: n/a — <причина>`): T0 copy/CSS · docs-only · tooling · рефакторинг без смены поведения · презентация без данных/мутаций.

Признак **S** → задача минимум **T3**, отдельный CU, `reviewer` по D6.

## §2.3.6 DoR-ready checklist (lean)

Для PRD, contract, spec, ADR (ADR — пункты 1, 2, 6, 7):

1. Якоря `§N.M` для ссылок из задач.
2. Нет `TBD` в MUST; открытое — в Open questions с владельцем.
3. Пути H/N/S по §2.3.2a или `N/A` с причиной из освобождений.
4. Коды ошибок — `lib/validators` / доменные константы; тексты — ключи i18n, не сырые строки в spec.
5. Acceptance проверяема (команда, тест, smoke, UI-check).
6. `Проверено по` для runtime/auth/data — пин совпадает с `package.json`.
7. Touchpoints: spec — Files/area; contract — Policy & layer; ADR — affected documents.

Задачи пишутся только по документам, прошедшим чеклист.

## Карта документов R01–R03

| Документ | Где живёт | Статус |
|----------|-----------|--------|
| Методология, routing, профиль, шаблоны | `docs/meta/` | R01-CU3 |
| Промпты фазы | `docs/prompts/` | R01-CU2 |
| Cursor rules tier 0–2, agents | `.cursor/` | R01-CU4–CU5 |
| Guidelines | `docs/guidelines/` | R01-CU6–CU7 |
| ADR-003…006, индекс | `docs/architecture/` | R01-CU8 |
| `AGENTS.md`, README | корень | R01-CU9 |
| Контракты структуры, игр, i18n | `docs/implementation/contracts/` | R01 / R02 |
| Спеки миграции, портала, shell | `docs/implementation/specs/` | R02 / R03 |
| Фазы R01–R03 | `docs/implementation/phases/` | Draft → Canonical по мере CU |
| Игра Alphabet | `games/alphabet/` | R02–R03 |

## Связанные документы

- [`phase_tasks.template.md`](./phase_tasks.template.md) — формат задач и CU
- [`repo_restructure_plan.md`](./repo_restructure_plan.md) §A.4 — белый список переноса
