# R03 — Общий UI-кит, портал и каркас новых игр

**Тип:** Phase description  
**Статус:** Draft — Phase DoR audit против кода после R02 выполнен 2026-11-03 (см. `R03_tasks.md`); редизайн «Утренний свет» внесён 2026-11-03  
**Версия:** 1.1  
**Дата:** 2026-11-03  
**Зависит от:** R02 завершена; [`DESIGN.md`](../../design/DESIGN.md) (направление «Утренний свет», аудит: [`design_audit_and_concepts.md`](../../design/design_audit_and_concepts.md)); контракты [`game_kit`](../contracts/game_kit_contract.md) · [`i18n`](../contracts/i18n_contract.md) · [`design_tokens`](../contracts/design_tokens_contract.md); спецификации [`portal_home`](../specs/portal_home_spec.md) · [`game_shell`](../specs/game_shell_spec.md) · [`adding_a_game`](../specs/adding_a_game_spec.md)  
**Задачи:** [`R03_tasks.md`](R03_tasks.md)  
**Предыдущая фаза:** [`R02`](R02_phase_description.md)

---

## Цель

Все игры каталога собираются из одного набора компонентов и токенов в стиле «Утренний свет» и выглядят похоже; портал **Circle** имеет полноценную главную страницу; RU/EN работает для портала и Alphabet без префиксов в URL; новая игра добавляется по инструкции за один рабочий день без правок вне своей папки (кроме реестра и обложки).

## Scope

1. Токены темы «Утренний свет» (`shared/styles/tokens.css`: палитра, Manrope, радиусы 14/22, `shadow-card`/`shadow-press`, высоты контролов 48/64) и примитивы `shared/ui` без новых UI-зависимостей; проверка `tokens:check` с baseline ([`design_tokens_contract.md`](../contracts/design_tokens_contract.md)).
2. i18n: cookie-локаль, `I18nProvider`, `LocaleSwitcher`, словари портала и game-kit, словари Alphabet `ru.ts`/`en.ts` ([`i18n_contract.md`](../contracts/i18n_contract.md)).
3. `shared/game-kit`: `GameShell`, `ScoreBoard`, `Timer`, `VictoryScreen`+`Confetti`, `RulesDialog`, `QuestionModal`, `LevelSelect`, `SettingsPanel`, `TeamsSetup`, `StepperInput` ([`game_kit_contract.md`](../contracts/game_kit_contract.md), [`game_shell_spec.md`](../specs/game_shell_spec.md)).
4. Перевод Alphabet на kit: store-связанные компоненты заменяются адаптерами над props-driven компонентами kit; дублирующие реализации удаляются; игровой экран Alphabet переводится на токены, контраст открытой буквы ≥ 7:1 (`accent`/`accent-fg`).
5. Главная страница ([`portal_home_spec.md`](../specs/portal_home_spec.md)): плитка игры с глифом (`manifest.tile` вместо `cover`), `SITE` конфигурация (имя **Circle**), страница «Скоро» для `coming-soon`, метаданные.
6. `games/_template`, правило `game-module-contract.mdc`, `docs/adding-a-game.md`, холодный прогон ([`adding_a_game_spec.md`](../specs/adding_a_game_spec.md)).
7. Dev-галерея компонентов `/dev/game-kit` (только `NODE_ENV !== 'production'`; slug `dev` зарезервирован) — инструмент UI-проверки агентов.
8. Документация: обновление `i18n-approach.md`, `docs/games/alphabet*`, `AGENTS.md`, skill `app-conventions`.

## Out of scope

- Новые игры (кроме временной `sandbox-demo` для холодного прогона — удаляется).
- Тёмная тема, фильтры/поиск в каталоге, пагинация.
- Открытие индексации (`SITE.indexable` остаётся `false`), hreflang, sitemap.
- Перевод в токены остальных (редакторских) экранов Alphabet — они остаются в baseline ratchet.
- Переписывание логики Alphabet (кроме замены связки store ↔ UI на адаптеры).
- Установка shadcn/ui (Base UI), Radix и подобных библиотек — в [R04](R04_phase_description.md); Storybook; e2e-тесты.
- Редизайн игрового поля (spring-флип, таймер, пауза без blur), экрана настроек, админки, замена `alert/confirm`, оптимизация INP — [R04](R04_phase_description.md).
- Локали `uk`, `de`, `ro` (остаются выключенными).

## Входные условия

- [ ] R02 завершена; Phase DoD R02 выполнен; `master` (или ветка R02) зелёная
- [ ] Phase DoR audit R03 закрыт: контракты и спецификации сверены с фактическим кодом `games/alphabet` (имена компонентов, поля store, список строк `TRANSLATIONS`), расхождения исправлены в документах
- [x] Направление и палитра «Утренний свет» утверждены владельцем 2026-11-03 ([`DESIGN.md`](../../design/DESIGN.md)); остаётся одобрить по галерее `/dev/game-kit` значения `success`, `danger`, `team-1…6` (R03-T1)
- [ ] Ветка `R03-ui-kit-portal`

## Принятые решения для фазы

| Вопрос | Решение |
|--------|---------|
| UI-примитивы | Собственные, на токенах и нативных возможностях (`<dialog>` для `Dialog`, Framer Motion для анимаций); новые UI-зависимости не добавляются |
| Связь kit и сторов игры | Kit — props-driven; в Alphabet адаптеры (`*Container.tsx`) читают `useGameStore()` и передают props |
| Поведение `QuestionModal` | Сохраняется как в Alphabet: выбор варианта; текст сравнивается по `trim().toLowerCase()`; после ответа показывается правильный ответ, затем вызывается `onAnswer`; таймер по истечении даёт `timedOut` |
| Локаль в Alphabet | Zustand/localStorage-локаль удаляется; источник — `useLocale()`; данные вопросов фильтруются по `locale` самой игрой |
| Дизайн-направление | «Утренний свет» ([`DESIGN.md`](../../design/DESIGN.md)); мягкое пятно в hero убрано; `backdrop-filter` только на липкой шапке портала; запреты — в `DESIGN.md` |
| Название портала | **Circle** вводится в R03-T19 (`SITE.name`); `EdenGames` в коде не остаётся (домен и соцсети — вне репозитория) |
| Плитка игры | `manifest.tile = { glyph, tone }` вместо `cover.webp`; файл `public/games/alphabet/cover.webp` удаляется в R03-T20 |
| Токены в Alphabet | Игровой экран (`Card`, лобби, вопросы, победа, табло) — на токенах; остальное — baseline-ratchet |
| Review | `diff-only` для всех CU (профиль `lean`; sensitive zones в R03 не затрагиваются: `auth`, `api`, `proxy`, `.env*`, `next.config.*` не меняются); `reviewer` — по явной просьбе владельца |
| Smoke | `R03-CU6` — `Smoke: blocking` (владелец играет в Alphabet на новом UI); `R03-CU5` — `deferred` |
| Временные сущности | `sandbox-demo` и тестовая запись `coming-soon` создаются и удаляются в CU9 и не коммитятся |

## Phase DoD

- [ ] Все CU закоммичены; у каждого trace `Review: …`
- [ ] `typecheck`, `lint`, `test`, `build`, `docs:links`, `encoding:check`, `deps:check`, `tokens:check` — зелёные
- [ ] Alphabet использует `GameShell` и компоненты kit; в `games/alphabet` нет собственных реализаций `ScoreBoard`, `Timer`, `QuestionModal`, `LevelSelect`, `VictoryScreen`, `Confetti`, `StepperInput`, `RulesPage`-обёртки диалога ([`game_kit_contract.md §5`](../contracts/game_kit_contract.md))
- [ ] `rg "useGameStore" shared/` пуст; кириллицы вне словарей и данных нет в охваченных путях ([`i18n_contract.md §5`](../contracts/i18n_contract.md); унаследованные пути — в R04)
- [ ] RU↔EN переключается на `/` и `/alphabet` без перезагрузки URL; `<html lang>` и cookie `locale` корректны; значение cookie `de` игнорируется
- [ ] `/` — каталог по [`portal_home_spec.md §7`](../specs/portal_home_spec.md); `coming-soon` отображается как «Скоро» (проверено временной записью)
- [ ] `rg "EdenGames" app shared games` пуст; `SITE.name === 'Circle'`
- [ ] Нет `cover` в манифестах и реестре; у всех игр `tile`
- [ ] `tokens:check` зелёный; baseline не вырос; число нарушений в baseline уменьшилось относительно значения на старте CU1 (записать «до/после»)
- [ ] `games/_template` проходит `typecheck`/`lint`/`test` после копирования и замены slug; холодный прогон выполнен и описан; временные `sandbox-demo`/тестовые записи удалены
- [ ] UI-check на 360/768/1280 для `/`, `/alphabet` (лобби, игра, вопрос, победа), `/dev/game-kit` — строки `UI-check: … ok`
- [ ] `/dev/game-kit` в production-сборке отдаёт 404
- [ ] `AGENTS.md`, `.cursor/rules/README.md`, skill `app-conventions`, `docs/adding-a-game.md`, `docs/architecture/i18n-approach.md` актуальны

## Риски

| Риск | Смягчение |
|------|-----------|
| Alphabet завязан на store: обобщение ломает игру | Адаптеры над kit; kit пишется на props до переноса; smoke `blocking` после CU6; поведение `QuestionModal` зафиксировано выше |
| 630 палитровых утилит — перевод на токены разрастается | Baseline-ratchet: переводится только игровой экран; остальное не растёт |
| `cookies()` в корневом layout делает все маршруты динамическими | Принято (Alphabet и так динамичен); фиксируется в ADR-006 «Последствия» (R01) |
| Вёрстка kit расходится с ожиданиями владельца | Галерея `/dev/game-kit` + согласование палитры до CU1 |
| Холодный прогон показывает пробелы инструкции | Это цель прогона: пробелы устраняются в CU9, прогон повторяется при существенных правках |
| Редизайн расширяет объём R03 | Меняются значения токенов и три задачи (T18–T20), структура CU не меняется; остальное — R04 |
| Выбранный вариант похож на типовое веб-приложение | Запреты `DESIGN.md`, плитки с глифами, типографика; ревью по мини-чеклисту `DESIGN.md` |
| Устаревшие контракты | Phase DoR audit в начале фазы |

## Связанные документы

| Документ | Роль |
|----------|------|
| [`game_kit_contract.md`](../contracts/game_kit_contract.md), [`design_tokens_contract.md`](../contracts/design_tokens_contract.md), [`i18n_contract.md`](../contracts/i18n_contract.md) | Контракты фазы |
| [`portal_home_spec.md`](../specs/portal_home_spec.md), [`game_shell_spec.md`](../specs/game_shell_spec.md), [`adding_a_game_spec.md`](../specs/adding_a_game_spec.md) | Спецификации фазы |
| [`R03_tasks.md`](R03_tasks.md) | Задачи и CU |
