# Управление состоянием — «Алфавит» (R03)

Хранилище: [`games/alphabet/store.ts`](../../../games/alphabet/store.ts) (**Zustand**). Локаль UI **не** в store — источник [`useLocale()`](../../../shared/i18n/I18nProvider.tsx) с портала.

## Разделение ответственности

| Concern | Где |
|---------|-----|
| Язык интерфейса | cookie + `I18nProvider` / `GameI18nProvider` |
| Игровая партия | `useGameStore()` — поле, очки, модалки, пауза |
| Kit UI | props из адаптеров `*Container.tsx` |

## Ключевые действия store

- **`resetGame`** — сброс партии к лобби (настройки и библиотека сохраняются).
- **`finishGame`** — `isGameOver: true`, сброс флагов инструментов для `VictoryScreen`.
- **`initializeGame(settings, locale)`** — старт с учётом локали для набора вопросов.
- **`temp`** — транзитные флаги (`showQuestionModal`, `currentQuestion`, `isProcessing`, …).

## Persistence

Пользовательские наборы в LocalStorage с TTL 72 ч (`cleanupLibrary` при старте). Это данные контента, не локаль интерфейса.

## Связь с kit

Адаптеры подписываются на store и вызывают actions; kit-компоненты остаются чистыми и переиспользуемыми для новых игр ([`game_kit_contract.md`](../../implementation/contracts/game_kit_contract.md)).
