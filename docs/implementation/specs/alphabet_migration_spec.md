# Спецификация миграции Alphabet в `games/alphabet`

**Тип:** Spec  
**Статус:** Draft (проверить против фактического дерева на старте R02 — Phase DoR audit)  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** [`repo_structure_contract.md`](../contracts/repo_structure_contract.md) §1–§3, [`game_manifest_contract.md`](../contracts/game_manifest_contract.md), [`game_routing_contract.md`](../contracts/game_routing_contract.md)  
**Используется в:** R02-CU2…CU7

---

## §1 Принципы миграции

1. **Перенос без изменения поведения.** Только `git mv` + правка импортов + минимальные склейки. Рефакторинг компонентов — в R03.
2. **Сохранять историю:** перенос файла — `git mv`, правка содержимого — в том же CU, но не смешивать с изменением логики.
3. **Сборка зелёная на каждом CU** (`typecheck`, `lint`, `build`; `test` — когда тесты есть).
4. **Имена таблиц БД и миграции не меняются.** Prisma schema остаётся в `prisma/`; владение моделями фиксируется в документации.
5. Всё, что не указано в таблицах §2, перед переносом классифицируется по [`repo_structure_contract.md`](../contracts/repo_structure_contract.md) §2; неясное — вопрос владельцу, не догадка.

## §2 Таблицы переноса

### §2.1 Сервер и авторизация → `server/` (R02-CU2)

| Было | Стало | Правки |
|------|-------|--------|
| `lib/db.ts` | `server/db/client.ts` | Импорты `@/lib/db` → `@/server/db/client` |
| `lib/auth.ts` | `server/auth/auth.ts` | `import "server-only"` сохранить |
| `lib/auth.config.ts` | `server/auth/auth.config.ts` | Без Prisma-импортов (инвариант) |
| `src/data/auth/verify-credentials.server.ts` | `server/auth/verify-credentials.server.ts` | |
| `types/next-auth.d.ts` | остаётся | Проверить, что `tsconfig` его видит |
| `proxy.ts` | остаётся в корне | Импорт `@/lib/auth.config` → `@/server/auth/auth.config` |
| `app/api/auth/[...nextauth]/route.ts` | остаётся | Обновить импорты |

### §2.2 Клиентский код игры → `games/alphabet/` (R02-CU3)

| Было | Стало | Примечание |
|------|-------|-----------|
| `App.tsx` + `components/GameApp.tsx` | `games/alphabet/components/GameApp.tsx` | Склеить: `GameApp` содержит содержимое `App.tsx`; Vite-вызовы убрать |
| `components/Card.tsx` … `components/VictoryScreen.tsx` (кроме перечисленных ниже) | `games/alphabet/components/*.tsx` | Все 18 компонентов игры переезжают как есть: `AIGenerator`, `Card`, `Confetti`, `CreditsGateOverlay`, `GameSettings`, `LevelSelectModal`, `LocaleSelector`, `OperatorGuide`, `PromptPage`, `QuestionEditor`, `QuestionLibrary`, `QuestionLibraryPage`, `QuestionModal`, `RulesPage`, `ScoreBoard`, `StepperInput`, `Timer`, `VictoryScreen` |
| `components/AuthSessionProvider.tsx` | `shared/providers/AuthSessionProvider.tsx` | Используется `app/layout.tsx` |
| `store.ts` | `games/alphabet/store.ts` | Включает локаль (до R03) |
| `types.ts` | `games/alphabet/types.ts` | Кроме `Locale` → `shared/domain/locale.ts` |
| `constants.ts` | делится на три файла (ниже) | |
| ↳ `ALPHABET_BY_LOCALE`, `*_ALPHABET`, `DEFAULT_SETTINGS`, `COLORS`, `SCORE_*` | `games/alphabet/constants.ts` | |
| ↳ `TRANSLATIONS` | `games/alphabet/i18n/translations.ts` | Все 5 локалей сохраняются как есть; в R03 делится на `ru.ts`/`en.ts` |
| ↳ `LOCALE_META` | `shared/i18n/locales.ts` | Вместе с `Locale`; поле `active: boolean` (`ru`, `en` — true) |
| `utils/audio.ts` | `games/alphabet/lib/audio.ts` | |
| `lib/utils.ts` (`cn`) | `shared/lib/cn.ts` | |
| `app/game/page.tsx` | `games/alphabet/page.tsx` | Становится `default`-экспортом `GamePageComponent`; содержимое без изменений |

### §2.3 Данные и серверный код игры (R02-CU4)

| Было | Стало |
|------|-------|
| `data/*.json`, `data/questions.ts`, `data/system_suites.ts` | `games/alphabet/data/` |
| `lib/demo-questions.ts` | `games/alphabet/data/demo-questions.ts` |
| `lib/validators/suite-import.ts` | `games/alphabet/validators/suite-import.ts` |
| `src/data/suites/get-suites.server.ts`, `import-suite.server.ts` | `games/alphabet/server/suites/` |
| `src/actions/admin/delete-suite.ts`, `import-suite.ts` | `games/alphabet/server/actions/` |
| `components/admin/*` | `app/admin/_components/` |
| `prisma/seed.ts`, `prisma/import-suites.ts` | остаются; пути к `data/` и валидаторам обновляются |
| `app/admin/**`, `app/api/admin/**`, `app/api/suites/route.ts` | остаются; импорты обновляются; проверки `auth()` не меняются |

### §2.4 Маршруты (R02-CU5)

| Было | Стало |
|------|-------|
| `app/page.tsx` (`redirect('/game')`) | каталог игр |
| `app/game/page.tsx` | удаляется (перенесён в §2.2) |
| — | `app/[game]/page.tsx`, `app/[game]/error.tsx`, `app/[game]/loading.tsx` |
| — | `games/alphabet/manifest.ts` (+ запись в `games/registry.ts`), `public/games/alphabet/cover.webp` |
| — | редирект `/game` → `/alphabet` в `next.config.ts` |

Манифест Alphabet (значения для R02):

| Поле | Значение |
|------|----------|
| `slug` | `alphabet` |
| `title` | ru: «Алфавит», en: «Alphabet» |
| `tagline` | ru: «Найди пары букв и ответь на библейский вопрос», en: «Match letter pairs and answer a Bible question» |
| `description` | ru/en — 1–2 предложения из `docs/GAME_DESCRIPTION.md` |
| `status` | `active` |
| `tags` | `memory`, `quiz`, `team`, `youth` |
| `teams` | `{ min: 2, max: 6 }` (уточнить по `GameSettings`/`DEFAULT_SETTINGS`) |
| `cover` | `/games/alphabet/cover.webp` (в R02 — временный файл; настоящая обложка — R03, по согласованию с владельцем) |
| `order` | `10` |

### §2.5 Очистка (R02-CU6)

| Файл | Действие |
|------|----------|
| `index.tsx`, `index.html`, `vite.config.ts`, `metadata.json`, `App.tsx` | Удалить после проверки, что на них нет ссылок (`rg`) |
| `SPECIFICATION.md` | → `docs/archive/SPECIFICATION.md` |
| `README.md` | Переписывается в R01-CU8; в R02 только проверить актуальность ссылок |
| `tsconfig.json` | убрать `vite.config.ts` из `exclude`, если он удалён |
| `package.json` | убрать `babel-plugin-react-compiler`/Vite-зависимости, **только** если не используются (`rg`); остальные не трогать |

### §2.6 Документы (R02-CU7)

| Было | Стало |
|------|-------|
| `docs/OVERVIEW.md`, `docs/GAME_DESCRIPTION.md` | → `docs/games/alphabet.md` (объединить); в старых местах — заглушки-ссылки на 1 релиз |
| `docs/AI_SYSTEM.md`, `docs/UI_COMPONENTS.md`, `docs/STATE_MANAGEMENT.md` | → `docs/games/alphabet/` |
| `docs/architecture/database_schema.md` | создаётся из `prisma/schema.prisma` (канон схемы, владельцы моделей) |

## §3 Что НЕ делать в R02

- Не менять поведение игры и текст интерфейса.
- Не обобщать компоненты в `shared/game-kit` (это R03).
- Не менять схему БД и не создавать миграции.
- Не переименовывать маршруты `/admin/**`, `/api/**`.
- Не вводить cookie-локаль (R03).

## §4 Проверка (после каждого CU)

```bash
npm run typecheck && npm run lint && npm run test && npm run build
rg "from '@/(components|lib|src|utils|types)(/|')" app games shared server --glob '!types/**'   # пусто к концу R02-CU6
rg "from '(\.\./)+(store|types|constants)'" games shared                                          # пусто
```

Ручной smoke Alphabet (R02-CU5, R02-CU7): запуск игры с вопросами → переворот карточек → совпавшая пара → бонусный вопрос (ответить верно и неверно) → ход следующей команды → завершение → экран победы → «играть снова»; режим без вопросов; админка: вход, список наборов, импорт JSON, удаление.
