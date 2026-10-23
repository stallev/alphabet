# Контракт pre-commit гейта сборки

**Тип:** Contract  
**Статус:** Canonical (скрипты написаны и проверены тестами 2026-10-23; подключение hook — R01-T5)  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Реализация:** [`scripts/precommit-build-check.mjs`](../../../scripts/precommit-build-check.mjs), [`scripts/check-build-isolation.mjs`](../../../scripts/check-build-isolation.mjs); тесты — `scripts/precommit-build-check.test.mjs`, `scripts/check-build-isolation.test.mjs`  
**Смежные контракты:** [`cu_boundary_scripts_contract.md`](cu_boundary_scripts_contract.md), [`phase_driver_contract.md`](phase_driver_contract.md)  
**Источник:** `docs/examples/ai_first_tmp/scripts/precommit-build-check.mjs` (адаптация под одно приложение; `check-build-isolation.mjs` в шаблоне отсутствует — написан по описанию из его заголовка)

---

## §1 Назначение

Коммит, который затрагивает код или конфигурацию сборки, не должен оставлять production-сборку красной (иначе упадёт Vercel). Это **последний детерминированный гейт**; сессия агента не повторяет его (в прогоне фазы production build не запускается).

Гейт срабатывает только когда в индексе есть релевантные файлы — коммиты документации остаются мгновенными.

## §2 `precommit-build-check.mjs`

### §2.1 Какие файлы запускают гейт

`AFFECTS_BUILD` (экспортируется, тестируется), пути в формате git (разделители `/`, Windows-`\` нормализуются):

| Группа | Шаблон |
|--------|--------|
| Код и ресурсы | `^(app\|games\|shared\|server\|prisma\|public\|types)/.+\.(ts\|tsx\|mts\|js\|jsx\|mjs\|json\|css\|prisma\|sql\|webp\|png\|jpg\|svg)$` |
| Корневые конфигурации | `proxy`, `next.config`, `prisma.config`, `eslint.config`, `vitest.config`, `postcss.config`, `commitlint.config` с расширением `.ts\|.mjs\|.js` |
| Пакеты и TS | `package.json`, `package-lock.json`, `tsconfig*.json`, `.npmrc` |
| Сам гейт | `scripts/check-build-isolation.mjs` |

Не запускают гейт: `docs/**`, `.cursor/**`, `scripts/**` (кроме указанного), `.github/**`, `*.md`, `.husky/**`.

### §2.2 Шаги (последовательно, остановка на первом сбое)

| # | Метка | Команда |
|---|-------|---------|
| 1 | `build isolation` | `node scripts/check-build-isolation.mjs` |
| 2 | `typecheck` | `npm run typecheck` |
| 3 | `production build` | `npm run build` |

Вывод шагов идёт в stdout/stderr hook (`stdio: inherit`); при сбое: `precommit-build-check: "<метка>" failed …`, код выхода шага. Успех: `precommit-build-check: OK`. Нет релевантных файлов: `… skipped`, код 0.

### §2.3 Окружение сборки

`npm ci` и `npm install` запускают `postinstall` (`prisma generate`) и создают gitignore-клиент в `generated/` до `typecheck`. `npm run build` по-прежнему `prisma generate && next build`. `prisma.config.ts` требует `DIRECT_URL` (через `env()`), приложение при сборке — переменные из `.env.local`. Следствия:

- локально гейт работает при заполненном `.env.local`; отсутствие переменных = сбой шага `production build` (не «обход» гейта);
- в CI задаются фиктивные значения `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL` (R01-T6); реальные секреты в CI-файле не хранятся.

### §2.4 Запреты

- `git commit --no-verify` не используется ни агентом, ни скриптами (`cu-commit` отклоняет аргумент).
- Гейт не изменяет файлы (никаких автоисправлений).

## §3 `check-build-isolation.mjs`

Production-код не должен зависеть от тестового инструментария и тестовых файлов.

### §3.1 Область

Сканируются `app/`, `games/`, `shared/`, `server/` и `proxy.ts` (расширения `.ts .tsx .mts .js .jsx .mjs`). Пропускаются каталоги `node_modules`, `.next`, `generated`, `lint-fixtures`. **Сами тестовые файлы** (`*.test.*`, `*.spec.*`, `__tests__/`) не проверяются — им тестовый инструментарий разрешён.

### §3.2 Нарушения

| Нарушение | Пример |
|-----------|--------|
| Тестовый пакет в production-файле | `vitest`, `@vitest/*`, `@testing-library/*`, `jsdom`, `happy-dom`, `playwright`, `@playwright/*` |
| Импорт тестового файла из production-файла | `./x.test`, `@/games/a/logic/y.spec` |

Распознаются статические `import … from`, побочные `import 'x'`, `export … from`, динамический `import('x')` и `require('x')`.

### §3.3 Вывод

Нарушений нет: `check-build-isolation: OK (<n> files)`, код 0. Иначе: список `<файл>: <спецификатор> (<причина>)` в stderr, код 1.

## §4 Подключение (задача R01-T5)

`.husky/pre-commit`:

```sh
npx --no -- lint-staged
node scripts/precommit-build-check.mjs
```

`.husky/commit-msg`: `npx --no -- commitlint --edit "$1"`. В `package.json`: скрипт `build:check` → `node scripts/precommit-build-check.mjs` (ручной запуск). На Vercel и в CI hook отключён (`HUSKY=0` или безопасный `prepare`); те же проверки выполняет `ci.yml`.

## §5 Согласование с остальными гейтами

| Гейт | Когда | Что проверяет |
|------|-------|---------------|
| `cu-verify` | В сессии CU, до stage | lint, проверки репозитория, тесты; `--full` + typecheck |
| pre-commit (этот контракт) | При каждом коммите с кодом | isolation, typecheck, production build |
| CI (`ci.yml`) | push / PR | всё вышеперечисленное + `docs:links` и пр. |

Дублирования нет по замыслу: сессия агента не запускает production build; hook не запускает тесты.

## §6 Критерии соответствия

- [ ] `npm run test` зелёный, включая оба тестовых файла гейта
- [ ] Коммит только документации не запускает typecheck/build (`skipped`)
- [ ] Коммит с изменением `app/**` запускает три шага; намеренно добавленный `import 'vitest'` в `shared/ui/Button.tsx` ломает шаг `build isolation`
- [ ] `.husky/pre-commit` вызывает `lint-staged` и затем гейт
- [ ] В репозитории нет скриптов, использующих `--no-verify`
