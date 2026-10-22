# R02 — Перестройка репозитория и перенос Alphabet

**Тип:** Phase description  
**Статус:** Draft — **требует Phase DoR audit против фактического состояния репозитория после R01** (D14)  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** R01 завершена; [`repo_structure_contract.md`](../contracts/repo_structure_contract.md), [`game_manifest_contract.md`](../contracts/game_manifest_contract.md), [`game_routing_contract.md`](../contracts/game_routing_contract.md), [`alphabet_migration_spec.md`](../specs/alphabet_migration_spec.md)  
**Задачи:** [`R02_tasks.md`](R02_tasks.md)  
**Предыдущая / следующая:** [`R01`](R01_phase_description.md) / [`R03`](R03_phase_description.md)

---

## Цель

Структура репозитория соответствует ADR-003 и [`repo_structure_contract.md`](../contracts/repo_structure_contract.md): серверный код — в `server/`, общее — в `shared/`, игра Alphabet — в `games/alphabet/`, подключена через реестр; игра доступна по `/alphabet`; старый адрес `/game` перенаправляет; границы импортов проверяет линтер. **Поведение игры и админки не меняется.**

## Scope

1. Каркас `games/`, `shared/`, `server/`; тип `GameManifest`, `defineGame`, `games/registry.ts`, `reserved-slugs.ts` с тестами ([`game_manifest_contract.md`](../contracts/game_manifest_contract.md)).
2. Правило границ импортов: ESLint-конфиг (программно по `games/*`), правило `import-boundaries.mdc`, тест нарушителя.
3. Перенос серверного кода (`auth`, `db`, DAL, actions) по [`alphabet_migration_spec.md` §2.1, §2.3](../specs/alphabet_migration_spec.md).
4. Перенос клиентского кода, данных, констант, store игры в `games/alphabet/` (§2.2–§2.3).
5. Маршрутизация `/`, `/[game]`, редирект `/game` ([`game_routing_contract.md`](../contracts/game_routing_contract.md)); минимальный каталог на `/`.
6. Удаление остатков Vite, перенос устаревших файлов в архив (§2.5).
7. Документация: `docs/games/alphabet*`, `database_schema.md`, обновление `AGENTS.md`, правило `import-boundaries.mdc`.
8. Тесты логики Alphabet: выделение чистых функций (колода, подсчёт очков) — **только** если они уже существуют в `store.ts` в чистом виде; иначе тест на текущую функцию-обёртку; рефакторинг логики не входит в фазу.

## Out of scope

- UI-кит (`shared/ui`, `shared/game-kit`), токены, `GameShell`, полноценная главная — R03.
- Cookie-локаль, `LocaleSwitcher`, словари портала — R03 (в R02 локаль остаётся в Zustand/localStorage).
- Изменения схемы БД, миграции Prisma.
- Изменение URL админки и API.
- Рефакторинг компонентов Alphabet, перевод на токены.

## Входные условия

- [ ] R01 завершена: все Phase DoD отмечены; `npm run docs:links && npm run typecheck && npm run lint && npm run test && npm run build` зелёные на `master` (или ветке R01, влитой владельцем)
- [ ] Phase DoR audit R02 закрыт: `alphabet_migration_spec.md` §2 сверена с **фактическим** деревом (`git ls-files`), расхождения исправлены в спецификации
- [ ] Ветка `R02-restructure` создана от обновлённой основной ветки
- [ ] Подключена dev-БД: `DATABASE_URL`, `AUTH_SECRET`, учётка `admin` (для smoke админки) — значения в `.env.local`, не в репозитории

## Принятые решения для фазы

| Вопрос | Решение |
|--------|---------|
| Порядок CU | Каркас → сервер → клиент игры → данные/серверный код игры → роутинг → очистка → документы. Каждый CU завершается зелёным `typecheck`, `lint`, `test`, `build` |
| Алиасы | Остаётся `@/*` → корень. Новых алиасов нет |
| Смешанные файлы | `types.ts`, `constants.ts` делятся по [`alphabet_migration_spec.md` §2.2](../specs/alphabet_migration_spec.md) |
| Локаль в R02 | Тип `Locale` и `LOCALE_META` переезжают в `shared/`, логика хранения не меняется |
| Review | `reviewer` — для CU с `auth`/`api`/`proxy` (T3) и CU4 (импорты в `app/api/**`); остальные — `diff-only` (профиль `lean`) |
| Smoke | `R02-CU5` — `Smoke: blocking`: драйвер останавливается, владелец проверяет игру руками; остальные — `none`/`deferred` |
| Обложка | В R02 — временная картинка `public/games/alphabet/cover.webp` (сгенерировать однотонную 16:9 ≤ 20 КБ); настоящая — R03 по согласованию |
| `robots` | Остаётся `noindex, nofollow` (как сейчас) |

## Phase DoD

- [ ] Все CU закоммичены; у каждого trace `Review: …`
- [ ] `npm run typecheck`, `lint`, `test`, `build`, `docs:links`, `encoding:check`, `deps:check` — зелёные
- [ ] Дерево соответствует [`repo_structure_contract.md`](../contracts/repo_structure_contract.md) §6 (все четыре пункта)
- [ ] Ручной smoke Alphabet по [`alphabet_migration_spec.md` §4](../specs/alphabet_migration_spec.md) пройден владельцем (строка `Smoke: blocking` в CU5 снята) и повторён после CU7
- [ ] `/` показывает карточку Alphabet; `/alphabet` играбелен; `/game` → `/alphabet` (308); `/nonexistent` → 404; `/admin` без сессии → `/admin/login`
- [ ] Админка: вход, список, импорт JSON, удаление набора, AI-генерация работают
- [ ] Нарушение границ импортов даёт ошибку линтера (тест-фикстура зелёная)
- [ ] `AGENTS.md` и `.cursor/rules/README.md` отражают фактическую структуру; правило `import-boundaries.mdc` в манифесте
- [ ] В корне нет `App.tsx`, `index.tsx`, `index.html`, `vite.config.ts`, `metadata.json`, `store.ts`, `types.ts`, `constants.ts`, `components/`, `lib/`, `src/`, `utils/`, `data/`

## Риски

| Риск | Смягчение |
|------|-----------|
| Массовый перенос ломает импорты | `git mv` + правка импортов в том же CU; сборка зелёная на каждом CU; проверки `rg` из спецификации §4 |
| Потеря поведения Alphabet | Ручной smoke дважды (CU5 blocking, CU7); перенос без рефакторинга |
| Конфликт статических сегментов и `[game]` | Статические `admin`/`api` приоритетнее; slug'и зарезервированы и проверены тестом |
| Ломается доступ к админке/API | `auth`-код меняется только импортами; T3-CU с `reviewer` и ручной проверкой `403`/редиректа |
| Prisma `generated/` и скрипты `seed`/`import-suites` теряют пути | CU4 обновляет пути; проверка `npm run db:seed` на dev-БД (не на production) |
| Устаревшая спецификация переноса | Phase DoR audit в начале фазы (см. входные условия) |

## Связанные документы

| Документ | Роль |
|----------|------|
| [`alphabet_migration_spec.md`](../specs/alphabet_migration_spec.md) | Таблицы переноса |
| [`repo_structure_contract.md`](../contracts/repo_structure_contract.md) | Целевая структура и границы |
| [`game_manifest_contract.md`](../contracts/game_manifest_contract.md), [`game_routing_contract.md`](../contracts/game_routing_contract.md) | Реестр и маршруты |
| [`R02_tasks.md`](R02_tasks.md) | Задачи и CU |
