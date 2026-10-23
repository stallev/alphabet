# EdenGames

Портал браузерных командных христианских игр. Первая игра — **«Алфавит»**: механика Memory (пары букв) и бонусная викторина с наборами вопросов и AI-генерацией.

Стек: Next.js 16 (App Router), Neon PostgreSQL, Prisma, Auth.js, Tailwind CSS v4.

## Быстрый старт

**Требования:** Node.js `>=22 <26` (см. `engines` в `package.json`).

```bash
npm ci
cp .env.local.example .env.local   # заполните DATABASE_URL, DIRECT_URL, AUTH_SECRET, AUTH_URL
npm run dev
```

Приложение: [http://localhost:3000](http://localhost:3000).

## Основные скрипты

| Команда | Назначение |
|---------|------------|
| `npm run dev` | Dev-сервер (Turbopack) |
| `npm run build` / `start` | Production-сборка и запуск |
| `npm run lint` / `typecheck` / `test` | Качество кода |
| `npm run db:migrate` / `db:seed` | Prisma и начальные данные |
| `npm run docs:links` / `encoding:check` / `deps:check` | Проверки документации и зависимостей |
| `npm run phase:run` | Драйвер прогона фаз (см. `docs/prompts/`) |

## Документация

- Инструкции для AI-агентов: [`AGENTS.md`](AGENTS.md)
- Документация проекта: [`docs/`](docs/)
- Фазы реализации: [`docs/implementation/phases/`](docs/implementation/phases/)
