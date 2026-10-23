# R{NN} Tasks — {Phase title}

**Тип:** Tasks  
**Статус:** Draft | Canonical  
**Версия:** 1.0  
**Дата:** YYYY-MM-DD  
**Волна:** W{N}  
**Зависит от:** [`R{NN}_phase_description.md`](../phases_tasks_descriptions/R{NN}_phase_description.md), contracts / specs, прошедшие [registry §2.3.6](./documentation_registry.md#236-implementation-ready-dor-ready-checklist)  
**Связанные документы:** [список путей]

---

<!--
Шаблон задач фазы. Копировать в docs/implementation/phases/R{NN}_tasks.md.
Канон правил:
  - Definition of Ready, task tiers, commit units — docs/meta/ai_agent_model_routing.md § DoR, § Commit units
  - Критерии путей H / N / S — docs/meta/documentation_registry.md §2.3.2a
  - Глубина DoR, путей, тестов и review — профиль качества docs/meta/project_quality_profile.md (D2–D7)
Не копировать критерии в этот файл — только ссылки и Paths на задачу.
-->

## Purpose

1–2 предложения: что фаза доставляет и где DoD ([`R{NN}_phase_description.md`](../phases_tasks_descriptions/R{NN}_phase_description.md)).

## Phase DoR audit

Выполняется **до** первой задачи фазы: один вызов `architect` в режиме `spec-gap` на все задачи ниже (профиль D3: `standard` / `strict`; `lean` — оркестратор inline; `prototype` — секцию удалить).

- [ ] Все задачи прошли DoR — дата · исполнитель · изменённые документы
- [ ] Open questions связанных документов пусты или не блокируют задачи этой фазы

## Commit plan

<!--
Правила commit unit (CU):
  - CU = один логический коммит: несколько T0/T1 одной темы ИЛИ одна T2.
  - T3 (в т.ч. любая задача с Paths S) — всегда отдельный CU.
  - Ориентир ≤ ~400 hand-written строк на CU; больше — делить при планировании.
  - Заголовок CU = commit subject: `type(scope): subject` (agent-commit-pipeline).
  - Review: по профилю D6 (agent-code-review-subagent § Depth): `standard` / `strict` — `reviewer` при runtime-коде; `diff-only` — только docs / .mdc / tests / tooling.
  - Smoke: `none` | `deferred` | `blocking`. По умолчанию `none`. Грамматика заголовка — docs/guidelines/agent-phase-orchestration.md §5.1.
  - Commit: auto — агент коммитит на границе CU после зелёной ВЕРИФИКАЦИИ и review без blockers.
Формат задачи:
  - [ ] R{NN}-T{k} · T0|T1|T2|T3 · Spec: [file §N.M](…) · Contract: [file §N.M](…) · ADR/PRD: [ID](…)
        Files: <пути / globs> · Acceptance: <проверка → ожидаемый исход>
        Paths: H [§] · N [§: случаи] · S [§, authz row]   |   Paths: n/a — <причина из registry §2.3.2a>
        UI: <маршруты> · roles: <роли> · widths: 360,768,1280   |   UI: n/a — <не UI>     (обязательна для UI-задач; HOW — docs/guidelines/testing/ai_ui_verification.md)
        Seed: <fixtures добавлены/изменены под экран>   |   Seed: n/a     (HOW — docs/guidelines/testing/ai_dev_accounts_and_seed.md)
  - Строки `UI:` / `Seed:` — часть задачи, не заголовка CU: грамматика заголовка (§5.1 agent-phase-orchestration) не меняется.
  - UI-задача без `UI:` не проходит DoR. Объём проверки — профиль D11.
-->

### R{NN}-CU1 — feat(portal): {subject} · Review: reviewer · Smoke: none · Commit: auto

- [ ] R{NN}-T1 · T1 · Spec: [{spec} §3](../specs/{spec}.md) · Contract: [{contract} §2](../contracts/{contract}.md)
      Files: `app/src/app/...` · Acceptance: {проверка} → {исход}
      Paths: H [{spec} §3.1] · N [{spec} §3.2: validation, empty]
      UI: /{route} · roles: {role} · widths: 360,768,1280
      Seed: {fixtures для empty / many / long text}
- [ ] R{NN}-T2 · T0 · Files: `app/src/lib/messages/...` · Acceptance: {проверка} → {исход}
      Paths: n/a — copy · UI: n/a — copy

**CU DoD:** `npm run typecheck` · `npm run lint` · тесты по профилю D4 / D5 · `npm run db:seed` идемпотентен · UI-check по [`ai_ui_verification.md`](../guidelines/testing/ai_ui_verification.md) (строка `UI-check:` в ответе) · smoke {route} (H + N)

### R{NN}-CU2 — feat(auth): {subject} · Review: reviewer · Smoke: none · Commit: auto

- [ ] R{NN}-T3 · T3 · Contract: [{contract} §4](../contracts/{contract}.md) · ADR: [adr_{NNN}](../../../prds/07_governance/adr_{NNN}_{topic}.md)
      Files: `app/src/app/.../actions.ts`, `lib/auth.ts` · Acceptance: {проверка} → {исход}
      Paths: H [§4.1] · N [§4.2: duplicate, invalid transition] · S [§4.3, authz «{role} × {resource}»: anon → login, чужая роль → 403, IDOR → 404]

**CU DoD:** `npm run typecheck` · `npm run lint` · тесты по профилю D4 / D5 (S-пути — тестом с `lean`) · smoke H / N / S (403 и IDOR)

### R{NN}-CU3 — docs(docs): sync {area} docs · Review: diff-only · Smoke: none · Commit: auto

- [ ] R{NN}-T4 · T0 · Files: `docs/...` · Acceptance: ссылки открываются, нет drift с кодом CU1–CU2
      Paths: n/a — docs-only

## Verification (phase)

- [ ] Все CU закоммичены; у каждого trace `Review: …`
- [ ] Phase DoD из `R{NN}_phase_description.md`
- [ ] У каждого CU с `UI:`-задачами в ответе есть строка `UI-check: … ok`
- [ ] Docs sync (product-docs-alignment) — в соответствующем CU, не отдельным хвостом без CU

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [`R{NN}_phase_description.md`](../phases_tasks_descriptions/R{NN}_phase_description.md) | DoD фазы |
| [`ai_agent_model_routing.md`](./ai_agent_model_routing.md) | DoR, task tiers, commit units |
| [`documentation_registry.md`](./documentation_registry.md) §2.3.2a / §2.3.6 | Критерии путей H / N / S, DoR-ready документы |
