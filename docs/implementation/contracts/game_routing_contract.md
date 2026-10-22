# Контракт маршрутизации игр

**Тип:** Contract  
**Статус:** Draft  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** [`game_manifest_contract.md`](game_manifest_contract.md); решения D4, D5  
**Используется в:** R02-CU5, R03-CU6

---

## §1 Таблица маршрутов

| URL | Назначение | Файл | Поведение |
|-----|-----------|------|-----------|
| `/` | Каталог игр | `app/page.tsx` | Сетка карточек из `listGames()` (R02: минимальная; R03: [`portal_home_spec.md`](../specs/portal_home_spec.md)) |
| `/<slug>` | Игра (`active`) | `app/[game]/page.tsx` | Рендерит `await entry.loadPage()` → `default({ locale })` |
| `/<slug>` | Заглушка (`coming-soon`) | то же | Страница «Скоро» с данными манифеста (R03); в R02 — `notFound()` |
| `/<unknown>` | 404 | то же | `dynamicParams = false` → `notFound()` |
| `/game` | Старый адрес | `next.config.ts` | Постоянный редирект (308) на `/alphabet` |
| `/admin/**` | Админка | без изменений | Доступ — `role === 'admin'` (`proxy.ts`) |
| `/api/**` | Route Handlers | без изменений | `/api/admin/**` — только admin |

Вложенных маршрутов у игры нет: экраны игры (лобби, правила, библиотека вопросов) — состояние внутри `GameShell`. Если игре понадобятся вложенные URL, это решается отдельным ADR (`app/[game]/[...rest]`).

## §2 Поведение `app/[game]/page.tsx`

```ts
export const dynamicParams = false;

export function generateStaticParams(): { game: string }[];  // slug всех записей реестра; вызывает assertValidRegistry
export async function generateMetadata({ params }): Promise<Metadata>;
export default async function GamePage({ params }): Promise<ReactNode>;
```

- URL регистрозависим: `/Alphabet` → 404 (slug не приводится к нижнему регистру).
- Локаль берётся из cookie (`getLocale()`, см. [`i18n_contract.md`](i18n_contract.md)); до появления R03 — `'ru'` по умолчанию.
- Данные игры (вопросы, настройки) загружает **сама игра** в `page.tsx` (серверный компонент, `await connection()` если данные динамические).
- `generateMetadata`: `title` = `manifest.title[locale]` + ` — ` + `SITE.name`; `description` = `manifest.description[locale]`; `robots` берётся из `SITE.indexable` (по умолчанию `noindex, nofollow` — как сейчас; смена — решение владельца в R03).
- Ошибка внутри игры → `app/[game]/error.tsx` (общая) с кнопкой «Повторить» и ссылкой на каталог.
- `app/[game]/loading.tsx` — скелет `GameShell` (R03; в R02 — простой текст).

## §3 Конфликты имён

`app/admin`, `app/api` — статические сегменты и всегда приоритетнее `[game]`. Любой другой системный верхнеуровневый маршрут добавляется **вместе с** slug'ом в `RESERVED_SLUGS`, в том же коммите.

## §4 Тесты

- Unit: `generateStaticParams()` возвращает ровно slug'и реестра.
- Ручной smoke (R02-CU5, `Smoke: blocking`): `/` → карточка Alphabet → `/alphabet` играбелен; `/game` → `/alphabet`; `/nonexistent` → 404; `/admin` без сессии → редирект на `/admin/login`.

## §5 Критерии соответствия

- [ ] Все строки §1 работают как описано
- [ ] Неизвестный slug и регистр дают 404
- [ ] Добавление записи в реестр без правок в `app/` делает игру доступной
