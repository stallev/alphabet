# {Название спецификации}

**Тип:** Spec  
**Статус:** Draft | Canonical  
**Версия:** 1.0  
**Дата:** YYYY-MM-DD  
**Зависит от:** [контракты §…]  
**Используется в:** R{NN}-CU{k}

---

## §1 Files / area touchpoints

<!-- Маршруты App Router, `components/`, Server Actions, DAL -->

## §2 Happy path

<!-- Пошаговый UX + серверные touchpoints -->

## §3 Negative paths (UX)

<!-- empty, loading, error, retry; код из contract · ключ i18n · UI-состояние -->

## §4 Security paths

<!-- session/role, 401/403, forbidden UI. N/A — <причина> -->

## §5 Concurrency notes

<!-- Ссылка на contract + disabled / aria-busy -->

## §6 UI states matrix

| Регион | empty | loading | error | forbidden |
|--------|-------|---------|-------|-----------|

## §7 Wireframe & prototype

<!-- Ссылка на макет или «нет» -->

## §8 Acceptance criteria

<!-- Smoke: happy + обязательные N/S -->

## §9 Open questions

## Критерии соответствия

- [ ] Не дублирует race-логику контракта — только UX
- [ ] Ссылки на contract `§N.M` открываются
- [ ] Образец: [`portal_home_spec.md`](../../implementation/specs/portal_home_spec.md)
