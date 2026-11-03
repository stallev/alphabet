# Добавить игру в Circle

Пошаговый чек-лист для новой игры каталога. Спецификация: [`docs/implementation/specs/adding_a_game_spec.md`](implementation/specs/adding_a_game_spec.md). Шаблон: [`games/_template/`](../games/_template/).

## Перед началом

- Slug: `/^[a-z][a-z0-9-]{1,31}$/`, не из [`games/reserved-slugs.ts`](../games/reserved-slugs.ts).
- Контракты: [`game_manifest_contract.md`](implementation/contracts/game_manifest_contract.md), [`game_kit_contract.md`](implementation/contracts/game_kit_contract.md), [`i18n_contract.md`](implementation/contracts/i18n_contract.md).

## Чек-лист

| # | Шаг | Проверка |
|---|-----|----------|
| 1 | Выбрать slug | `npm run test` — реестр и `RESERVED_SLUGS` |
| 2 | Скопировать шаблон: PowerShell `Copy-Item -Recurse games/_template games/<slug>`; заменить slug и `TEMPLATE_MANIFEST` в `manifest-data.ts`, пути `@/games/_template` → `@/games/<slug>` | `rg template games/<slug>` без совпадений (нижний регистр) |
| 3 | Заполнить `manifest.ts`: RU/EN тексты, `tile.glyph` (1–2 символа), `tile.tone` 1–5, `status: 'active'`, `loadPage: () => import('./page')` | `assertValidRegistry` в тестах |
| 4 | Зарегистрировать в [`games/registry.ts`](../games/registry.ts) | карточка на `/` |
| 5 | Логика в `logic/` + `*.test.ts` | `npm run test` |
| 6 | UI только из `@/shared/game-kit` и `@/shared/ui`; без сырых цветов | `npm run tokens:check` |
| 7 | Тексты в `i18n/ru.ts` и `i18n/en.ts` (одинаковые ключи) | `npm run typecheck` |
| 8 | БД (если нужна): модели с префиксом slug, DAL в `games/<slug>/server/` с `import "server-only"` | ревью T3 |
| 9 | Описание `docs/games/<slug>.md` по [`docs/meta/templates/game_description.template.md`](meta/templates/game_description.template.md) | `npm run docs:links` |
| 10 | Браузер: 360 / 768 / 1280 px, RU и EN, клавиатура | строка `UI-check:` в отчёте |
| 11 | `npm run typecheck && npm run lint && npm run test && npm run build` | все зелёные |

## Структура папки

См. [`repo_structure_contract.md`](implementation/contracts/repo_structure_contract.md) §1 и состав шаблона в spec §1.

## Правило для агентов

Cursor rule: [`.cursor/rules/game-module-contract.mdc`](../.cursor/rules/game-module-contract.mdc) (`globs: games/**`).
