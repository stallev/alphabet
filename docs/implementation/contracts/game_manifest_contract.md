# Контракт манифеста игры и реестра

**Тип:** Contract  
**Статус:** Draft  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** [`repo_structure_contract.md`](repo_structure_contract.md) §1, §3; решения D2, D4, D5  
**Используется в:** R02-CU1, R02-CU5, R03-CU6, R03-CU7

---

## §1 Типы

Файл: `shared/game-kit/manifest.ts` (создаётся в R02-CU1; в R02 лежит только этот файл, остальной `game-kit` — в R03).

```ts
import type { ReactNode } from 'react';
import type { Locale } from '@/shared/domain/locale';

export type ActiveLocale = 'ru' | 'en';
export type LocalizedText = Record<ActiveLocale, string>;

export const GAME_TAGS = ['memory', 'quiz', 'team', 'party', 'solo', 'kids', 'youth'] as const;
export type GameTag = (typeof GAME_TAGS)[number];

export type GameStatus = 'active' | 'coming-soon';

export interface GameManifest {
  slug: string;                      // §2
  title: LocalizedText;              // ≤ 40 символов
  tagline: LocalizedText;            // ≤ 80 символов, одна строка на карточке
  description: LocalizedText;        // ≤ 400 символов, для SEO и страницы «скоро»
  status: GameStatus;
  tags: readonly GameTag[];          // 1–4 тега
  teams: { min: number; max: number };
  minAge?: number;
  durationMinutes?: { min: number; max: number };
  cover: string;                     // '/games/<slug>/cover.webp'; обязательна для status 'active'
  order: number;                     // сортировка на главной, по возрастанию
}

export interface GamePageProps {
  locale: Locale;
}

/** Серверная точка входа игры: сама загружает данные и рендерит <GameShell>. */
export type GamePageComponent = (props: GamePageProps) => ReactNode | Promise<ReactNode>;

export interface GameEntry {
  manifest: GameManifest;
  /** Только для status 'active'. Динамический импорт — код неактивной игры не попадает в бандл других игр. */
  loadPage?: () => Promise<{ default: GamePageComponent }>;
}

export function defineGame(entry: GameEntry): GameEntry; // возвращает entry без изменений; нужна для типизации
```

## §2 Правила slug

- Формат: `/^[a-z][a-z0-9-]{1,31}$/`
- Совпадает с именем папки `games/<slug>/`
- Уникален в реестре
- Не входит в `RESERVED_SLUGS` (`games/reserved-slugs.ts`):

```
admin, api, about, login, logout, games, privacy, terms, contact, settings,
sitemap, robots, play, new, static, public, assets, dev, _next
```

Список расширяется без ADR, но только добавлением; удаление — через ADR.

## §3 Реестр

Файл: `games/registry.ts`.

```ts
export const GAME_ENTRIES: readonly GameEntry[];   // ручной список импортов манифестов
export function listGames(): GameManifest[];       // отсортирован по order, затем slug
export function getGameEntry(slug: string): GameEntry | undefined;
export function assertValidRegistry(entries: readonly GameEntry[]): void; // бросает Error с понятным текстом
```

`assertValidRegistry` вызывается:

1. в модульном тесте `games/registry.test.ts` на реальном реестре;
2. при старте — в `generateStaticParams` страницы `app/[game]/page.tsx` (ошибка ломает сборку).

### §3.1 Что проверяется

| Условие | Ошибка |
|---------|--------|
| slug не соответствует формату | `invalid slug "<slug>"` |
| slug в `RESERVED_SLUGS` | `reserved slug "<slug>"` |
| дубликат slug | `duplicate slug "<slug>"` |
| `status === 'active'` и нет `loadPage` | `active game "<slug>" has no loadPage` |
| `status === 'coming-soon'` и есть `loadPage` | `coming-soon game "<slug>" must not have loadPage` |
| пустой или превышающий лимит текст в любой локали | `manifest "<slug>": <field>.<locale> …` |
| `tags` пуст или > 4, неизвестный тег | `manifest "<slug>": tags …` |
| `teams.min < 1` или `min > max` | `manifest "<slug>": teams …` |
| `active` без `cover` | `active game "<slug>" has no cover` |

### §3.2 Регистрация игры

1. Создать `games/<slug>/manifest.ts` с `export default defineGame({...})` — манифест и `loadPage: () => import('./page')` в одном файле.
2. Добавить `import <name> from './<slug>/manifest'` и элемент в `GAME_ENTRIES` — **единственная правка за пределами папки игры** (плюс `public/games/<slug>/`).
3. `npm run test` (проверка реестра) и `npm run lint` зелёные.

## §4 Тесты (обязательны, фикстуры без реальных игр)

`shared/game-kit/manifest.test.ts` и `games/registry.test.ts`: валидная запись; каждая строка таблицы §3.1 даёт ожидаемую ошибку; сортировка `listGames()`; зарезервированные slug'и.

## §5 Критерии соответствия

- [ ] Файлы и сигнатуры соответствуют §1, §3
- [ ] Все строки §3.1 покрыты тестами
- [ ] Реальный реестр проходит `assertValidRegistry`
