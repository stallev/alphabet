# AI-First Methodology — EdenGames

**Тип:** Meta  
**Статус:** Canonical  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`repo_restructure_plan.md`](./repo_restructure_plan.md)  
**Связанные документы:** [`documentation_registry.md`](./documentation_registry.md), [`ai_agent_model_routing.md`](./ai_agent_model_routing.md), [`project_quality_profile.md`](./project_quality_profile.md)

---

## Введение

Документ описывает AI-first подход к разработке **EdenGames** — каталога христианских командных игр на **Next.js 16.2.6** (single-app репозиторий). Документация — runtime-инструкция для агентов: контракты и спецификации важнее импровизации.

Порядок создания и критерии документов — [`documentation_registry.md`](./documentation_registry.md).

## 1. Архитектурный шаблон

| Слой | Технология |
|------|------------|
| Framework | Next.js 16.2.6 App Router, Vercel |
| DB | Neon PostgreSQL 17 + Prisma 6.x |
| Auth | Auth.js v5, Credentials, JWT, роль `admin` |
| UI | shadcn/ui + Tailwind CSS v4, Zustand, Framer Motion |
| AI | Google Gemini / OpenRouter (генерация вопросов) |

Структура репозитория — [`repo_structure_contract.md`](../implementation/contracts/repo_structure_contract.md). Игры — `games/<slug>/`, общий код — `shared/`, `lib/`, `server/`.

## 2. Методология AI-first

### 2.1 Цикл агента

```
КОНТЕКСТ → TIER/DoR → ФАЗА → КОНТРАКТ → ЗАДАЧИ (CU) → [SPEC-GAP] → РЕАЛИЗАЦИЯ → ВЕРИФИКАЦИЯ → REVIEW (CU) → COMMIT
```

| Шаг | Действие |
|-----|----------|
| КОНТЕКСТ | `AGENTS.md`, `.cursor/rules/project-context.mdc` (после R01-CU4), [`project_quality_profile.md`](./project_quality_profile.md) |
| TIER/DoR | [`ai_agent_model_routing.md`](./ai_agent_model_routing.md) |
| ФАЗА | `docs/implementation/phases/R{NN}_phase_description.md` |
| КОНТРАКТ / SPEC | `docs/implementation/contracts/`, `docs/implementation/specs/` |
| ЗАДАЧИ (CU) | `docs/implementation/phases/R{NN}_tasks.md` по [`phase_tasks.template.md`](./phase_tasks.template.md) |
| [SPEC-GAP] | DoR не пройден → `architect` правит документы до кода |
| РЕАЛИЗАЦИЯ | Прогон фазы — драйвер [`phase_driver_contract.md`](../implementation/contracts/phase_driver_contract.md); каждый CU — свежий `implementer` |
| ВЕРИФИКАЦИЯ | CU DoD / phase DoD; UI-задачи — строка `UI:` и ручная проверка (после R03) |
| REVIEW | Runtime CU → `reviewer`; docs-only → `diff-only` |
| COMMIT | `cu-commit.mjs` на границе CU |

### 2.2 Фазовая декомпозиция

- Описание фазы: `docs/implementation/phases/R{NN}_phase_description.md`
- Задачи и commit units: `docs/implementation/phases/R{NN}_tasks.md`
- Запуск: [`docs/prompts/phase-implementation.md`](../prompts/phase-implementation.md)

### 2.3 Contracts и specs

Формат контрактов — секции Happy / Negative / Security / Concurrency / Drift / Acceptance (см. [`documentation_registry.md`](./documentation_registry.md) §2.3.4–2.3.5).

## 3. Иерархия источников истины

Канон — `.cursor/rules/project-context.mdc` (после R01-CU4): Cursor Rules → AGENTS.md → ADR → Contracts → PRD → Guidelines → Specs.

## 4. Типология документов

PRD · ADR · Contract · Spec · Phase · Tasks · Guideline · Cursor Rule · Game description

Шаблоны — `docs/meta/templates/`.
