# Компоненты и UX — «Алфавит» (R03)

Игровой экран собран из **`shared/game-kit`** (props-driven) и **адаптеров** в `games/alphabet/components/*Container.tsx`, которые читают `useGameStore()` и передают props.

## Каркас

| Компонент kit | Адаптер / использование |
|---------------|-------------------------|
| `GameShell` | `GameApp.tsx` — фазы `lobby` / `playing` / `paused` / `finished` через `getGamePhase()` |
| `ScoreBoard` | `ScoreBoardContainer.tsx` |
| `Timer` | внутри kit-модалок и табло |
| `QuestionModal` | `QuestionModalContainer.tsx` |
| `LevelSelect` | `LevelSelectContainer.tsx` |
| `VictoryScreen` + `Confetti` | `VictoryScreenContainer.tsx` |
| `RulesDialog` | правила из `RulesPage` / контент store |
| `SettingsPanel`, `TeamsSetup` | `SettingsContainer.tsx` (лобби) |

Собственных реализаций табло, таймера, модалки вопроса и экрана победы в `games/alphabet` **нет** (контракт [`game_kit_contract.md`](../../implementation/contracts/game_kit_contract.md) §5).

## Игровое поле

- `Card.tsx`, сетка в `GameApp.tsx` — токены «Утренний свет» (`surface`, `accent` / `accent-fg`, `shadow-card`).
- `HomeButton` / отдельная шапка удалены; выход и правила — через `GameShell`.

## Редакторские экраны (baseline)

Библиотека, редактор, AI-генератор, оператор-гид — legacy-вёрстка в baseline `tokens:check`; перенос на токены — [R04](../../implementation/phases/R04_phase_description.md).

## z-index

Kit и `GameShell` задают порядок слоёв (шапка, модалки, победа). Локальные `z-[…]` в редакторах сохранены до R04.
