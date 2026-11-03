# Подход к интернационализации (i18n) — Circle

**Статус:** Canonical (R03)  
**Дата:** 2026-11-03  
**Контракт:** [`i18n_contract.md`](../implementation/contracts/i18n_contract.md) · **ADR:** [ADR-006](./ADR-006-i18n-and-game-data.md)

---

## Обзор

Портал и игры используют **cookie `locale`** (`ru` | `en`) без префикса языка в URL. Нет next-intl, i18next и сегментов `[locale]`. Переключатель — `LocaleSwitcher` в шапке портала; Server Action `setLocale` валидирует значение и вызывает `revalidatePath('/', 'layout')`.

Локаль **не** хранится в Zustand/localStorage игры (Alphabet мигрирован в R03).

---

## Архитектура

### Источники

| Слой | Путь | Назначение |
|------|------|------------|
| Домен | `shared/domain/locale.ts` | Тип `Locale`, `ACTIVE_LOCALES` |
| Портал + kit | `shared/i18n/dictionaries/{ru,en}.ts` | UI каталога, ошибки, game-kit |
| Игра | `games/<slug>/i18n/{ru,en}.ts` | Строки конкретной игры |
| Сервер | `shared/i18n/server.ts` | `getLocale()`, `getDictionary()` |
| Клиент | `shared/i18n/I18nProvider.tsx` | `useLocale()`, `useT()` |
| Игра (клиент) | `shared/i18n/GameI18nProvider.tsx` | `useGameT()` внутри страницы игры |

### Поток

```
app/layout.tsx
  └─ getLocale() + getDictionary()
  └─ <html lang={locale}>
  └─ <I18nProvider locale dictionary>

app/[game]/page.tsx
  └─ locale prop → GameI18nProvider(dictionary игры) → GameShell / UI

LocaleSwitcher
  └─ setLocale('ru' | 'en') → cookie → revalidate layout
```

### Инициализация локали

1. Cookie `locale`, если значение ∈ `ACTIVE_LOCALES` (`de` и прочие игнорируются).
2. Заголовок `Accept-Language` → маппинг на `ru` или `en`.
3. Default: `ru`.

---

## Игра «Алфавит»

- `games/alphabet/page.tsx` получает `locale` с сервера и оборачивает UI в `GameI18nProvider`.
- Компоненты используют `useGameT()` / `useLocale()`; **не** `useGameStore().locale`.
- Набор вопросов выбирается по `locale` при `initializeGame` / смене языка (`selectSuiteForLocale`).
- Seed JSON и БД: см. [`docs/games/alphabet.md`](../games/alphabet.md).

---

## Локали в данных

| Локаль | UI (R03) | Данные |
|--------|----------|--------|
| `ru`, `en` | Активны | Наборы в БД / seed |
| `uk`, `de`, `ro` | Скрыты | Метаданные и переводы сохранены |

---

## Проверки

- `npm run typecheck` — одинаковые ключи в `ru.ts` / `en.ts` игры.
- Контракт §5 — кириллица только в словарях и игровых данных (унаследованные admin/редакторы — R04).
- UI-check: `/` и `/alphabet` на 360 / 768 / 1280, RU и EN.
