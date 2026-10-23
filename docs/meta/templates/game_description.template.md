# {Название игры} — описание для каталога

**Тип:** Game description  
**Статус:** Draft | Canonical  
**Версия:** 1.0  
**Дата:** YYYY-MM-DD  
**Зависит от:** [`game_manifest_contract.md`](../../implementation/contracts/game_manifest_contract.md), [`i18n_contract.md`](../../implementation/contracts/i18n_contract.md)  
**Связанные документы:** `games/{slug}/manifest.ts`, `games/{slug}/i18n/`

---

## Кратко

Одно предложение для карточки каталога (RU/EN — в manifest).

## Правила и цель

Как выигрывает команда, длительность партии, возраст.

## Механика

Пошагово: подготовка → ход → завершение (Memory, викторина и т.д.).

## Игроки и команды

| Параметр | Значение |
|----------|----------|
| Игроков / команд | min–max |
| Роли ведущего | есть / нет |

## Материалы

Браузер, проектор, печать — что нужно физически.

## Manifest и i18n

- Slug: `{slug}` — см. [`game_manifest_contract.md`](../../implementation/contracts/game_manifest_contract.md) §2
- Локали: `ru`, `en` — ключи в `games/{slug}/i18n/`
- Теги каталога: `memory`, `quiz`, …

## Acceptance criteria

- [ ] Текст согласован с `manifest.title` / `description`
- [ ] Ссылки на manifest и i18n открываются

## Критерии соответствия

- [ ] Шапка метаданных (Тип, Статус, Версия, Дата, Зависит от)
- [ ] Правила, механика, игроки/команды, материалы, ссылки на manifest и i18n
