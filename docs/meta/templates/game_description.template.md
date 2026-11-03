# {Название игры} — описание для каталога

**Тип:** Game description  
**Статус:** Draft | Canonical  
**Версия:** 1.0  
**Дата:** YYYY-MM-DD  
**Зависит от:** [`game_manifest_contract.md`](../../implementation/contracts/game_manifest_contract.md), [`i18n_contract.md`](../../implementation/contracts/i18n_contract.md)  
**Связанные документы:** [`games/{slug}/manifest.ts`](../../games/{slug}/manifest.ts), [`games/{slug}/i18n/`](../../games/{slug}/i18n/)

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

## Режимы

| Режим | Описание |
|-------|----------|
| … | … |

## Manifest и i18n

- Slug: `{slug}` — [`game_manifest_contract.md`](../../implementation/contracts/game_manifest_contract.md) §2, [`games/{slug}/manifest.ts`](../../games/{slug}/manifest.ts)
- Локали UI: `ru`, `en` — ключи в [`games/{slug}/i18n/`](../../games/{slug}/i18n/)
- Теги каталога: `memory`, `quiz`, …

## Связанная документация

- UI и kit: при необходимости `docs/games/{slug}/ui_components.md`
- Состояние: при необходимости `docs/games/{slug}/state_management.md`

## Критерии соответствия

- [ ] Текст согласован с `manifest.title` / `description`
- [ ] Ссылки на manifest, i18n и data открываются
