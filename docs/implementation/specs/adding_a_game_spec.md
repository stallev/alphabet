# Спецификация процесса «Добавить игру»

**Тип:** Spec  
**Статус:** Draft  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** [`repo_structure_contract.md`](../contracts/repo_structure_contract.md), [`game_manifest_contract.md`](../contracts/game_manifest_contract.md), [`game_kit_contract.md`](../contracts/game_kit_contract.md), [`i18n_contract.md`](../contracts/i18n_contract.md)  
**Используется в:** R03-CU7 (создаёт `games/_template`, `docs/adding-a-game.md`, правило `game-module-contract.mdc`) и R03-CU8 (холодный прогон)

---

## §1 Состав `games/_template/`

```
games/_template/
  README.md                    # что заменить (4 строки)
  manifest.ts                  # slug 'template', status 'coming-soon'; НЕ регистрируется
  page.tsx                     # server entry: загружает словарь, оборачивает в GameI18nProvider + GameShell
  components/TemplateGame.tsx  # клиентская игра-заглушка внутри GameShell: фазы lobby → playing → finished
  logic/scoring.ts             # пример чистой логики + scoring.test.ts
  i18n/{ru,en}.ts              # словари игры
  data/.gitkeep
  server/.gitkeep
```

`_template` исключён из реестра и линтер-границ программно (имя начинается с `_`); тест подтверждает, что `listGames()` не содержит `template`.

## §2 Чек-лист «Добавить игру» (идёт в `docs/adding-a-game.md`)

| # | Шаг | Проверка |
|---|-----|----------|
| 1 | Выбрать slug (`/^[a-z][a-z0-9-]{1,31}$/`, не зарезервирован) | `npm run test` (реестр) |
| 2 | `cp -r games/_template games/<slug>`; заменить `template` на slug | `rg template games/<slug>` пуст |
| 3 | Заполнить `manifest.ts` (RU и EN), положить `public/games/<slug>/cover.webp` (16:9, ≤ 120 КБ) | валидация реестра |
| 4 | Зарегистрировать манифест в `games/registry.ts` | карточка на `/` |
| 5 | Написать логику в `logic/` с тестами | `npm run test` |
| 6 | Собрать UI из `shared/game-kit` и `shared/ui`; только токены | `npm run tokens:check` |
| 7 | Тексты — в `i18n/ru.ts`, `i18n/en.ts` | `npm run typecheck` (ключи совпадают) |
| 8 | Если нужна БД: модели с префиксом slug в `prisma/schema.prisma`, миграция, DAL в `games/<slug>/server/` с `import "server-only"` и проверкой `auth()` там, где требуется | `npm run typecheck`, ревью T3 |
| 9 | Описание игры `docs/games/<slug>.md` (по шаблону `docs/meta/templates/game_description.template.md`) | `npm run docs:links` |
| 10 | Проверка в браузере: 360/768/1280, RU/EN, клавиатура | строка `UI-check:` в отчёте |
| 11 | `npm run typecheck && npm run lint && npm run test && npm run build` | зелёные |

## §3 Правило `game-module-contract.mdc`

`globs: games/**`. Содержание (≤ 80 строк): структура папки игры; обязательные файлы; игра рендерится в `GameShell`; запрет самописных шапки/табло/модалки вопроса/экрана победы при наличии в kit; токены; i18n; импорт только `@/shared`; ссылки на контракты. Должно ссылаться на контракты, а не копировать их.

## §4 Холодный прогон (приёмка R03)

Агент в новой сессии, имея только `AGENTS.md` и `docs/adding-a-game.md`, создаёт временную игру `sandbox-demo` (простая игра «угадай число» с командами и табло):

- проходит шаги §2 без обращения к владельцу;
- все проверки зелёные;
- карточка появляется на `/`, `/sandbox-demo` открывается внутри `GameShell`;
- одновременно проверяется запись `coming-soon` (карточка «Скоро»);
- результат фиксируется в отчёте (`R03_tasks.md`, раздел Verification): время, сколько подсказок/правок документации потребовалось;
- временная игра **удаляется**, коммитится только правка документации, если прогон выявил пробелы.

## §5 Критерии приёмки

- [ ] `games/_template` собирается (`typecheck`, `lint`, `test`) после копирования и замены slug
- [ ] Холодный прогон выполнен и описан; пробелы инструкции устранены
- [ ] `listGames()` не содержит `template` и `sandbox-demo` после завершения
