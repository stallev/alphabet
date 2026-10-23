# Профиль качества — EdenGames

**Тип:** Meta  
**Статус:** Canonical  
**Канон матрицы:** этот файл (образец `project_quality_profile.template.md` из шаблона в репозиторий не входит).  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`repo_restructure_plan.md`](./repo_restructure_plan.md) §A.2

```yaml
quality_profile: lean
overrides: {}
modules:
  auth: true
  design_lab: false
  sentry: false
  s3_uploads: false
  email_jobs: false
  i18n: true
  ios_safari_transport: false
```

## Выбранный уровень: Lean

| # | Измерение | Значение для проекта |
|---|-----------|----------------------|
| D1 | Docs | Реестр [`documentation_registry.md`](./documentation_registry.md); фазы R01–R03; контракты и спеки в `docs/implementation/` |
| D2 | Пути H / N / S | H + N для мутаций и ввода + S по признакам registry §2.3.2a; освобождения — с причиной |
| D3 | DoR / Phase audit | DoR проверяет оркестратор inline; Phase DoR audit — `architect` spec-gap до старта фазы (профиль lean) |
| D4 | Unit-тесты (Vitest) | Обязательны: `games/*/logic/**`, `games/registry.ts`, `lib/validators/**`; UI — не обязательны |
| D5 | E2E | Нет; ручной smoke в Acceptance и UI-check по строке `UI:` |
| D6 | Review | `reviewer` только для CU с T3 / `Paths: S` / runtime в sensitive zone; иначе `diff-only` |
| D7 | CI | `typecheck`, `lint`, `test`, `deps:check`, `encoding:check`, `build` в CI; локально перед коммитом — hook + CU verify |
| D8 | a11y | Семантический HTML, labels; правило `ui-semantics-a11y` после R01-CU5; без axe в CI |
| D9 | Perf / observability | Без Sentry и PSI-lab на MVP; ручная проверка критичных экранов при UI-задачах |
| D10 | Модули стека | Next.js 16.2.6, Prisma/Neon, Auth.js (admin), Tailwind v4, shadcn/ui, Zustand, Framer Motion, Gemini/OpenRouter |
| D11 | UI-check агента | Ширины 375 и 1280; роли из строки `UI:`; HOW — `docs/guidelines/testing/ai_ui_verification.md` (после R03) |

## Обоснование выбора

- Внутренний инструмент и каталог игр без платежей и PII на старте.
- Скорость поставки R01–R03 важнее полного e2e и Design Lab.
- Security floor (§5 шаблона) сохраняется: серверная auth, Zod, exact deps, reviewer на S.

## Журнал

| Дата | Изменение | Кто |
|------|-----------|-----|
| 2026-10-23 | Профиль создан (R01-T9) | implementer |
