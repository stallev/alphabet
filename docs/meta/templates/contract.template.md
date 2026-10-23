# {Название контракта}

**Тип:** Contract  
**Статус:** Draft | Canonical  
**Версия:** 1.0  
**Дата:** YYYY-MM-DD  
**Зависит от:** [связанные ADR/контракты]  
**Используется в:** R{NN}-CU{k}

---

## §1 Назначение

Кратко: какое поведение системы фиксирует контракт и для кого обязателен.

## §2 Happy path

<!-- Актор, preconditions, sequence, postconditions, side effects. Подраздел §2.M на операцию -->

## §3 Negative paths (business)

| Случай | Условие | Код / ключ | Исход / UI |
|--------|---------|------------|------------|

## §4 Security paths

<!-- anon / role / IDOR / tampering — deny на сервере. N/A — <причина из registry §2.3.2a> -->

## §5 Concurrency & idempotency

<!-- double-submit, races, transactions -->

## §6 Drift & consistency notes

<!-- schema vs код, cache, timezone -->

## §7 Policy & layer touchpoints

<!-- middleware, Server Actions, `lib/`, `server/`, `games/` — запрещённые импорты -->

## §8 Acceptance criteria

<!-- Проверяемый пункт на каждый обязательный путь H / N / S -->

## §9 Open questions

<!-- Q-01 · вопрос · владелец · блокирует. «—», если пусто -->

## Критерии соответствия

- [ ] Секции §2–§9 в порядке; якоря `§N` согласованы с задачами фазы
- [ ] Пути H/N/S по [`documentation_registry.md`](../documentation_registry.md) §2.3.2a
- [ ] DoR-ready по registry §2.3.6
- [ ] Образец: [`phase_driver_contract.md`](../../implementation/contracts/phase_driver_contract.md)
