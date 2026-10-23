# Authentication — EdenGames

**Стек:** Next.js **16.2.6** · Auth.js v5 · Prisma · Neon · Credentials + JWT  
**Методология:** [`ai_first_methodology.md`](../../meta/ai_first_methodology.md)  
**Правила:** `auth-security.mdc`, `security-xss-csrf.mdc`  
**Схема:** [`prisma/schema.prisma`](../../../prisma/schema.prisma)

## 1. Четыре слоя

```
Browser
  → proxy.ts (JWT через auth.config.ts, без Prisma)
  → layout (UX-редиректы)
  → Route Handlers / Server Actions — auth()
  → server/* DAL → lib/db.ts → Neon
```

MVP: **Credentials** (email + password), `session: { strategy: "jwt" }`, роли `admin` | `editor` | `subscriber` (post-MVP для editor/subscriber). Админ-маршруты — только `role === 'admin'`.

## 2. Split config (обязательно)

| Файл | Где используется | Содержимое |
|------|------------------|------------|
| `lib/auth.config.ts` | `proxy.ts` | providers, JWT callbacks, pages — **без Prisma** |
| `lib/auth.ts` | Server Actions, handlers | `import "server-only"`, Prisma, bcrypt в `authorize` |

Не импортировать полный `auth.ts` в proxy.

## 3. proxy.ts

- Экспорт `proxy`, не `middleware` (Next.js 16).
- Matcher: защищённые префиксы (`/admin/**` и т.д.).
- Проверка роли по JWT; без обращения к БД на периметре.

## 4. Защита маршрутов

- **Периметр:** `proxy.ts` + `auth.config.ts`.
- **Мутации:** `auth()` в каждом Server Action и Route Handler; для admin API — `role === 'admin'`.
- **Данные:** проверка ownership в DAL при необходимости (post-MVP).

## 5. Вне scope MVP

OAuth (Google), сторонний OIDC, сброс пароля по email — не реализуются в R01–R03; не добавлять в конфиг без ADR.

## 6. Связанные документы

- [`ai_security_xss_csrf_guidelines.md`](../security/ai_security_xss_csrf_guidelines.md)
- Контракты фазы R02 после переноса `server/*`
