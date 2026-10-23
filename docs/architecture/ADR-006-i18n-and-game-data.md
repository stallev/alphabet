# ADR-006 — i18n (RU/EN) и данные игр

**Тип:** ADR  
**Статус:** Accepted  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`repo_restructure_plan.md`](../meta/repo_restructure_plan.md) §0 D6–D7; ADR-003  
**Затрагивает:** [`i18n_contract.md`](../implementation/contracts/i18n_contract.md), [`i18n-approach.md`](./i18n-approach.md) (обновление в R03)

---

## Context

Нужны красивые URL без префикса локали и поддержка RU/EN для портала и игр. В legacy-коде Alphabet локаль в Zustand/localStorage; целевой подход — cookie `locale` и серверные словари (R03). Локали `uk`, `de`, `ro` остаются в данных, но выключены в UI.

---

## Decision

1. **Активные локали:** `ru` (default), `en`.
2. **URL** без `[locale]` — игра на `/alphabet`, язык не в пути.
3. **Cookie `locale`** (`ru` | `en`), читается на сервере; переключение через Server Action `setLocale`.
4. **Словари:** `shared/i18n/` (портал + game-kit), `games/<slug>/i18n/` (игра).
5. **Данные игры** — `games/<slug>/data/`; БД-таблицы вопросов Alphabet — только DAL Alphabet (`QuestionSuite`, `Question`).
6. **SEO:** оба языка на одном URL; при `SITE.indexable === false` допустимо (см. [`i18n_contract.md`](../implementation/contracts/i18n_contract.md) §1).

---

## Rejected alternatives

| Альтернатива | Почему отклонена |
|--------------|------------------|
| Сегмент `app/[locale]/…` | Ломает красивые URL игр (D6) |
| Общий банк вопросов для всех игр | См. ADR-003 / D7 |
| Включить `uk/de/ro` в MVP | Вне scope; данные сохраняются, UI скрыт |

---

## Consequences

### Positive

- Один URL для шаринга; простой деплой.
- Изоляция переводов по играм.

### Negative

- Нет hreflang на разных URL; при индексации — отдельный ADR.
- Миграция с localStorage → cookie в R03.

### Security

Локаль валидируется по `ACTIVE_LOCALES`; произвольные значения cookie отбрасываются.

---

## Критерии соответствия

- [ ] §1–§3 `i18n_contract.md` после R03
- [ ] Нет пользовательских строк вне словарей в новом коде
