# Контракт интернационализации (RU/EN)

**Тип:** Contract  
**Статус:** Draft  
**Версия:** 1.0  
**Дата:** 2026-10-22  
**Зависит от:** решение D6; текущий подход — [`i18n-approach.md`](../../architecture/i18n-approach.md) (обновляется в R03-CU8)  
**Используется в:** R02-CU3 (типы и каркас), R03-CU2…CU8

---

## §1 Принципы

1. Активные локали: **`ru`** (по умолчанию) и **`en`**. Локали `uk`, `de`, `ro`, которые есть в текущем коде Alphabet, остаются в данных, но **выключены**: не показываются в переключателе и не принимаются cookie.
2. URL не содержит локали (красивые URL: `/alphabet`). Локаль хранится в cookie `locale` (`ru` | `en`, `Path=/`, `SameSite=Lax`, срок 1 год) и читается на сервере.
3. Первый визит: локаль берётся из `Accept-Language` (если начинается с `ru` → `ru`, иначе `en`) и записывается в cookie при первом переключении (при первом заходе cookie не ставится, чтобы не мешать кэшу).
4. В коде нет строк интерфейса вне словарей.
5. Последствие для SEO: оба языка живут на одном URL (hreflang не применим). Допустимо, пока `SITE.indexable === false`; при открытии индексации — пересмотр отдельным ADR.

## §2 Словари

| Пространство | Путь | Содержимое |
|--------------|------|------------|
| Портал + game-kit | `shared/i18n/dictionaries/{ru,en}.ts` | `site`, `nav`, `catalog`, `gameKit.*` (кнопки kit, подписи диалогов), `errors` |
| Игра | `games/<slug>/i18n/{ru,en}.ts` | все тексты игры |

- `ru.ts` — эталон: `export const ru = { … } as const`; `en.ts` обязан иметь **тот же набор ключей**: `export const en: Dictionary = { … }` где `type Dictionary = DeepStringRecord<typeof ru>` (`DeepStringRecord` заменяет литералы значений на `string`).
- Плейсхолдеры в строках — `{name}`; подстановка — функция `format(template, values)` из `shared/i18n/format.ts` (с тестом).
- Ключи: `camelCase`, вложенность ≤ 3 уровней.
- Множественное число: через `Intl.PluralRules(locale)` и ключи вида `teams: { one: '…', few: '…', many: '…', other: '…' }` — функция `plural(locale, forms, n)` в `shared/i18n/plural.ts` (с тестом, включая русские формы 1/2/5/11/21).

## §3 API (`shared/i18n`)

```ts
export const ACTIVE_LOCALES = ['ru', 'en'] as const;
export const DEFAULT_LOCALE: Locale = 'ru';
export const LOCALE_COOKIE = 'locale';

// server
export async function getLocale(): Promise<Locale>;               // cookie → Accept-Language → DEFAULT_LOCALE
export async function getDictionary(): Promise<Dictionary>;       // портал + kit на текущей локали

// client
export function I18nProvider(props: { locale: Locale; dictionary: Dictionary; children: ReactNode }): ReactNode;
export function useLocale(): Locale;
export function useT(): Dictionary;                                // словарь портала + kit

// игра
export function GameI18nProvider<T>(props: { value: T; children: ReactNode }): ReactNode;
export function useGameT<T>(): T;                                  // словарь игры; типизируется в games/<slug>/i18n/use-game-t.ts

// переключение
export async function setLocale(locale: Locale): Promise<void>;    // Server Action: валидирует по ACTIVE_LOCALES, ставит cookie, revalidatePath('/', 'layout')
export function LocaleSwitcher(): ReactNode;                       // RU | EN, кнопки-переключатель
```

- `app/layout.tsx` читает `getLocale()` → `<html lang={locale}>` и оборачивает приложение в `I18nProvider`.
- `games/<slug>/page.tsx` загружает словарь игры для `locale` и оборачивает контент в `GameI18nProvider`.
- Клиентский переключатель вызывает `setLocale` (Server Action) через `useTransition`; страница перерисовывается без полной перезагрузки.
- Состояние «локаль в Zustand + localStorage» удаляется (R03-CU5).

## §4 Данные игры и локаль

Языковая принадлежность данных игры (например, наборы вопросов с `language`) — забота игры: она получает `locale` из props и фильтрует свои данные. Если данных на выбранной локали нет — показывает данные локали `ru` и сообщение из словаря.

## §5 Критерии соответствия

- [ ] `en.ts` и `ru.ts` проходят проверку типов (пропущенный ключ — ошибка `typecheck`)
- [ ] `rg "[А-Яа-яЁё]" shared games app --glob '!**/i18n/**' --glob '!**/*.test.*' --glob '!data/**'` пуст (нет кириллицы вне словарей и данных)
- [ ] Переключение RU↔EN меняет `<html lang>`, тексты портала и Alphabet; cookie `locale` выставлена
- [ ] Недопустимое значение cookie (`de`) игнорируется → `DEFAULT_LOCALE`
