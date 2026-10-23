# Схема базы данных (канон)

**Тип:** Architecture  
**Статус:** Canonical  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Источник:** [`prisma/schema.prisma`](../../prisma/schema.prisma)  
**Зависит от:** ADR-001, ADR-003, [`repo_structure_contract.md`](../implementation/contracts/repo_structure_contract.md) §2

---

## Обзор

PostgreSQL 17 (Neon). Prisma Client — singleton [`server/db/client.ts`](../../server/db/client.ts). Имена таблиц и миграции не менялись в R02.

## Перечисления

| Enum (Prisma) | Таблица SQL | Владелец | Значения |
|---------------|-------------|----------|----------|
| `UserRole` | `user_role` | портал | `admin`, `editor`, `subscriber` |
| `SuiteSourceType` | `suite_source_type` | `games/alphabet` | `json`, `manual`, `ai`, `system` |
| `ComplexityLevel` | `complexity_level` | `games/alphabet` | `easy`, `medium`, `hard` |

## Модели

### `User` → `users`

| | |
|---|---|
| **Владелец** | портал |
| **Назначение** | Учётные записи (MVP: роль `admin`) |
| **Чтение** | `server/auth/`, сессия JWT; админка — список при необходимости |
| **Запись** | seed / ручное создание; post-MVP — регистрация |

Поля: `id`, `email`, `password_hash`, `name`, `role`, `created_at`, `updated_at`. Связь: `suites` → `QuestionSuite[]`.

### `QuestionSuite` → `question_suites`

| | |
|---|---|
| **Владелец** | `games/alphabet` |
| **Назначение** | Наборы вопросов (системные и пользовательские) |
| **Чтение** | `games/alphabet/server/`, публичный `GET /api/suites`, админка |
| **Запись** | `games/alphabet/server/actions/` (import, delete), admin JSON import |

Поля: `id`, `title`, `language` (ISO 639-1), `is_system`, `source_type`, `description`, `created_by_id`, timestamps. Индексы: `language`, `is_system`.

### `Question` → `questions`

| | |
|---|---|
| **Владелец** | `games/alphabet` |
| **Назначение** | Вопросы внутри набора |
| **Чтение** | через DAL игры и API наборов |
| **Запись** | вместе с набором (import, AI, ручной редактор) |

Поля: `legacy_id`, `question_content`, `complexity_level`, `answers_list` (JSON), `answer_type` (`ID` / `String`), `right_answer_id`, `right_answer_string`, `sort_order`, `suite_id`. Индекс: `suite_id`. `onDelete: Cascade` от набора.

## Правила доступа

| Операция | Кто |
|----------|-----|
| Публичное чтение наборов для игры | без auth (Route Handler + Prisma) |
| Import / delete наборов | `role === 'admin'` в action и `proxy.ts` для `/admin/**` |
| Мутации пользователей | post-MVP |

Новые игры с БД добавляют **свои** модели и DAL в `games/<slug>/server/` (ADR-003, контракт §2).

## Критерии соответствия

- [ ] Документ согласован с `prisma/schema.prisma`
- [ ] Владельцы `QuestionSuite` / `Question` — только Alphabet
