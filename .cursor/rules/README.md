# Cursor Rules — манифест

Единственный индекс правил `.cursor/rules/*.mdc`. Иерархия источников истины — только в **project-context.mdc**.

**Методология:** [`docs/meta/ai_first_methodology.md`](../../docs/meta/ai_first_methodology.md)  
**Skill:** [`.cursor/skills/app-conventions/SKILL.md`](../skills/app-conventions/SKILL.md)

## Tier 0 — alwaysApply

| Rule | Режим | Назначение |
|------|-------|------------|
| `project-context.mdc` | always | Продукт, стек, инварианты, doc precedence |
| `product-docs-alignment.mdc` | always | Синхронизация docs при смене поведения |
| `typescript-types.mdc` | always | typecheck, слои `shared/domain`, `server/*`, `games/*` |
| `domain-literals-and-codes.mdc` | always | Коды/роли в `shared/domain`, без magic strings |
| `ai-dry-deduplication.mdc` | always | DRY / SOLID для агентов |
| `model-routing.mdc` | always | Tiers T0–T3, DoR, commit units |
| `agent-commit-pipeline.mdc` | always | verify → review → commit на границе CU |
| `agent-code-review-subagent.mdc` | requestable | Протокол review (diff-only / reviewer) |

## Tier 1 — globs

| Rule | Режим | Назначение |
|------|-------|------------|
| `nextjs-vercel-app-router.mdc` | globs | Next 16.2.6, `proxy.ts`, async APIs |
| `auth-security.mdc` | globs | Auth.js v5 split config, роли, защита мутаций |
| `data-server-actions-and-api.mdc` | globs | DAL, Prisma/Neon, Server Actions vs API |
| `security-xss-csrf.mdc` | globs | XSS, CSRF, CSP |
| `dependency-pinning.mdc` | globs | Exact deps, `deps:check` |
| `javascript-fundamentals.mdc` | globs | JS/TS fundamentals |
| `testing.mdc` | globs | Vitest (lean), размещение тестов |
| `app-router-streaming-loading.mdc` | globs | Suspense, `loading.tsx` |
| `admin-json-import.mdc` | globs | JSON импорт наборов (Alphabet / R02) |
| `import-boundaries.mdc` | globs | Границы импортов `games/*` / `shared/*` / `server/*` |

## Tier 2 — globs (UI)

| Rule | Режим | Назначение |
|------|-------|------------|
| `react-ui-components.mdc` | globs | RSC/client, компоненты |
| `react-one-component-per-file.mdc` | globs | Один компонент на файл |
| `react-logic-presentation.mdc` | globs | Логика vs presentation |
| `react-naming-conventions.mdc` | globs | Именование |
| `react-state-management.mdc` | globs | Zustand, SSR-safe state |
| `ui-design-system.mdc` | globs | Токены, `shared/ui`, `shared/game-kit` |
| `ui-mobile-first.mdc` | globs | Mobile-first layout |
| `ui-semantics-a11y.mdc` | globs | Семантика, a11y |
| `ui-icons-lucide.mdc` | globs | Lucide icons |
| `ui-animation-performance.mdc` | globs | Анимации без jank |
| `ui-toast-mutations.mdc` | globs | Toast после мутаций |
| `ui-messages-and-copy.mdc` | globs | Словари i18n, не inline |
| `ui-messages-bundle-splitting.mdc` | globs | Сплит словарей по игре |
| `ui-mutation-pending.mdc` | requestable | Pending UX (до admin UI) |
| `ui-optimistic-mutations.mdc` | requestable | Optimistic UI (отложено) |
| `admin-forms-layout.mdc` | requestable | Admin forms layout (отложено) |
| `patterns-tables-dnd.mdc` | requestable | Таблицы + DnD (отложено) |

## Создаётся в следующих фазах

| Rule | Фаза | Назначение |
|------|------|------------|
| `game-module-contract.mdc` | R03 | Manifest игры, `GameShell` |

Правила из плана «Не переносить» (`policy-packages`, `s3-file-asset-uploads`, `ios-safari-mutation-transport`, `psi-lab-testing`, `ui-prototype-fidelity`, `ui-runtime-verification`) в каталоге отсутствуют.
