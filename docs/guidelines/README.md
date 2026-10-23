# Guidelines — EdenGames

Нормы реализации для Next.js **16.2.6**, single-app и профиля качества **lean**.

**Методология:** [`docs/meta/ai_first_methodology.md`](../meta/ai_first_methodology.md)  
**Иерархия источников:** только в [`.cursor/rules/project-context.mdc`](../../.cursor/rules/project-context.mdc).

## Индекс

| Область | Документ |
|---------|----------|
| TypeScript | [`typescript/README.md`](typescript/README.md) |
| React | [`react/README.md`](react/README.md) |
| Next.js | [`nextjs/README.md`](nextjs/README.md) |
| Auth | [`auth/ai_auth_implementation_guide.md`](auth/ai_auth_implementation_guide.md) |
| Security (XSS/CSRF) | [`security/README.md`](security/README.md) |
| Testing | [`testing/ai_testing_guidelines.md`](testing/ai_testing_guidelines.md) |
| UI-check агента | [`testing/ai_ui_verification.md`](testing/ai_ui_verification.md) |
| Code review protocol | [`ai_code_review_protocol.md`](ai_code_review_protocol.md) |
| Прогон фазы | [`agent-phase-orchestration.md`](agent-phase-orchestration.md) · запуск: [`docs/prompts/phase-implementation.md`](../prompts/phase-implementation.md) |
| Маршрутизация моделей | [`docs/meta/ai_agent_model_routing.md`](../meta/ai_agent_model_routing.md) |
| Типографика | [`typography_text_guidelines.md`](typography_text_guidelines.md) |
| General deep dives | [`../general/README.md`](../general/README.md) |

## Cursor rules

Полный манифест — [`.cursor/rules/README.md`](../../.cursor/rules/README.md). Guidelines дополняют правила с `globs` и requestable-навыки; при конфликте выигрывают Cursor Rules → `AGENTS.md` → ADR → контракты.
