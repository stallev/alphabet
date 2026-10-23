# Testing — lean profile

**Профиль:** [`project_quality_profile.md`](../../meta/project_quality_profile.md) D4–D7  
**Раннер:** Vitest (`npm run test`) · конфиг `vitest.config.mjs`  
**Правило:** `testing.mdc`

## Обязательное покрытие (Vitest)

| Область | Примеры |
|---------|---------|
| Логика игр | `games/*/logic/**/*.test.ts` |
| Реестр игр | `games/registry.test.ts` (после R02) |
| Валидаторы | `lib/validators/**/*.test.ts` |
| Скрипты драйвера | `scripts/*.test.mjs` |

UI-компоненты и E2E на MVP **не обязательны**; регрессии UI — строка `UI:` + [`ai_ui_verification.md`](./ai_ui_verification.md).

## Практика

- Тестировать поведение и граничные случаи, не снимки разметки.
- Фикстуры рядом с тестом или в `__fixtures__`; без секретов и `.env`.
- Перед коммитом CU: `node scripts/cu-verify.mjs` (lint, deps, encoding, tokens, test).

## CI

`.github/workflows/ci.yml` — `npm ci`, typecheck, lint, test, docs:links, encoding, deps, build (с фиктивными env для Auth/DB).

Playwright и seed-учётки — post-MVP / отдельные фазы; `ai_dev_accounts_and_seed.md` не переносится.
