# Подход к интернационализации (i18n) — проект «Алфавит»

> **Обновляется в R03** под cookie `locale` и RU/EN. Принятое решение — [ADR-006](./ADR-006-i18n-and-game-data.md); контракт — [`i18n_contract.md`](../implementation/contracts/i18n_contract.md).

**Дата:** 2026-10-23  
**Статус:** Legacy (до R03)

---

## Обзор

В игре «Алфавит» интернационализация — **клиентский слой без URL-локализации**. Нет next-intl, i18next, react-intl или сегментов `[locale]` в маршрутах. Язык — игровая настройка в `localStorage`, управляется через Zustand в `games/alphabet/store.ts`.

---

## Архитектура

### Источники данных по локали

| Файл | Что хранит |
|------|-----------|
| `shared/domain/locale.ts` → `Locale` | Тип всех поддерживаемых локалей |
| `games/alphabet/i18n/translations.ts` → `TRANSLATIONS` | Строки UI для каждой локали |
| `shared/i18n/locales.ts` → `LOCALE_META` | Метаданные: label, flag, shortLabel, `active` |
| `games/alphabet/constants.ts` → `ALPHABET_BY_LOCALE` | Буквы алфавита для Memory-карточек |
| `games/alphabet/store.ts` → `VALID_LOCALES` | Список **активных** локалей |
| `games/alphabet/components/LocaleSelector.tsx` → `LOCALES` | Локали в UI-переключателе |
| `games/alphabet/data/*.json` | Seed-файлы наборов вопросов (по локали в имени) |

### Поток данных

```
LocaleSelector (UI)
  └─► setLocale() в games/alphabet/store.ts
        ├─► localStorage.setItem('alphabet_locale', locale)
        ├─► Обновляет state.locale
        └─► Выбирает systemSuite с language === locale

Компоненты
  └─► const { locale } = useGameStore()
  └─► const t = TRANSLATIONS[locale]
  └─► ALPHABET_BY_LOCALE[locale]
```

### Инициализация локали (`getInitialLocale`)

При первой загрузке `games/alphabet/store.ts` определяет начальную локаль:

1. Значение из `localStorage` — если входит в `VALID_LOCALES`
2. Язык браузера (`navigator.language`) — маппинг на поддерживаемую локаль
3. Дефолт: `'ru'` (SSR без `window`), `'en'` (неизвестный язык браузера)

---

## Поддерживаемые локали

### Определение типа

```typescript
// shared/domain/locale.ts
export type Locale = 'ru' | 'en' | 'uk' | 'de' | 'ro';
```

### Активные локали

| Место | Переменная | Назначение |
|-------|-----------|-----------|
| `games/alphabet/store.ts` | `VALID_LOCALES` | Валидация `localStorage`; автодетект |
| `games/alphabet/components/LocaleSelector.tsx` | `LOCALES` | Пункты переключателя |

> **Оба списка должны быть синхронизированы.**

### Текущее состояние

| Локаль | Статус | Причина |
|--------|--------|---------|
| `ru` | **Активна** | Наборы в БД |
| `en` | **Активна** | Наборы в БД |
| `uk`, `de`, `ro` | Отключены | Нет наборов в БД |

Переводы, `LOCALE_META` и алфавиты для всех пяти локалей сохранены.

---

## Связь с базой данных

Наборы в `QuestionSuite` имеют `language: Char(2)`. При `setLocale()` стор переключает активный набор. Загрузка — `/api/suites` (Prisma). См. [`database_schema.md`](./database_schema.md).

---

## Использование в компонентах

```typescript
const { locale } = useGameStore();
const t = TRANSLATIONS[locale];
const letters = ALPHABET_BY_LOCALE[locale];
```

---

## Как включить/отключить локаль

1. Загрузить наборы с нужным `language` (Admin → JSON Import)
2. Добавить локаль в `VALID_LOCALES` (`games/alphabet/store.ts`) и `LOCALES` (`LocaleSelector.tsx`)
3. При отключении — убрать из списков; переводы **не удалять**

---

## Ограничения и будущее

| Ограничение | Описание |
|-------------|----------|
| Только клиент | Admin не зависит от локали игры |
| Нет URL-локализации | Нельзя поделиться ссылкой с языком |
| Переводы в TS | Новая локаль — правка `games/alphabet/i18n/` |

Переход на next-intl / cookie `locale` — R03 (ADR-006).
