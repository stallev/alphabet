# ADR-004 — Маршрутизация игр и реестр

**Тип:** ADR  
**Статус:** Accepted  
**Версия:** 1.0  
**Дата:** 2026-10-23  
**Зависит от:** [`repo_restructure_plan.md`](../meta/repo_restructure_plan.md) §0 D4–D5; ADR-003  
**Затрагивает:** [`game_routing_contract.md`](../implementation/contracts/game_routing_contract.md), [`game_manifest_contract.md`](../implementation/contracts/game_manifest_contract.md)

---

## Context

Игры должны открываться по коротким URL без префикса `/games`. Системные маршруты (`admin`, `api`, статика Next.js) конкурируют за корневой сегмент. Правила игры показываются внутри `GameShell`, не отдельным маршрутом.

---

## Decision

1. **Каталог** — `/` (`app/page.tsx`).
2. **Игра** — `/<slug>` (например `/alphabet`) через `app/[game]/page.tsx`.
3. **Реестр** — `games/registry.ts` + `games/reserved-slugs.ts`; валидация slug при старте и в тестах.
4. **Зарезервированные slug'и** — `admin`, `api`, `about`, `login`, `games`, `rules`, `privacy`, `_next`, `favicon.ico`, `robots.txt`, `sitemap.xml` и др. по контракту.
5. **`dynamicParams = false`** — неизвестный slug → `notFound()`.
6. **`generateStaticParams`** — только slug'и из реестра.
7. **Редирект** — постоянный `/game` → `/alphabet` в `next.config.ts`.
8. Правила — `RulesDialog` внутри игры, не `/<slug>/rules`.

Детали — [`game_routing_contract.md`](../implementation/contracts/game_routing_contract.md).

---

## Rejected alternatives

| Альтернатива | Почему отклонена |
|--------------|------------------|
| `/games/<slug>` | Длиннее URL; требование владельца — корневой slug (D4) |
| `/play/<slug>` | Лишний сегмент без SEO-выгоды |
| Автообнаружение игр по файловой системе | Риск конфликтов slug и `_template`; реестр явный и тестируемый |

---

## Consequences

### Positive

- Предсказуемые URL и статическая генерация параметров.
- Раннее обнаружение конфликта slug.

### Negative

- Новый системный top-level маршрут требует обновления `RESERVED_SLUGS` в том же коммите.

### Security

Admin и `/api/admin` остаются за `proxy.ts` и `role === 'admin'`.

---

## Критерии соответствия

- [ ] §1–§4 `game_routing_contract.md` выполняются после R02
- [ ] Unit-тест: `generateStaticParams` = slug'и реестра
