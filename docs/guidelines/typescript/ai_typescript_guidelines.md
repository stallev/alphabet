# TypeScript guidelines (single-app)

**Аудитория:** AI-агенты в репозитории EdenGames (одно приложение, без workspace-пакетов).  
**Методология:** [`ai_first_methodology.md`](../../meta/ai_first_methodology.md)  
**Правило:** `typescript-types.mdc`, `domain-literals-and-codes.mdc`

## 1. Проверка типов

Перед завершением изменения в TS:

```bash
npm run typecheck
npm run lint
```

Тесты по [`project_quality_profile.md`](../../meta/project_quality_profile.md) D4 — логика игр, реестр, валидаторы.

## 2. Слои и зависимости

| Слой | Содержимое | Не импортирует |
|------|------------|----------------|
| `shared/domain` | Литералы, union-типы, коды ошибок, чистые Zod-DTO | Prisma, Next.js, `next-auth` |
| `shared/lib`, `shared/i18n` | Утилиты и словари без UI | `app/admin` мутации |
| `server/*` | DAL, Auth (`import "server-only"`), actions | — |
| `games/<slug>/` | Игровая логика, компоненты, data | чужие игры |
| `app/` | Маршруты, layouts, тонкие обёртки | прямой Prisma вне `lib/db.ts` |

**Антипаттерн:** inline-строки `"admin"`, `"pending"` — использовать константы из `shared/domain`.

## 3. Мутации

Предпочитайте discriminated union `{ ok: true, data? } | { ok: false, code: MutationErrorCode }` с кодами из домена. Без `@ts-ignore` без однострочного обоснования.

## 4. Prisma

Единственный клиент — singleton `lib/db.ts`. JSON-колонки — Zod перед записью. Enum в schema — источник для persistence; канонические union-типы — в `shared/domain`.
