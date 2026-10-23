# Алфавит — описание для каталога

**Тип:** Game description  
**Статус:** Canonical  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`game_manifest_contract.md`](../implementation/contracts/game_manifest_contract.md), [`i18n_contract.md`](../implementation/contracts/i18n_contract.md)  
**Связанные документы:** [`games/alphabet/manifest.ts`](../../games/alphabet/manifest.ts), [`games/alphabet/i18n/`](../../games/alphabet/i18n/), [`games/alphabet/data/`](../../games/alphabet/data/)

---

## Кратко

Интерактивная браузерная игра для командных соревнований: Memory с буквами алфавита и библейская викторина; оптимизирована для проекторов и больших экранов.

## Правила и цель

Команды по очереди открывают карточки с буквами и ищут пары. Совпадение даёт баллы; при включённой викторине — бонусный вопрос выбранной сложности. Побеждает команда с наибольшим счётом к концу партии. Подходит для лагерей, воскресных школ (режим без вопросов) и семейных вечеров.

## Механика

1. **Подготовка** — выбор локали, числа команд (2–5), набора вопросов, таймеров и режима (с викториной / только Memory).
2. **Ход** — открытие двух карт; при паре — очки и (опционально) выбор сложности вопроса и ответ.
3. **Завершение** — экран победы, сброс или новая партия; прогресс сохраняется в LocalStorage (TTL наборов 72 ч).

Дополнительно: библиотека и редактор наборов, JSON import/export, AI-генератор вопросов (см. [`ai_system.md`](alphabet/ai_system.md)).

## Игроки и команды

| Параметр | Значение |
|----------|----------|
| Игроков / команд | 2–5 (манифест: 2–6) |
| Роли ведущего | нет (ведущий — оператор с клавиатуры) |

## Материалы

Современный браузер, большой экран или проектор; звук по желанию. Установка не требуется.

## Режимы

| Режим | Описание |
|-------|----------|
| Memory + викторина | Пары букв + вопросы easy / medium / hard |
| Только Memory | Без вопросов (воскресная школа) |
| Библиотека / AI | Подготовка контента вне активной партии |

## Manifest и i18n

- Slug: `alphabet` — [`game_manifest_contract.md`](../implementation/contracts/game_manifest_contract.md) §2, [`manifest.ts`](../../games/alphabet/manifest.ts)
- Локали UI: `ru`, `en` активны; переводы и метаданные для `uk`, `de`, `ro` сохранены — [`games/alphabet/i18n/`](../../games/alphabet/i18n/), [`shared/i18n/locales.ts`](../../shared/i18n/locales.ts)
- Теги каталога: `memory`, `quiz`, `team`, `youth`
- Данные наборов: [`games/alphabet/data/`](../../games/alphabet/data/), БД — [`database_schema.md`](../architecture/database_schema.md)

## Связанная документация

- UI и z-index: [`ui_components.md`](alphabet/ui_components.md)
- Zustand и persistence: [`state_management.md`](alphabet/state_management.md)
- AI-генератор: [`ai_system.md`](alphabet/ai_system.md)

## Критерии соответствия

- [ ] Текст согласован с `manifest.title` / `description`
- [ ] Ссылки на manifest, i18n и data открываются
