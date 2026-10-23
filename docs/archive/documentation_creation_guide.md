# Руководство по созданию документации — проект «Алфавит»

> **Назначение:** Подробные инструкции для AI-агентов по созданию проектной документации волнами.  
> **Методология:** КОНТЕКСТ → ФАЗА → КОНТРАКТ → ЗАДАЧИ → ВЕРИФИКАЦИЯ  
> **Реестр волн:** этот файл является реестром и инструкцией одновременно.

---

## Принципы документирования

1. **Документация предшествует коду** — перед реализацией фичи создаётся документ-контракт
2. **Единый источник истины** — каждый факт фиксируется в одном месте, остальные ссылаются
3. **Волновая структура** — документация создаётся итерациями (W0, W1, W2...), каждая волна завершается перед следующей
4. **Жизнеспособность** — документы обновляются при изменении поведения системы
5. **AI-ready** — документы структурированы для чтения AI-агентами: заголовки, таблицы, checklist

---

## Структура папок документации

```
docs/
├── meta/                           Методология и управление документацией
│   ├── documentation_creation_guide.md    (этот файл)
│   └── ai_first_methodology.md            Цикл разработки AI-first
│
├── architecture/                   Архитектурные решения
│   ├── ADR-001-migration-to-nextjs.md     Миграция Vite → Next.js
│   ├── ADR-002-auth-strategy.md           Стратегия аутентификации
│   ├── database_schema.md                 Схема БД (canonical)
│   └── migration-best-practices.md       Правила Prisma миграций
│
├── product/                        Продуктовые требования
│   ├── overview.md                        Обзор продукта (перенесён из OVERVIEW.md)
│   ├── game_mechanics.md                  Механики игры
│   ├── user_roles.md                      Роли и права доступа
│   └── user_flows/                        Пользовательские сценарии
│       ├── admin_suite_import.md
│       ├── admin_suite_manual_create.md
│       └── game_session.md
│
├── implementation/                 Контракты и спецификации реализации
│   ├── P01_vite_react_baseline.md         (архив — исходный стек)
│   ├── P02_nextjs_migration.md            Миграция на Next.js
│   ├── P03_database_and_auth.md           БД + Auth.js
│   ├── P04_admin_panel.md                 Admin панель
│   └── P05_google_oauth_roles.md          Google OAuth + роли (post-MVP)
│
├── guidelines/                     Руководства для разработки
│   ├── nextjs/                            Next.js паттерны
│   ├── auth/                              Auth.js паттерны
│   └── testing/                          Тестирование
│
└── examples/                       Референсные проекты
    └── fitapp/                            Fitapp (Pulse) — референс
```

---

## Волны документации

### W0 — Фундамент и Мета ✅ ВЫПОЛНЕНО (текущая сессия)

**Цель:** Создать базовую инфраструктуру для AI-driven разработки.

| Документ | Путь | Статус |
|---------|------|--------|
| Инструкции для агентов | `AGENTS.md` | ✅ Создан |
| Cursor Rules (5 файлов) | `.cursor/rules/` | ✅ Созданы |
| Руководство по документации | `docs/meta/documentation_creation_guide.md` | ✅ Создан (этот файл) |
| ADR-001 Миграция Next.js | `docs/architecture/ADR-001-migration-to-nextjs.md` | 🔄 В процессе |
| Спецификация P02 | `docs/implementation/P02_nextjs_migration.md` | ⬜ Запланировано |

**Инструкции для агента W0:**
1. Прочитать `AGENTS.md` — понять контекст проекта
2. Прочитать все файлы в `.cursor/rules/` — понять технические ограничения
3. Убедиться, что ADR-001 создан и описывает причины миграции
4. Обновить этот файл — отметить статус как "✅ ВЫПОЛНЕНО"

---

### W1 — Продуктовые требования ⬜ ЗАПЛАНИРОВАНО

**Цель:** Формализовать требования к продукту, пользовательские сценарии и роли.

**Порядок создания (строгий):**

#### W1.1 — Обзор продукта
**Путь:** `docs/product/overview.md`

**Инструкция для агента:**
```
Прочитай: SPECIFICATION.md, docs/OVERVIEW.md, docs/GAME_DESCRIPTION.md
Создай docs/product/overview.md со следующими разделами:
1. Что такое «Алфавит» (2-3 абзаца)
2. Целевая аудитория (молодёжные служения, воскресные школы и т.д.)
3. Ключевые возможности (таблица: фича → описание → статус реализации)
4. Технический стек (краткая таблица)
5. Ссылки на связанные документы
```

#### W1.2 — Механики игры
**Путь:** `docs/product/game_mechanics.md`

**Инструкция для агента:**
```
Прочитай: store.ts, types.ts, components/GameSettings.tsx, components/QuestionModal.tsx
Создай docs/product/game_mechanics.md со следующими разделами:
1. Обзор механики Memory (карточки, буквы, пары)
2. Игровой цикл (диаграмма состояний в Mermaid)
3. Команды и счёт
4. Режимы игры (с вопросами / без вопросов)
5. Наборы вопросов (структура, языки)
6. Уровни сложности (easy/medium/hard, очки)
7. AI-генерация вопросов
8. Таймеры (flip timer, answer timer, level select timer)
```

#### W1.3 — Роли пользователей
**Путь:** `docs/product/user_roles.md`

**Инструкция для агента:**
```
Прочитай: AGENTS.md (раздел Роли), types.ts, lib/auth.ts
Создай docs/product/user_roles.md со следующими разделами:
1. Таблица ролей (роль → описание → права → статус MVP/post-MVP)
2. Матрица доступа (роль × операция: да/нет/частично)
3. Маршруты по ролям (URL → роль → редирект)
4. Будущие роли (editor, subscriber — post-MVP требования)
```

#### W1.4 — Пользовательские сценарии
**Путь:** `docs/product/user_flows/`

**Инструкция для агента:**
```
Создай отдельный файл для каждого ключевого сценария:

admin_suite_import.md:
  - Actor: Admin
  - Precondition: залогинен как admin
  - Steps: открыть /admin/suites/import → вставить JSON → валидация → импорт → просмотр
  - Success: набор в БД, отображается в игре
  - Error cases: невалидный JSON, дубликат title, превышен размер

admin_suite_manual_create.md:
  - Actor: Admin
  - Steps: /admin/suites/new → форма → сохранить
  - Linked component: QuestionEditor.tsx (существующий)

game_session.md:
  - Actor: Игрок (без авторизации)
  - Steps: настройка → выбор набора → игра → вопросы → результат
  - States: диаграмма через Mermaid
```

**Checklist W1:**
- [ ] `docs/product/overview.md` создан
- [ ] `docs/product/game_mechanics.md` создан с диаграммой состояний
- [ ] `docs/product/user_roles.md` создан с матрицей доступа
- [ ] 3 файла user_flows созданы
- [ ] Все документы ссылаются друг на друга

---

### W2 — Модель данных ⬜ ЗАПЛАНИРОВАНО

**Цель:** Задокументировать схему БД, типы данных и домен.

#### W2.1 — Схема базы данных
**Путь:** `docs/architecture/database_schema.md`

**Инструкция для агента:**
```
Прочитай: prisma/schema.prisma, types.ts
Создай docs/architecture/database_schema.md со следующими разделами:
1. Обзор (список таблиц, версия PostgreSQL)
2. ER-диаграмма (Mermaid erDiagram)
3. Для каждой таблицы:
   - Название, назначение
   - Таблица полей (имя | тип | nullable | default | описание)
   - Индексы
   - Связи (FK)
   - Бизнес-правила
4. Enums (UserRole, ComplexityLevel, SuiteSourceType)
5. История изменений (таблица: версия | дата | описание)
```

#### W2.2 — Модель домена
**Путь:** `docs/architecture/domain_model.md`

**Инструкция для агента:**
```
Прочитай: types.ts, prisma/schema.prisma
Создай docs/architecture/domain_model.md со следующими разделами:
1. Ключевые сущности (User, QuestionSuite, Question)
2. Диаграмма классов (Mermaid classDiagram)
3. Инварианты домена (что всегда должно быть истинным)
4. Маппинг TypeScript types → Prisma models
5. JSON-формат набора вопросов (эталонный пример)
```

#### W2.3 — Правила миграций
**Путь:** `docs/architecture/migration-best-practices.md`

**Инструкция для агента:**
```
Прочитай: docs/examples/fitapp/.cursor/rules/... (migration rules)
Создай краткое руководство:
1. Когда использовать migrate dev vs migrate deploy
2. Правила именования миграций
3. Обязательные шаги после изменения schema
4. Rollback стратегия
5. Seed данные
```

**Checklist W2:**
- [ ] `docs/architecture/database_schema.md` с ER-диаграммой
- [ ] `docs/architecture/domain_model.md` с диаграммой классов
- [ ] `docs/architecture/migration-best-practices.md`
- [ ] Все поля в schema.prisma имеют комментарии

---

### W3 — Аутентификация и Авторизация ⬜ ЗАПЛАНИРОВАНО

**Цель:** Задокументировать auth-систему, flow и права доступа.

#### W3.1 — Auth Guide
**Путь:** `docs/guidelines/auth/auth_implementation_guide.md`

**Инструкция для агента:**
```
Прочитай: lib/auth.ts, lib/auth.config.ts, middleware.ts, .cursor/rules/auth-security.mdc
Создай руководство:
1. Split config паттерн (схема: auth.config.ts → middleware; auth.ts → server)
2. JWT структура (поля: sub, role, iat, exp)
3. Flow: login → JWT → session → middleware → handler
4. Диаграмма авторизации (Mermaid sequenceDiagram)
5. Добавление новой защищённой страницы (пошагово)
6. Добавление нового Server Action (пошагово)
7. Тестирование auth (как имитировать разные роли в dev)
```

#### W3.2 — Матрица авторизации
**Путь:** `docs/product/authorization_matrix.md`

**Инструкция для агента:**
```
На основании AGENTS.md и docs/product/user_roles.md создай:
1. Таблица: Маршрут × Роль (✅ доступ / ❌ нет / 🔄 редирект)
2. Таблица: API endpoint × Роль
3. Таблица: Операция × Роль (CRUD для Suite, Question, User)
4. Дерево защиты (middleware → layout → handler)
```

**Checklist W3:**
- [ ] `docs/guidelines/auth/auth_implementation_guide.md` создан
- [ ] Sequence диаграмма login flow
- [ ] `docs/product/authorization_matrix.md` создан
- [ ] Задокументированы все защищённые маршруты

---

### W4 — Архитектура и Stack ⬜ ЗАПЛАНИРОВАНО

**Цель:** Зафиксировать архитектурные решения в ADR.

#### W4.1 — ADR-002 Auth Strategy
**Путь:** `docs/architecture/ADR-002-auth-strategy.md`

**Инструкция для агента:**
```
Создай ADR по шаблону:
- Status: Accepted
- Context: нужна аутентификация для admin панели
- Decision: Auth.js v5, Credentials provider, JWT strategy, split config
- Consequences: плюсы и минусы
- Alternatives considered: custom JWT, Basic Auth, session-based
```

#### W4.2 — Архитектурный обзор
**Путь:** `docs/architecture/architecture_overview.md`

**Инструкция для агента:**
```
Прочитай: AGENTS.md, all ADR files, next.config.ts
Создай:
1. C4 Context Diagram (Mermaid)
2. C4 Container Diagram (Next.js app, Neon DB, Auth.js)
3. Слои архитектуры (middleware → RSC → Server Actions → DAL → DB)
4. Таблица технологических решений и причин
5. Что планируется в будущем (Google OAuth, роли, editor UI)
```

**Checklist W4:**
- [ ] ADR-001 создан
- [ ] ADR-002 создан
- [ ] `docs/architecture/architecture_overview.md` с C4 диаграммами

---

### W5 — UI/UX и Маршруты ⬜ ЗАПЛАНИРОВАНО

**Цель:** Задокументировать все страницы, компоненты и дизайн-систему.

#### W5.1 — Каталог маршрутов
**Путь:** `docs/product/canonical_routes.md`

**Инструкция для агента:**
```
Прочитай: app/ directory structure
Создай таблицу всех маршрутов:
| URL | Компонент | Роль | Описание | Статус |
```

#### W5.2 — Каталог компонентов
**Путь:** `docs/guidelines/ui_component_catalog.md`

**Инструкция для агента:**
```
Прочитай: components/ directory (все .tsx файлы)
Для каждого компонента:
| Компонент | Файл | Props | Зависимости | Описание |
```

**Checklist W5:**
- [ ] `docs/product/canonical_routes.md` с таблицей маршрутов
- [ ] `docs/guidelines/ui_component_catalog.md` с каталогом

---

### W6 — Data Layer и API ⬜ ЗАПЛАНИРОВАНО

**Цель:** Задокументировать все Server Actions, Route Handlers и DAL функции.

#### W6.1 — API Reference
**Путь:** `docs/implementation/api_reference.md`

**Инструкция для агента:**
```
Прочитай: app/api/ directory
Для каждого Route Handler:
| Method | URL | Auth | Body | Response | Описание |
```

#### W6.2 — Server Actions Reference
**Путь:** `docs/implementation/server_actions_reference.md`

**Инструкция для агента:**
```
Прочитай: src/actions/ directory
Для каждого Server Action:
| Функция | Auth | Input (Zod schema) | Output | Revalidates |
```

**Checklist W6:**
- [ ] API Reference создан
- [ ] Server Actions Reference создан

---

### W7 — Admin Panel ⬜ ЗАПЛАНИРОВАНО

**Цель:** Полная спецификация Admin панели.

#### W7.1 — Admin Panel Spec
**Путь:** `docs/implementation/admin_panel_spec.md`

**Инструкция для агента:**
```
Создай полную спецификацию:
1. Страницы Admin панели (список, описание)
2. JSON Import: полный flow, UX, error handling
3. Manual Suite Creation: форма, поля, валидация
4. Suite Management: список, фильтры, удаление
5. Wireframes в ASCII или описание UI
```

**Checklist W7:**
- [ ] Admin Panel Spec создан
- [ ] JSON Import flow задокументирован
- [ ] Все admin страницы описаны

---

### W8 — Deployment & Operations ⬜ ЗАПЛАНИРОВАНО

**Цель:** Задокументировать деплой, переменные окружения, мониторинг.

#### W8.1 — Deployment Guide
**Путь:** `docs/implementation/deployment_guide.md`

**Инструкция для агента:**
```
Создай:
1. Vercel deployment (шаги)
2. Environment Variables (таблица: имя | описание | где получить | пример)
3. Neon PostgreSQL setup (создание БД, миграции, seed)
4. Auth.js secret generation
5. Production checklist
```

**Checklist W8:**
- [ ] Deployment Guide создан
- [ ] Все env vars задокументированы
- [ ] Production checklist

---

## Шаблоны документов

### Шаблон ADR

```markdown
# ADR-NNN — Название решения

**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNN  
**Date:** YYYY-MM-DD  
**Authors:** AI Agent / Developer

## Context

Описание проблемы или ситуации, требующей решения.

## Decision

Принятое решение.

## Consequences

### Плюсы
- ...

### Минусы
- ...

## Alternatives Considered

| Альтернатива | Причина отклонения |
|-------------|-------------------|
| ... | ... |
```

### Шаблон Implementation Contract

```markdown
# P{N} — Название фазы

**Phase:** P{N}  
**Status:** Planned | In Progress | Complete  
**Dependencies:** P{N-1}

## Goal

Цель фазы.

## Deliverables

- [ ] Файл 1
- [ ] Файл 2

## Acceptance Criteria

1. ...
2. ...

## Technical Notes

Технические детали реализации.
```

---

## Приоритет волн

```
W0 (✅ DONE) → W1 → W2 → W3 → W4 → W5 → W6 → W7 → W8
```

**Обязательный порядок:**
- W0 завершить до W1
- W1 (user flows) завершить до W5 (UI spec)
- W2 (data model) завершить до W6 (API reference)
- W3 (auth) завершить до W6 и W7
- W4 может идти параллельно с W1-W3

**Принцип:** следующая волна начинается только после завершения checklist текущей.

---

## Инструкции для AI-агента при создании документации

### Перед созданием документа

1. Прочитай `AGENTS.md` и этот файл
2. Определи волну (W0-W8) для создаваемого документа
3. Убедись, что предыдущие волны завершены
4. Прочитай все файлы, перечисленные в разделе "Инструкция для агента"

### При создании документа

1. Следуй точной структуре из инструкции
2. Используй Mermaid для диаграмм
3. Таблицы — для сравнений, матриц, каталогов
4. Включай примеры кода для технических разделов
5. Добавляй ссылки на связанные документы
6. Заканчивай checklists

### После создания документа

1. Обнови статус в этом файле (✅ / 🔄 / ⬜)
2. Добавь ссылку на новый документ в `AGENTS.md` (раздел "Документация")
3. Если документ изменяет архитектуру — создай или обнови ADR

### Стандарты качества

- **Язык:** Русский (технические термины — английские)
- **Диаграммы:** Mermaid (встроенные в Markdown)
- **Примеры кода:** TypeScript, именно для этого проекта
- **Таблицы:** для любых сравнений 3+ элементов
- **Актуальность:** документ актуален на момент создания, обновляется при изменениях
