# ADR-002 — AI Generator: Demo Mode, Credits Gate, Server-Side API

**Status:** Accepted  
**Date:** 2026-06-08  
**Authors:** AI Agent (Cursor)

---

## Context

Компонент `AIGenerator.tsx` выполняет прямой вызов OpenRouter API с клиентской стороны браузера, используя ключ `NEXT_PUBLIC_OPENROUTER_API_KEY`. Это приводит к двум критическим проблемам:

1. **Security hole** — `NEXT_PUBLIC_*` переменные встраиваются в клиентский бандл и видны любому пользователю через DevTools. API-ключ может быть извлечён и использован злоумышленниками.

2. **Отсутствие контроля расходов** — любой посетитель может инициировать генерацию 150 вопросов (дорогостоящий вызов), что делает платное использование Gemini/OpenRouter нежизнеспособным без системы кредитов.

**Дополнительный контекст:**
- Продукт планирует систему credits для авторизованных пользователей (`subscriber`, `editor` роли — post-MVP)
- Необходимо показывать ценность AI-функциональности для неавторизованных пользователей без реальных API-вызовов
- Текущая архитектура несовместима с масштабированием

---

## Decision

### 1. Перенос AI-вызова на сервер

Создать Route Handler `app/api/admin/ai/generate/route.ts` с обязательной проверкой `auth()` + `role === 'admin'`. Ключ API хранится в `process.env.OPENROUTER_API_KEY` (без `NEXT_PUBLIC_` префикса).

### 2. Demo Mode для неадминистраторов

Компонент `AIGenerator.tsx` определяет режим по сессии:

```
session?.user?.role === 'admin' → реальная генерация через /api/admin/ai/generate
иначе                           → Demo Mode (fake animation + статичные мок-данные)
```

Demo Mode сохраняет полную интерактивность формы (тема, язык, аудитория), но после нажатия «Generate» выполняет анимированную симуляцию генерации (~3 сек), затем показывает первые 3 вопроса из `lib/demo-questions.ts` с `CreditsGateOverlay` поверх остального контента.

### 3. Переименование переменной окружения

| До | После |
|---|---|
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | `OPENROUTER_API_KEY` |
| Доступен в браузере | Только server-side |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  AIGenerator.tsx (client component)                 │
│                                                     │
│  useSession() → isDemoMode = role !== 'admin'       │
│                                                     │
│  [handleGenerate]                                   │
│     ↓ isDemoMode?                                   │
│     ├── YES → fakeGenerationAnimation()             │
│     │          → show DEMO_SUITE (3 visible)        │
│     │          → <CreditsGateOverlay />              │
│     │                                               │
│     └── NO → POST /api/admin/ai/generate            │
│               ↓                                     │
│  ┌────────────────────────────────┐                 │
│  │  route.ts (server-only)        │                 │
│  │  auth() + role === 'admin'     │                 │
│  │  OPENROUTER_API_KEY (env)      │                 │
│  │  Fallback: qwen → mistral      │                 │
│  │  → deepseek                    │                 │
│  │  Returns: { suite }            │                 │
│  └────────────────────────────────┘                 │
└─────────────────────────────────────────────────────┘
```

---

## QuestionSuite JSON Schema (canonical)

Это канонический формат для всех операций: импорт JSON, AI-генерация, экспорт, хранение в БД.

```json
{
  "title": "Acts of the Apostles",
  "language": "en",
  "questionsList": [
    {
      "id": 1,
      "questionContent": "Question text (without answer hint)",
      "complexityLevel": "easy | medium | hard",
      "answerType": "ID | String",
      "answersList": [
        { "id": 1, "value": "Option A" },
        { "id": 2, "value": "Option B" },
        { "id": 3, "value": "Option C" },
        { "id": 4, "value": "Option D" }
      ],
      "rightAnswerId": 3,
      "rightAnswerString": null
    }
  ]
}
```

**Правила генерации:**

| Параметр | Значение |
|---|---|
| Количество вопросов | 150 (ровно) |
| Распределение сложности | 50 easy / 50 medium / 50 hard |
| Типы ответов | 100% `ID` (4 варианта) |
| Язык | Определяется полем `language` |
| `rightAnswerId` | Случайная позиция (1–4), не фиксированная |
| Запрет в `questionContent` | Правильный ответ не должен присутствовать в тексте вопроса |

---

## Prompt Engineering Requirements

### Системные требования к промпту

1. **Язык** — все вопросы и ответы строго на выбранном языке
2. **Количество** — ровно 150 уникальных вопросов
3. **Распределение** — строго 50/50/50 по уровням
4. **Источник** — Синодальный перевод (RU), ESV/NIV (EN), Огиенко (UK), Luther 2017/Elberfelder (DE), Cornilescu (RO)
5. **Фокус** — факты, события, имена, география
6. **Запрет** — вопросы о греческом/еврейском значении слов
7. **Чистота** — текст вопроса не содержит правильный ответ
8. **Рандомизация** — позиция правильного ответа случайная

### Уровни сложности

| Уровень | Требование |
|---|---|
| `easy` | Неочевидные факты, требует знания текста. Не «Кто построил ковчег?» |
| `medium` | Хронология, богословские связи, второстепенные персонажи |
| `hard` | Очень сложные: редкие имена, точные цифры, специфические географические детали |

### Fallback Chain (OpenRouter)

```
1. qwen/qwen-2.5-72b-instruct:free
2. mistralai/mistral-7b-instruct:free
3. deepseek/deepseek-chat:free
```

---

## Demo Mode Behavior by Role

| Роль / Состояние | Форма | Кнопка Generate | Результат |
|---|---|---|---|
| Неавторизован | Активна | Активна | Demo (3 вопроса + overlay) |
| `subscriber` (post-MVP) | Активна | Активна с кредитами | Реальная генерация (1 кредит) |
| `editor` (post-MVP) | Активна | Активна с кредитами | Реальная генерация (1 кредит) |
| `admin` | Активна | Активна (без кредитов) | Реальная генерация |

---

## Credits System Roadmap (Post-MVP)

### Prisma Schema Extension (будущее)

```prisma
model UserCredits {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  balance   Int      @default(0)
  updatedAt DateTime @updatedAt
}

model CreditTransaction {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  amount      Int
  type        String   // 'grant' | 'consume'
  description String?
  createdAt   DateTime @default(now())
}
```

### Модель распределения кредитов (план)

| Роль | Начальный баланс | Стоимость генерации |
|---|---|---|
| `subscriber` | 3 кредита | 1 кредит = 150 вопросов |
| `editor` | 10 кредитов | 1 кредит = 150 вопросов |
| `admin` | Без ограничений | — |

### Route Handler при наличии кредитов

```
POST /api/ai/generate  (для subscriber/editor — с проверкой баланса)
├── auth() — обязательно
├── Проверка balance > 0
├── Начало транзакции: balance -= 1
├── Вызов AI
├── Успех: commit транзакции
└── Ошибка: rollback (кредит не списывается)
```

---

## Files Changed

| Файл | Изменение |
|---|---|
| `app/api/admin/ai/generate/route.ts` | Новый — server-side AI Route Handler |
| `components/AIGenerator.tsx` | Demo Mode + fetch к server route |
| `components/CreditsGateOverlay.tsx` | Новый — overlay для блокировки результата |
| `lib/demo-questions.ts` | Новый — статичные мок-данные |
| `.env.local` | `NEXT_PUBLIC_OPENROUTER_API_KEY` → `OPENROUTER_API_KEY` |
| `.env.local.example` | То же переименование |

---

## Consequences

**Положительные:**
- API-ключ больше не утекает в клиентский бандл
- Полный контроль расходов на AI через server-side авторизацию
- Демо-режим показывает реальную ценность продукта без затрат
- Архитектура готова к внедрению credits system

**Отрицательные / Компромиссы:**
- Admin-генерация требует серверного round-trip (незначительная задержка)
- `AIGenerator.tsx` становится зависимым от auth сессии (`useSession`)
- Для отображения Demo Mode требуется небольшой набор статичных тестовых вопросов

---

## Related

- [`prisma/schema.prisma`](../../prisma/schema.prisma) — модели `User`, `QuestionSuite`, `Question`
- [`lib/auth.ts`](../../lib/auth.ts) — Auth.js (server-only)
- [`ADR-001`](ADR-001-migration-to-nextjs.md) — миграция на Next.js (контекст)
- [`docs/AI_SYSTEM.md`](../AI_SYSTEM.md) — документация AI-системы (устаревшая, данный ADR актуализирует)
