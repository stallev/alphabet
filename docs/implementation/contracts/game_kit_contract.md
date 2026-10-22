# Контракт игрового каркаса (`shared/game-kit`)

**Тип:** Contract  
**Статус:** Draft  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** [`repo_structure_contract.md`](repo_structure_contract.md), [`design_tokens_contract.md`](design_tokens_contract.md), [`i18n_contract.md`](i18n_contract.md); решение D3  
**Используется в:** R03-CU3…CU5, [`game_shell_spec.md`](../specs/game_shell_spec.md)

---

## §1 Назначение и принцип

`shared/game-kit` — набор компонентов, из которых собирается интерфейс **любой** игры каталога. Игры выглядят одинаково, потому что используют одни и те же компоненты и токены, а не потому, что следуют соглашению.

**Принцип props-driven.** Компоненты kit **не знают** о Zustand-сторах игр и о БД: всё, что им нужно, приходит через props, а действия — через callbacks. Игра сама подключает свой стор (в Alphabet текущие компоненты завязаны на `useGameStore()` — при переносе в kit эта связка остаётся в игре, в `games/alphabet/components/*Adapter`/контейнерах).

**В kit нет слов, специфичных для игры** (буквы, карточки, Memory). Тексты игры приходят готовыми строками из словаря игры; собственные тексты kit — в `shared/i18n` (пространство `gameKit.*`).

## §2 Состав и API

Все компоненты — клиентские (`'use client'`), именованный экспорт, один компонент на файл, используют только токены.

| Компонент | Файл | Props (основные) | Поведение |
|-----------|------|------------------|-----------|
| `GameShell` | `GameShell.tsx` | `manifest: GameManifest`, `phase: GamePhase`, `onRestart?: () => void`, `rules?: RulesContent`, `headerActions?: ReactNode`, `children` | Рамка игры, см. [`game_shell_spec.md`](../specs/game_shell_spec.md) |
| `ScoreBoard` | `ScoreBoard.tsx` | `teams: ScoreTeam[]`, `activeTeamId?: string`, `onTogglePause?`, `paused?`, `onToggleMute?`, `muted?` | Список команд с очками; активная команда выделена; `aria-live="polite"` для изменений |
| `Timer` | `Timer.tsx` | `seconds: number`, `running: boolean`, `onElapsed: () => void`, `variant?: 'inline' \| 'ring'`, `label?: string` | Обратный отсчёт; не вызывает `onElapsed` на паузе; `role="timer"` |
| `QuestionModal` | `QuestionModal.tsx` | `open`, `question: QuizQuestion`, `levelLabel`, `timerSeconds?`, `onAnswer: (result: AnswerResult) => void`, `onClose?` | Диалог вопроса: текст, варианты или поле ответа, таймер; результат — `AnswerResult` |
| `LevelSelect` | `LevelSelect.tsx` | `open`, `levels: LevelOption[]`, `timerSeconds?`, `onSelect: (id: string) => void`, `onTimeout?` | Выбор сложности (кнопки с очками) |
| `VictoryScreen` | `VictoryScreen.tsx` | `ranking: ScoreTeam[]`, `onPlayAgain`, `onExit` | Победитель(и), конфетти (`Confetti`), кнопки |
| `Confetti` | `Confetti.tsx` | — | Отключается при `prefers-reduced-motion` |
| `RulesDialog` | `RulesDialog.tsx` | `open`, `onClose`, `title`, `content: RulesContent` | Диалог правил |
| `SettingsPanel` | `SettingsPanel.tsx` | `title`, `children`, `onStart`, `startLabel`, `startDisabled?` | Макет экрана настроек (лобби): карточка, отступы, кнопка «Начать» |
| `TeamsSetup` | `TeamsSetup.tsx` | `value: { count: number; names: string[] }`, `min`, `max`, `onChange` | Количество и названия команд |
| `StepperInput` | `StepperInput.tsx` | `label`, `value`, `min`, `max`, `step`, `onChange` | Числовой ввод со стрелками |

### §2.1 Типы (`shared/game-kit/types.ts`)

```ts
export type GamePhase = 'lobby' | 'playing' | 'paused' | 'finished';

export interface ScoreTeam { id: string; name: string; score: number; colorIndex: number } // colorIndex 0..5 → токены team-1..team-6

export type QuizLevelId = 'easy' | 'medium' | 'hard';
export interface LevelOption { id: string; label: string; points: number; disabled?: boolean }

export type QuizAnswer =
  | { kind: 'choice'; options: { id: number; label: string }[]; correctId: number }
  | { kind: 'text'; correctText: string };
export interface QuizQuestion { id: string | number; text: string; answer: QuizAnswer }

export interface AnswerResult { correct: boolean; timedOut: boolean }

export interface RulesSection { heading: string; body: ReactNode }
export type RulesContent = RulesSection[];
```

Отображение доменных типов Alphabet (`Question`, `ComplexityLevel`) в эти типы — в `games/alphabet/components/` (маппер с тестом в `logic/`).

## §3 Обязанности игры

Игра **обязана**:

1. Рендерить весь интерфейс внутри `GameShell`.
2. Использовать `ScoreBoard`, `QuestionModal`, `VictoryScreen`, `RulesDialog`, `SettingsPanel`, если соответствующая функция есть в игре.
3. Не использовать «сырые» цвета, размеры шрифтов вне шкалы и собственные модальные окна — только `shared/ui/Dialog` и компоненты kit.
4. Передавать в kit строки из своего словаря на текущей локали.

Если игре нужен компонент, которого нет в kit, его сначала предлагают в kit (если пригодится ≥ 2 играм) или создают в `games/<slug>/components/` на токенах и примитивах `shared/ui`.

## §4 Требования к качеству

| Область | Требование |
|---------|-----------|
| Доступность | Диалоги — focus trap, `Esc`, возврат фокуса, `aria-labelledby`; цель касания ≥ 44×44 px; контраст текста ≥ 4.5:1; состояние не передаётся только цветом |
| Мобильная вёрстка | Mobile-first; работоспособность на 360/768/1280 px; без горизонтальной прокрутки |
| Анимации | Framer Motion; при `prefers-reduced-motion` — без движения (кроме фейдов ≤ 150 мс) |
| Тесты | Логика (маппер вопросов, подсчёт `ranking`, таймер-хук) — Vitest; компоненты — по профилю `lean` не обязательны |
| Стили | Только токены ([`design_tokens_contract.md`](design_tokens_contract.md)); проверяется `npm run tokens:check` |

## §5 Критерии соответствия

- [ ] Каждый компонент из §2 существует и не импортирует `games/**`, `server/**`, Zustand-сторы игр
- [ ] Alphabet не содержит собственных реализаций компонентов из §2
- [ ] `rg "useGameStore" shared/` пуст
- [ ] `npm run tokens:check` зелёный
