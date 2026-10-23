# Architecture Decision Process — EdenGames

**Тип:** Guideline  
**Статус:** Canonical  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`adr_index.md`](./adr_index.md)

**Методология:** [`docs/meta/ai_first_methodology.md`](../meta/ai_first_methodology.md)

---

## Purpose

Фиксирует **когда** и **как** команда и AI-агенты создают, обновляют и принимают ADR. Цель — не менять стек и границы модулей «тихо» в коде без записи решения.

---

## When to write an ADR

| Trigger | Example | Action |
|---------|---------|--------|
| Новый внешний сервис | Замена провайдера БД | Новый ADR + consequences в ADR-005 |
| Границы импортов / структура | Монорепо, общий банк вопросов | ADR-003 или amendment |
| Auth/session model | OAuth вместо Credentials | Новый ADR; deprecate раздел в старом |
| Pin major framework | Next.js 17 | Новый ADR; supersede ADR-005 |
| i18n / URL policy | Префикс `[locale]` в URL | Amendment ADR-006 |

**MAY** — локальное решение в одном модуле без cross-import impact: достаточно contract или guideline.

**MUST NOT** — менять **Accepted** ADR только в коде; нужен новый ADR с supersede или явное решение владельца в задаче.

---

## ADR document template

Каждый ADR **MUST** использовать структуру из [`docs/meta/templates/adr.template.md`](../meta/templates/adr.template.md): Context, Decision, Rejected alternatives, Consequences, критерии соответствия.

Для security/auth ADR **MUST** заполнить подраздел Security в Consequences (или «N/A — не затрагивает»).

---

## Status lifecycle

| Status | Meaning |
|--------|---------|
| Proposed | Черновик; не блокирует код, если задача не зависит |
| Accepted | Канон; код и контракты должны соответствовать |
| Deprecated | Заменяется; не применять к новому коду |
| Superseded | Указать заменяющий ADR в заголовке |

---

## Workflow

1. Проверить [`adr_index.md`](./adr_index.md) на конфликт с существующими Accepted ADR.
2. Создать файл `ADR-NNN-….md`, добавить строку в индекс.
3. Обновить затронутые contracts/specs в той же фазе или CU (см. § Affected в ADR).
4. Для runtime/auth — сверка Context7 (см. индекс).

---

## Requirements

1. **MUST** — архитектурное решение, меняющее стек, auth, jobs или кэш — оформляется ADR или правкой Accepted ADR с change log.
2. **MUST** — новый ADR добавляется в `adr_index.md` в той же сессии.
3. **MUST NOT** — дублировать полный текст ADR в `AGENTS.md`; только ссылка.
4. **MUST** — перечисленные в ADR contracts обновлены в том же изменении, если acceptance задачи это требует.

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [`adr_index.md`](./adr_index.md) | Реестр ADR |
| [`ai_agent_model_routing.md`](../meta/ai_agent_model_routing.md) | DoR, spec-gap |
| [`ADR-005-nextjs-vercel-runtime.md`](./ADR-005-nextjs-vercel-runtime.md) | Образец runtime ADR |
