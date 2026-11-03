# R03 Tasks — Общий UI-кит, портал и каркас новых игр

**Тип:** Tasks  
**Статус:** Draft (до Phase DoR audit; написан заранее, см. D14); редизайн «Утренний свет» внесён 2026-11-03  
**Версия:** 1.1  
**Дата:** 2026-11-03  
**Фаза:** R03  
**Зависит от:** [`R03_phase_description.md`](R03_phase_description.md); [`DESIGN.md`](../../design/DESIGN.md); контракты [`game_kit`](../contracts/game_kit_contract.md) · [`i18n`](../contracts/i18n_contract.md) · [`design_tokens`](../contracts/design_tokens_contract.md) · [`game_manifest`](../contracts/game_manifest_contract.md) · [`game_routing`](../contracts/game_routing_contract.md); спецификации [`portal_home`](../specs/portal_home_spec.md) · [`game_shell`](../specs/game_shell_spec.md) · [`adding_a_game`](../specs/adding_a_game_spec.md)  
**Связанные документы:** [`ai_ui_verification.md`](../../guidelines/testing/ai_ui_verification.md), [`ai_agent_model_routing.md`](../../meta/ai_agent_model_routing.md)

---

## Purpose

Дать всем играм общий каркас и токены, перевести на них Alphabet, сделать полноценный каталог и инструкцию «Добавить игру»; DoD — в [`R03_phase_description.md`](R03_phase_description.md#phase-dod). Прогон: `node scripts/run-phase.mjs R03 --environment cursor`.

Общие правила: сборка (`typecheck`, `lint`, `test`, `build`, `tokens:check`) зелёная на границе каждого CU; компоненты kit — props-driven, без `useGameStore`; тексты — только из словарей; стили — только токены ([`design_tokens_contract.md`](../contracts/design_tokens_contract.md)); один компонент на файл.

## Phase DoR audit

Один вызов `architect` (`spec-gap`): сверить контракты/спецификации с кодом `games/alphabet` после R02 — имена компонентов, поля store (`temp`, `settings`, `teamScores`, `currentTeamIndex`, `isPaused`, `isMuted`, …), ключи `TRANSLATIONS`; уточнить props компонентов kit там, где фактическое поведение Alphabet шире; обновить этот файл.

- [x] Все задачи прошли DoR — 2026-11-03 · оркестратор inline (профиль `lean`) · изменены: `game_kit_contract` v1.1, `i18n_contract` v1.1, `R03_tasks` (T11, T14, T15, T17, T21, T26)
- [x] Направление и палитра «Утренний свет» утверждены владельцем 2026-11-03 (финал `success`, `danger`, `team-1…6` — по галерее в R03-T1)
- [x] Контракты/спецификации сверены с фактическим кодом (2026-11-03)

### Результаты аудита (2026-11-03)

Сверка с `games/alphabet` после R02. Расхождения, устранённые правками документов:

| # | Находка | Решение |
|---|---------|---------|
| 1 | Текущий `Timer` имеет варианты `bar`/`clock`, `orientation`, `color`-класс; в kit были только `inline`/`ring` | `Timer` kit: `inline`/`ring`/`bar`, `orientation`, `tone`; соответствие в контракте §2 |
| 2 | `ScoreBoard` содержит «Завершить игру» с `window.confirm` и локальной таблицей строк на 5 языков, режим игры в подписи | `onFinish`, `finishLabel`, `finishConfirm`, `modeLabel`; подтверждение в `Dialog` |
| 3 | `QuestionModal`: задержка результата 2500 мс (2000 при таймауте), `Confetti` при верном ответе; сравнение — `trim` только у ввода | `resultDelayMs`, `timeoutDelayMs`, конфетти внутри kit; `checkTextAnswer` обрезает обе стороны (надмножество поведения) |
| 4 | `LevelSelectModal` вызывает `window.alert` при отсутствии вопросов и авто-выбирает уровень по таймеру | `emptyNotice`/`onClose` в `LevelSelect`; авто-выбор — в адаптере по `onTimeout` |
| 5 | `store.ts` использует `locale` в `initializeGame` (алфавит), выборе набора вопросов и `resetGame` | T14: `initializeGame(settings, locale)`, `selectSuiteForLocale(locale)`; `locale` из `useLocale()` |
| 6 | `RulesPage` — полноэкранная страница по хэшу `#rules` с анимацией и константами очков | T15/T17: `#rules` открывает `RulesDialog`; страница → `RulesContent` |
| 7 | `GameApp`: фазы выводятся из `isLoading`, `isSettingsStage`, `isGameOver`, `isPaused` (и подстраницы `show*`) | Маппинг зафиксирован в T15 |
| 8 | Кракозябры в `Timer.tsx`, `QuestionModal.tsx` (строки, комментарии) | Файлы удаляются в T17; новые строки — из словарей |
| 9 | Кириллица в строках вне словарей: `app/admin/**`, `app/api/**`, редакторы, AI-генератор, `PromptPage`, `audio.ts` и др.; `app/page.tsx`, `app/[game]/{error,loading}.tsx` | Проверка охватывает портал, kit и игровой экран; унаследованные пути — в R04 (список в `i18n_contract §5`); `error.tsx`/`loading.tsx` — T21 |
| 10 | `Locale` в `shared/domain/locale.ts` (5 значений) и `ACTIVE_LOCALES` уже есть; `LOCALE_META` в `shared/i18n/locales.ts` содержит эмодзи-флаги | Использовать `ACTIVE_LOCALES`; `LocaleSwitcher` без флагов-эмодзи (запрет `DESIGN.md`), `LOCALE_META.flag` в UI не используется |
| 11 | `shared/config/site.ts` уже существует (`EdenGames`) | T19 изменяет, а не создаёт |

## Commit plan

### R03-CU1 — feat(ui): add design tokens, shared ui primitives and kit gallery · Review: diff-only · Smoke: none · Commit: auto

- [x] R03-T1 · T2 · Spec: [tokens §1–§3.1](../contracts/design_tokens_contract.md)
      Files: `shared/styles/tokens.css`, `app/globals.css`, `app/layout.tsx`, `scripts/check-design-tokens.mjs`, `scripts/check-design-tokens.test.mjs`, `scripts/tokens-baseline.json`, `package.json`
      Acceptance: токены §2 («Утренний свет») определены в `@theme`, стандартные `--radius-*`/`--shadow-*`/`--blur-*` обнулены; шрифт Manrope (`latin`, `cyrillic`, 500–800) через `next/font` вместо Inter, база 18 px; `prefers-reduced-motion` в `tokens.css`; `globals.css` подключает `tokens.css`; скрипт `tokens:check` реализует паттерны §3 и baseline §3.1 (область: `games/**`, `shared/**`, исключая `tokens.css`, `data/`, `i18n/`, `*.test.*`); паттерны §3 включают запреты `DESIGN.md` (`uppercase`, `font-black`, градиенты, `blur-*`, `rounded-*`/`shadow-*` вне токенов, эмодзи); `scripts/tokens-baseline.json` сгенерирован по текущему `games/alphabet` (число нарушений на файл; суммарное значение «до» записано в отчёт); тест скрипта на фикстурах (палитровая утилита, hex, произвольное значение, `tokens:allow`, рост выше baseline) → `npm run tokens:check` = 0; тест зелёный; контраст пар `*-fg` проверен и записан таблицей в отчёт (`accent-fg`/`accent` ≥ 7:1); значения `success`, `danger`, `team-1…6` предложены и одобрены владельцем по галерее (T3)
      Paths: H [tokens §3] · N [tokens §3.1: файл вне baseline с нарушением → падение; рост числа → падение]
- [x] R03-T2 · T2 · Spec: [tokens §1](../contracts/design_tokens_contract.md) · Spec: [kit §4](../contracts/game_kit_contract.md)
      Files: `shared/ui/Button.tsx`, `shared/ui/IconButton.tsx`, `shared/ui/Card.tsx`, `shared/ui/Badge.tsx`, `shared/ui/Input.tsx`, `shared/ui/Dialog.tsx`
      Acceptance: примитивы на токенах «Утреннего света» (радиусы `ctl`/`card`, `shadow-card`/`shadow-press`, непрозрачные поверхности); `Button` (primary на `accent`, secondary на `primary`, ghost, danger; sizes `md` 48 px / `lg` 64 px; loading; нажатие `:active` без `hover:scale`), `IconButton` (обязателен `aria-label`), `Card`, `Badge`, `Input` (label, error, `aria-describedby`), `Dialog` на нативном `<dialog>` (`showModal`, `Esc`, закрытие по подложке опционально, возврат фокуса, `aria-labelledby`, анимация Framer Motion с учётом `prefers-reduced-motion`); никаких новых зависимостей → `typecheck`, `lint`, `tokens:check` зелёные
      Paths: H [kit §4: a11y диалога] · N [Dialog: открытие/закрытие повторно, закрытие при размонтировании]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a
- [x] R03-T3 · T1 · Spec: [manifest §2](../contracts/game_manifest_contract.md)
      Files: `app/dev/game-kit/page.tsx`, `app/dev/game-kit/Gallery.tsx`, `games/reserved-slugs.ts`, `games/registry.test.ts`
      Acceptance: `/dev/game-kit` показывает секцию «Токены» (образцы цветов с парами `*-fg` и значением контраста, шкала Manrope, радиусы, тени, `team-1…6`, `game-1…5`) — по ней владелец одобряет значения T1 — и галерею примитивов T2 во всех состояниях (варианты, sizes, disabled, loading, диалог); в `NODE_ENV === 'production'` страница вызывает `notFound()`; `dev` присутствует в `RESERVED_SLUGS`, тест реестра проверяет его → в `next build && next start` маршрут отдаёт 404; в dev — открывается
      Paths: H [галерея] · N [production → 404]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · `tokens:check` · UI-check `/dev/game-kit` на 360/768/1280

### R03-CU2 — feat(i18n): add cookie locale, providers, switcher and portal dictionaries · Review: diff-only · Smoke: none · Commit: auto

- [x] R03-T4 · T1 · Spec: [i18n §1–§2](../contracts/i18n_contract.md)
      Files: `shared/i18n/resolve-locale.ts`, `shared/i18n/resolve-locale.test.ts`, `shared/i18n/format.ts`, `shared/i18n/format.test.ts`, `shared/i18n/plural.ts`, `shared/i18n/plural.test.ts`, `shared/i18n/types.ts`
      Acceptance: `resolveLocale(cookie, acceptLanguage)`: cookie `ru|en` → она; иная/пустая cookie → по `Accept-Language` (`ru*` → `ru`, иначе `en`); пусто → `ru`; `format('Привет, {name}', {name})`; `plural` для `ru` (1, 2, 5, 11, 21, 22, 25) и `en`; `DeepStringRecord` → тесты зелёные
      Paths: H [i18n §2] · N [cookie `de`, пустая строка, мусор, отсутствие `{name}` в values]
- [x] R03-T5 · T1 · Spec: [i18n §2](../contracts/i18n_contract.md) · Spec: [portal_home §6](../specs/portal_home_spec.md) · Spec: [shell §3–§4](../specs/game_shell_spec.md)
      Files: `shared/i18n/dictionaries/ru.ts`, `shared/i18n/dictionaries/en.ts`
      Acceptance: пространства `site`, `nav`, `catalog`, `gameKit` (общие кнопки: старт, перезапуск, выйти, остаться, пауза, играть снова, закрыть, правила; `confirmExit`, `error`, `phase` для aria-live, `quiz`, `victory`), `errors`; `en.ts` типизирован как `Dictionary` из `ru` → пропуск ключа ломает `typecheck`
      Paths: n/a — copy
- [x] R03-T6 · T2 · Spec: [i18n §3](../contracts/i18n_contract.md)
      Files: `shared/i18n/server.ts`, `shared/i18n/actions/set-locale.ts`, `shared/i18n/I18nProvider.tsx`, `shared/i18n/GameI18nProvider.tsx`, `shared/i18n/LocaleSwitcher.tsx`, `shared/i18n/index.ts`, `app/layout.tsx`, `app/dev/game-kit/Gallery.tsx`
      Acceptance: `getLocale()` (cookie → `Accept-Language`), `getDictionary()`; Server Action `setLocale` валидирует значение по `ACTIVE_LOCALES`, ставит cookie (`Path=/`, `SameSite=Lax`, 1 год), вызывает `revalidatePath('/', 'layout')`, недопустимое значение — игнор без ошибки наружу; `app/layout.tsx` ставит `<html lang={locale}>` и оборачивает приложение в `I18nProvider`; `LocaleSwitcher` (RU | EN, `aria-pressed`, ≥ 48 px, без флагов-эмодзи) добавлен в галерею → переключение меняет язык галереи без перезагрузки URL; cookie `locale` выставляется; `de` игнорируется
      Paths: H [i18n §3] · N [setLocale('de') → игнор; повторный вызов с тем же значением]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · UI-check переключения RU/EN на `/dev/game-kit`

### R03-CU3 — feat(game-kit): add game shell and display components · Review: diff-only · Smoke: none · Commit: auto

- [x] R03-T7 · T2 · Spec: [shell §1–§5](../specs/game_shell_spec.md) · Contract: [kit §2](../contracts/game_kit_contract.md)
      Files: `shared/game-kit/types.ts`, `shared/game-kit/GameShell.tsx`, `shared/game-kit/GameHeader.tsx`, `shared/game-kit/ExitConfirmDialog.tsx`, `shared/game-kit/GameErrorBoundary.tsx`, `shared/game-kit/index.ts`
      Acceptance: типы §2.1 контракта; `GameShell` с шапкой, ссылкой «Пропустить к игре», подтверждением выхода по фазам (§2–§3 спецификации), `beforeunload` в `playing`/`paused`, aria-live для смены фазы, error boundary (§4); тексты из `gameKit.*` → галерея показывает `GameShell` в четырёх фазах; имитация `throw` не ломает шапку
      Paths: H [shell §2] · N [shell §4: падение дочернего компонента; нет `rules`/`onRestart`]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a
- [x] R03-T8 · T2 · Spec: [kit §2](../contracts/game_kit_contract.md)
      Files: `shared/game-kit/ScoreBoard.tsx`, `shared/game-kit/Timer.tsx`, `shared/game-kit/use-countdown.ts`, `shared/game-kit/use-countdown.test.ts`
      Acceptance: `ScoreBoard` (props-driven, активная команда, `aria-live`, цвет команды — токены `team-1…6` плюс номер/метка, не только цвет; активная команда — `accent`/`accent-fg`); `Timer` (`inline`/`ring`, `role="timer"`, не тикает на паузе; при < 5 с меняются цвет `danger` и форма — иконка/штриховка, без пульсации); хук `useCountdown` с тестами на fake timers (тик, пауза, возобновление, `onElapsed` ровно один раз, смена `seconds`) → тесты зелёные
      Paths: H [kit §2] · N [seconds = 0, отрицательные значения, `running` переключается во время тика]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a
- [x] R03-T9 · T2 · Spec: [kit §2](../contracts/game_kit_contract.md)
      Files: `shared/game-kit/VictoryScreen.tsx`, `shared/game-kit/Confetti.tsx`, `shared/game-kit/RulesDialog.tsx`, `shared/game-kit/rank-teams.ts`, `shared/game-kit/rank-teams.test.ts`
      Acceptance: `rankTeams(teams)` — убывание по очкам, ничья делит место (одинаковый `rank`), стабильная сортировка; `VictoryScreen` показывает победителя(ей) при ничьей; `Confetti` выключается при `prefers-reduced-motion`; `RulesDialog` отображает `RulesContent` в `Dialog` → тесты зелёные; галерея показывает победу с ничьёй и без
      Paths: H [kit §2] · N [пустой список команд, одна команда, все 0 очков]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · `tokens:check` · UI-check `/dev/game-kit` (RU и EN) на 360/768/1280

### R03-CU4 — feat(game-kit): add quiz, level select and settings components · Review: diff-only · Smoke: none · Commit: auto

- [x] R03-T10 · T1 · Spec: [kit §2.1](../contracts/game_kit_contract.md); [решение фазы о `QuestionModal`](R03_phase_description.md#принятые-решения-для-фазы)
      Files: `shared/game-kit/check-text-answer.ts`, `shared/game-kit/check-text-answer.test.ts`
      Acceptance: `checkTextAnswer(input, correct)` — сравнение по `trim().toLowerCase()` (как в текущем Alphabet); тесты: регистр, пробелы по краям, пустой ввод → `false`, пустой эталон → `false`
      Paths: H · N [пустые строки]
- [x] R03-T11 · T2 · Spec: [kit §2](../contracts/game_kit_contract.md)
      Files: `shared/game-kit/QuestionModal.tsx`, `shared/game-kit/LevelSelect.tsx`
      Acceptance: `QuestionModal` — варианты (`choice`) или текстовый ввод (`text`), `Timer` внутри, показ правильного ответа после ответа/таймаута, затем `onAnswer({ correct, timedOut })`; `LevelSelect` — кнопки уровней с очками (+3/+6/+10 крупно; уровни различаются очками, формой и подписью, не «светофором») и остатком вопросов, таймер выбора, `onTimeout`, `emptyNotice` при отсутствии доступных уровней (вместо `alert`); оба на `Dialog`; клавиатурная навигация (варианты — радио-группа/кнопки с фокусом, `Enter` отправляет текст) → галерея показывает оба компонента в режимах choice/text/таймаут
      Paths: H [kit §2] · N [таймаут без выбора; пустой ответ; повторное нажатие до закрытия — один вызов `onAnswer`]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a
- [x] R03-T12 · T2 · Spec: [kit §2](../contracts/game_kit_contract.md)
      Files: `shared/game-kit/SettingsPanel.tsx`, `shared/game-kit/TeamsSetup.tsx`, `shared/game-kit/StepperInput.tsx`
      Acceptance: `StepperInput` — поведение текущего `games/alphabet/components/StepperInput.tsx` (мин/макс/шаг, ввод с клавиатуры, `aria-valuenow`), `TeamsSetup` (количество `min…max`, имена, пустое имя → подстановка по умолчанию через `onChange`-значение, не вызывается из kit), `SettingsPanel` (макет + кнопка «Начать») → галерея показывает все три
      Paths: H [kit §2] · N [выход за min/max, нечисловой ввод]
      UI: /dev/game-kit · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · `tokens:check` · UI-check `/dev/game-kit` на 360/768/1280

### R03-CU5 — refactor(games): move alphabet into game shell with cookie locale · Review: diff-only · Smoke: deferred · Commit: auto

- [ ] R03-T13 · T2 · Spec: [i18n §2](../contracts/i18n_contract.md)
      Files: `games/alphabet/i18n/ru.ts`, `games/alphabet/i18n/en.ts`, `games/alphabet/i18n/inactive.ts`, `games/alphabet/i18n/use-game-t.ts`, `games/alphabet/i18n/translations.ts`
      Acceptance: `TRANSLATIONS` разделён: `ru.ts` (эталон), `en.ts` (тип по `ru`), строки `uk/de/ro` сохранены в `inactive.ts` без изменений; `use-game-t.ts` типизирует `useGameT`; `translations.ts` удалён → `typecheck` падает при расхождении ключей `ru`/`en`; содержимое строк не изменено
      Paths: n/a — behavior-preserving refactor
- [ ] R03-T14 · T3 · Spec: [i18n §3–§4](../contracts/i18n_contract.md)
      Files: `games/alphabet/store.ts`, `games/alphabet/page.tsx`, `games/alphabet/components/**`
      Acceptance: из store удалены `locale`, `setLocale`, чтение/запись `localStorage('alphabet_locale')` и инициализация по `navigator.language`; `initializeGame(settings, locale)` и `selectSuiteForLocale(locale)` заменяют чтение `get().locale` в сторе; `page.tsx` принимает `{ locale }`, оборачивает контент в `GameI18nProvider` и передаёт `locale` в `GameApp`; компоненты читают `useLocale()` / `useGameT()`; выбор системного набора вопросов по языку выполняется по `locale` при инициализации и при смене локали (поведение как до изменения); `LocaleSelector` и `HOME_CONFIRM` удалены (подтверждение выхода — в `GameShell`) → смена RU↔EN переключателем портала меняет тексты и набор вопросов Alphabet; `rg "navigator.language|alphabet_locale" games` пуст
      Paths: H [i18n §4] · N [нет набора для локали → набор `ru` + сообщение; смена локали во время игры не ломает состояние] · S [cookie `locale` не содержит пользовательских данных]
      UI: /alphabet · roles: public · widths: 360,768,1280
      Seed: n/a
- [ ] R03-T15 · T2 · Spec: [shell §1–§2](../specs/game_shell_spec.md)
      Files: `games/alphabet/page.tsx`, `games/alphabet/components/GameApp.tsx`, `games/alphabet/logic/game-phase.ts`, `games/alphabet/logic/game-phase.test.ts`
      Acceptance: Alphabet рендерится внутри `GameShell`; `getGamePhase(state)` (чистая функция, тест) сопоставляет состояние store с `GamePhase`: `isLoading` или `isSettingsStage` → `lobby`; `isGameOver` → `finished`; `isPaused` → `paused`; иначе `playing` (подстраницы `showEditor/Prompt/AIGenerator/Library/Guide` относятся к `lobby`); собственные шапка/кнопка «домой» удалены; `onRestart` вызывает `resetGame`; правила открываются из шапки и по хэшу `#rules` (временно — существующий `RulesPage` в `RulesDialog`) → экран Alphabet показывает шапку `GameShell`; выход из `playing` запрашивает подтверждение, из `lobby` — нет
      Paths: H [shell §2] · N [состояние store «загрузка» → `lobby`]
      UI: /alphabet · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · `tokens:check` (baseline не вырос) · UI-check `/alphabet` на 360/768/1280 (RU и EN)

### R03-CU6 — refactor(games): replace alphabet components with kit adapters and tokens · Review: diff-only · Smoke: blocking · Commit: auto

- [ ] R03-T16 · T2 · Spec: [kit §1, §2.1](../contracts/game_kit_contract.md)
      Files: `games/alphabet/logic/map-question.ts`, `games/alphabet/logic/map-question.test.ts`, `games/alphabet/logic/map-level.ts`, `games/alphabet/logic/map-level.test.ts`
      Acceptance: `mapQuestion(Question) → QuizQuestion` (тип `ID` → `choice`, `String` → `text`), `mapLevels(settings, strings) → LevelOption[]` с очками `SCORE_EASY/MEDIUM/HARD`; тесты на оба типа ответа и отсутствующие `answersList`/`rightAnswer*`
      Paths: H · N [`answersList: null` при `ID`, нет правильного ответа]
- [ ] R03-T17 · T3 · Spec: [kit §2–§3](../contracts/game_kit_contract.md)
      Files: `games/alphabet/components/ScoreBoardContainer.tsx`, `games/alphabet/components/QuestionModalContainer.tsx`, `games/alphabet/components/LevelSelectContainer.tsx`, `games/alphabet/components/VictoryScreenContainer.tsx`, `games/alphabet/components/SettingsContainer.tsx`, `games/alphabet/components/GameApp.tsx`, `games/alphabet/components/ScoreBoard.tsx`, `games/alphabet/components/Timer.tsx`, `games/alphabet/components/QuestionModal.tsx`, `games/alphabet/components/LevelSelectModal.tsx`, `games/alphabet/components/VictoryScreen.tsx`, `games/alphabet/components/Confetti.tsx`, `games/alphabet/components/StepperInput.tsx`, `games/alphabet/components/GameSettings.tsx`, `games/alphabet/components/RulesPage.tsx`
      Acceptance: контейнеры читают `useGameStore()` и передают props в kit (`ScoreBoard`, `QuestionModal`, `LevelSelect`, `VictoryScreen`, `SettingsPanel` + `TeamsSetup` + `StepperInput`, `RulesDialog` с `RulesContent` из словаря Alphabet); поведение игры и счёт **не изменены** (в т. ч. задержка результата 2500/2000 мс, авто-выбор уровня по таймеру, подтверждение завершения игры теперь в `Dialog`, без `window.confirm`/`alert`); старые реализации `ScoreBoard`, `Timer`, `QuestionModal`, `LevelSelectModal`, `VictoryScreen`, `Confetti`, `StepperInput` удалены; специфичные настройки Alphabet (режим с вопросами/без, темы, таймеры) остаются в `SettingsContainer` внутри `SettingsPanel` → `rg "useGameStore" shared` пуст; `rg "components/(ScoreBoard|Timer|QuestionModal|LevelSelectModal|VictoryScreen|Confetti|StepperInput)\.tsx" games` — файлов нет
      Paths: H [полный цикл игры] · N [таймаут выбора уровня и ответа; игра без вопросов; ничья в финале]
      UI: /alphabet · roles: public · widths: 360,768,1280
      Seed: n/a
- [ ] R03-T18 · T2 · Spec: [tokens §3.1](../contracts/design_tokens_contract.md)
      Files: `games/alphabet/components/Card.tsx`, `games/alphabet/components/GameApp.tsx`, `games/alphabet/components/*Container.tsx`, `games/alphabet/constants.ts`, `scripts/tokens-baseline.json`
      Acceptance: файлы игрового экрана (`Card`, `GameApp`, контейнеры) переведены на токены «Утреннего света»; карточка: рубашка `surface` с номером и `shadow-card`, открытая буква — на `accent` с `accent-fg`, контраст ≥ 7:1 (вместо белой на amber ≈1.6:1 и белой на emerald ≈2.5:1), текст не мельче 14 px, эмодзи заменены `lucide-react`; полный редизайн поля (spring-флип, пауза без blur) — R04; `COLORS` из `constants.ts` используется только как источник значений для токенов, а не в разметке; baseline обновлён (удалены переведённые файлы, числа остальных не выросли) → `npm run tokens:check` = 0; суммарное число нарушений «после» записано (меньше значения «до» из R03-T1)
      Paths: n/a — styling refactor
      UI: /alphabet · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · `tokens:check` · UI-check `/alphabet` (лобби, игра, вопрос choice и text, победа; RU и EN; 360/768/1280) · **ручной smoke владельца** (`Smoke: blocking`): полный цикл игры по [`alphabet_migration_spec.md` §4](../specs/alphabet_migration_spec.md)

### R03-CU7 — feat(portal): add catalog home, site config and coming-soon page · Review: diff-only · Smoke: none · Commit: auto

- [ ] R03-T19 · T1 · Spec: [home §1](../specs/portal_home_spec.md)
      Files: `shared/config/site.ts`, `games/alphabet/components/GameApp.tsx`, `app/_components/SiteHeader.tsx`, `app/_components/SiteFooter.tsx`, `app/layout.tsx`, `app/[game]/layout.tsx`
      Acceptance: `SITE = { name: 'Circle', indexable: false }` (было `EdenGames`) — единственное место имени и флага индексации; шапка (знак «C» в круге `accent`, `LocaleSwitcher`; единственное место `backdrop-filter`) и подвал портала на `/`; страницы игр (`/<slug>`) шапку портала **не** показывают (у них `GameShell`); метаданные `robots` из `SITE.indexable` → имя портала нигде больше не захардкожено, `rg "EdenGames" app shared games` пуст (в т. ч. футер `GameApp`), `<title>` и `og:site_name` — Circle
      Paths: H [home §1]
      UI: / · roles: public · widths: 360,768,1280
      Seed: n/a
- [ ] R03-T20 · T2 · Spec: [home §2–§5](../specs/portal_home_spec.md)
      Files: `app/page.tsx`, `app/_components/GameCard.tsx`, `app/_components/GameTile.tsx`, `app/_components/GameGrid.tsx`, `shared/game-kit/manifest.ts`, `shared/game-kit/manifest.test.ts`, `games/registry.ts`, `games/registry.test.ts`, `games/alphabet/manifest.ts`, `public/games/alphabet/cover.webp`
      Acceptance: каталог по спецификации (hero без пятен и лозунгов про дизайн, сетка 1/2/3 колонки, `GameCard` с плиткой `GameTile` — цвет `game-<tone>` и глиф, теги, мета, состояния; пустое состояние; метаданные `title`/`description`/`robots`); `GameManifest.cover` заменён на `tile: { glyph, tone }` ([manifest §1, §3.1](../contracts/game_manifest_contract.md)), валидация и тесты реестра обновлены, у Alphabet `tile: { glyph: 'А', tone: 1 }`, `cover.webp` удалён → `portal_home_spec §7` — все пункты выполнены (тестовая запись `coming-soon` — локально, не коммитится)
      Paths: H [home §2] · N [home §4: пустой реестр, длинные тексты; манифест без `tile`, `glyph` > 2 символов, `tone` вне 1–5]
      UI: / · roles: public · widths: 360,768,1280
      Seed: n/a
- [ ] R03-T21 · T2 · Spec: [routing §1–§2](../contracts/game_routing_contract.md)
      Files: `app/[game]/ComingSoon.tsx`, `app/[game]/page.tsx`, `app/[game]/error.tsx`, `app/[game]/loading.tsx`, `app/[game]/page.test.ts`
      Acceptance: для `coming-soon` страница возвращает 200 с блоком «Скоро» (плитка, название, описание из манифеста, ссылка в каталог) и `robots: noindex`; `generateMetadata` покрывает оба статуса; тексты `error.tsx`/`loading.tsx` — из словаря `errors` (кириллицы нет); тест: `coming-soon` не вызывает `loadPage`; `active` вызывает → тест зелёный; визуальная проверка — временной записью, не коммитится
      Paths: H [routing §1] · N [slug неизвестен → 404; coming-soon без `loadPage`]
      UI: /<temp-coming-soon> · roles: public · widths: 360,768,1280
      Seed: n/a

**CU DoD:** `typecheck` · `lint` · `test` · `build` · `tokens:check` · ревью по чеклисту `DESIGN.md` · UI-check `/` и страницы «Скоро» (временная запись) на 360/768/1280, RU и EN

### R03-CU8 — feat(games): add game template, module rule and adding-a-game guide · Review: diff-only · Smoke: none · Commit: auto

- [ ] R03-T22 · T2 · Spec: [adding §1](../specs/adding_a_game_spec.md)
      Files: `games/_template/**`, `games/registry.test.ts`
      Acceptance: шаблон по составу §1 (игра-заглушка «счётчик очков команд» на `GameShell`, `ScoreBoard`, `RulesDialog`, фазы lobby→playing→finished; логика в `logic/scoring.ts` с тестом; словари `ru`/`en`); тест: `listGames()` не содержит `template`; после `cp -r games/_template games/tmp-check` + замены slug выполняются `typecheck`, `lint`, `test`, `tokens:check` (проверяется скриптом-тестом `scripts/check-template.test.mjs` во временной папке, которая удаляется) → тесты зелёные
      Paths: H [adding §1] · N [slug из шаблона зарезервирован/не уникален → ошибка реестра]
      UI: n/a — шаблон не регистрируется
      Seed: n/a
- [ ] R03-T23 · T1 · Spec: [adding §2–§3](../specs/adding_a_game_spec.md)
      Files: `.cursor/rules/game-module-contract.mdc`, `.cursor/rules/README.md`, `docs/adding-a-game.md`, `docs/meta/templates/game_description.template.md`
      Acceptance: правило `globs: games/**`, ≤ 80 строк, ссылки на контракты без копирования; `docs/adding-a-game.md` — чек-лист §2 с реальными командами и путями проекта; шаблон описания игры согласован с `docs/games/alphabet.md`; манифест правил обновлён → `docs:links` = 0
      Paths: n/a — docs-only

**CU DoD:** `typecheck` · `lint` · `test` · `tokens:check` · `docs:links` · `encoding:check`

### R03-CU9 — docs(docs): cold-run acceptance and documentation sync · Review: diff-only · Smoke: none · Commit: auto

- [ ] R03-T24 · T2 · Spec: [adding §4](../specs/adding_a_game_spec.md)
      Files: `docs/adding-a-game.md`, `docs/implementation/phases/R03_tasks.md`
      Acceptance: **холодный прогон**: агент в новой сессии, имея только `AGENTS.md` и `docs/adding-a-game.md`, создаёт временную игру `sandbox-demo` («угадай число» с командами и табло), добавляет временную запись `coming-soon`; все проверки (`typecheck`, `lint`, `test`, `tokens:check`, `build`) зелёные, `/` показывает обе карточки (с `tile`), `/sandbox-demo` открыт внутри `GameShell`; временные игра, запись реестра и обложка удалены, `git status` чист; пробелы инструкции устранены в `docs/adding-a-game.md`; отчёт (время, число правок/вопросов, пробелы) записан в Verification ниже
      Paths: n/a — docs-only (прогон — проверка, результат в документ)
- [ ] R03-T25 · T1 · Spec: [product-docs-alignment](../../../.cursor/rules/product-docs-alignment.mdc)
      Files: `docs/design/DESIGN.md`, `docs/architecture/i18n-approach.md`, `docs/games/alphabet.md`, `docs/games/alphabet/ui_components.md`, `docs/games/alphabet/state_management.md`, `docs/architecture/ADR-003-repo-structure.md`, `docs/architecture/ADR-006-i18n-and-game-data.md`, `AGENTS.md`, `.cursor/skills/app-conventions/SKILL.md`, `.cursor/rules/README.md`
      Acceptance: `i18n-approach.md` переписан под cookie-локаль, словари и провайдеры (без Zustand/localStorage); `ui_components.md`/`state_management.md` отражают kit и адаптеры; ADR-003 и ADR-006 дополнены разделом «Реализация (R03)»; `AGENTS.md` — название Circle, статус «R03 завершена», ссылки на `docs/adding-a-game.md`, каталог kit и `/dev/game-kit`; skill и манифест актуальны → `AGENTS.md` ≤ 120 строк; `docs:links`, `encoding:check` = 0
      Paths: n/a — docs-only
- [ ] R03-T26 · T1 · Spec: [R03_phase_description §Phase DoD](R03_phase_description.md#phase-dod)
      Files: `docs/implementation/phases/R03_tasks.md`
      Acceptance: все пункты Phase DoD выполнены и отмечены; записаны значения baseline «до/после»; production-проверка `/dev/game-kit` (`next build && next start` → 404); список вопросов, оставшихся к владельцу (индексация, домен и соцсети Circle, глифы и цвета плиток следующих игр, следующие игры)
      Paths: n/a — docs-only

**CU DoD:** весь набор проверок: `docs:links` · `encoding:check` · `deps:check` · `typecheck` · `lint` · `test` · `tokens:check` · `build`

## Verification (phase)

- [ ] Все CU закоммичены; у каждого trace `Review: …`
- [ ] Phase DoD из [`R03_phase_description.md`](R03_phase_description.md#phase-dod)
- [ ] У каждого CU с `UI:`-задачами в ответе есть строка `UI-check: … ok`
- [ ] Baseline `tokens:check` до/после: _(числа)_
- [ ] Холодный прогон (R03-T24): _(время, правки, пробелы)_
- [ ] Ручной smoke владельца после CU6: _(подтверждение, дата)_
- [ ] Вопросы, оставшиеся к владельцу: _(список)_

---

## Related documents

| Document | Relationship |
|----------|--------------|
| [`R03_phase_description.md`](R03_phase_description.md) | DoD фазы |
| [`game_kit_contract.md`](../contracts/game_kit_contract.md) · [`i18n_contract.md`](../contracts/i18n_contract.md) · [`design_tokens_contract.md`](../contracts/design_tokens_contract.md) | Контракты |
| [`portal_home_spec.md`](../specs/portal_home_spec.md) · [`game_shell_spec.md`](../specs/game_shell_spec.md) · [`adding_a_game_spec.md`](../specs/adding_a_game_spec.md) | Спецификации |
