---
name: app-conventions
description: >
  EdenGames single-app conventions: target tree (app, games, shared, server),
  DAL + Server Actions, Cursor Rules index. Use when adding routes, games,
  components, or data access.
---

# App conventions

**Контракт структуры:** [`docs/implementation/contracts/repo_structure_contract.md`](../../../docs/implementation/contracts/repo_structure_contract.md) §1  
**Правила:** [`.cursor/rules/README.md`](../../rules/README.md) — канонический манифест

## Приоритет

1. `.cursor/rules/*.mdc`
2. Этот skill
3. `docs/guidelines/**`

## Дерево (после R02)

```
app/                 — маршруты, тонкие page/layout
games/<slug>/        — manifest, logic, i18n, server, components
shared/ui|game-kit|i18n|domain|lib
server/auth|db       — Auth.js, Prisma singleton
proxy.ts             — JWT gate (auth.config only)
```

Первая игра: `games/alphabet/`. Описание: [`docs/games/alphabet.md`](../../../docs/games/alphabet.md).

## Область работы → правила

| Область | Правила | Документы |
|---------|---------|-----------|
| Маршруты / Next | `nextjs-vercel-app-router`, `app-router-streaming-loading` | `docs/guidelines/nextjs/` |
| Auth / admin API | `auth-security`, `security-xss-csrf` | ADR-001, auth guide |
| Данные / Prisma | `data-server-actions-and-api`, `admin-json-import` | `database_schema.md`, `prisma/schema.prisma` |
| UI компоненты | `react-ui-components`, `react-one-component-per-file`, `ui-design-system` | design_tokens, game_kit contracts |
| Копирайт / i18n | `ui-messages-and-copy`, `ui-messages-bundle-splitting` | `i18n_contract.md` |
| Игровая логика | `testing`, `domain-literals-and-codes` | `games/<slug>/logic/*.test.ts` |
| Зависимости | `dependency-pinning` | `npm run deps:check` |
| Импорты между слоями | `import-boundaries` | `repo_structure_contract` §3 |
| Новая игра | `game-module-contract` (**R03**) | game_manifest, game_routing contracts |

## Чеклист фичи

1. Типы/коды — `shared/domain` при кросс-модульном использовании
2. Чтение — `games/<slug>/server/**` или портальный DAL в `server/**`
3. Мутация — тонкий Server Action + `revalidateTag` / `redirect`
4. UI — примитивы из `shared/ui` / каркас `shared/game-kit` (R03)
5. Строки — `shared/i18n` или `games/<slug>/i18n`
6. Поведение изменилось — **product-docs-alignment**
