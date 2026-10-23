# UI copy and messages

Весь пользовательский текст живёт в словарях **`shared/i18n`** (портал и game-kit) и **`games/<slug>/i18n`** (тексты игры). Ключи — **английские идентификаторы**; значения — по локали `ru` | `en`.

**Контракт:** [`i18n_contract.md`](../../implementation/contracts/i18n_contract.md)  
**Правила:** `ui-messages-and-copy.mdc`, `ui-messages-bundle-splitting.mdc`

## Структура

| Пространство | Путь | Примеры namespace |
|--------------|------|-------------------|
| Портал + kit | `shared/i18n/dictionaries/{ru,en}.ts` | `site`, `nav`, `catalog`, `gameKit`, `errors` |
| Игра | `games/<slug>/i18n/{ru,en}.ts` | правила, UI игры, ошибки валидации |

- `ru.ts` — эталон (`as const`); `en.ts` — тот же набор ключей (`DeepStringRecord<typeof ru>`).
- Коды ошибок и enum-значения — константы в `shared/domain`, не строки в компонентах.
- Плейсхолдеры `{name}`; форматирование дат/денег — `shared/i18n/format.ts` с явной локалью.

## Импорт

| Контекст | Паттерн |
|----------|---------|
| Server Component / Action | `getLocale()` + `getDictionary()` или словарь игры с сервера |
| Client | `useT()` / `useGameT()` из провайдеров layout; без импорта полных словарей в клиентский бандл |
| Смена языка | Server Action `setLocale` + `router.refresh()` |

Новые ключи добавлять **в обе** локали в одном изменении. Нет дублирования одной и той же фразы в DAL, actions и JSX.
