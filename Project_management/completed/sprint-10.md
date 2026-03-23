# Sprint 10: Out-of-Scope Guardrails

- Unit (+): no auth, no API clients, no AI modules present.
- Unit (-): accidental import of disallowed modules fails test.
- Integration (+): build passes with static-only data path.
- Integration (-): attempted network request is blocked in test harness.
- E2E (+): app works offline after initial load of static bundle.
- E2E (-): no UI entry points for comparisons/accounts/features out-of-scope.

