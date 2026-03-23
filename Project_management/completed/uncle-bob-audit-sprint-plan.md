# Uncle Bob Audit Sprint Plan

## Sprint 13: Security + Guardrails
- Remove insecure `AUTH_SECRET` fallback and fail fast when missing/weak.
- Add runtime validation for chat/history/conversation endpoints.
- Add MCP timeout + fallback behavior.
- Add regression tests for all above.

## Sprint 14: Chat Use-Case Decomposition
- Split `/api/chat` into controller + use-case + adapters.
- Move orchestration out of route handler to a dedicated application service.
- Define explicit interfaces for model/tool/store dependencies.
- Add unit tests on use-case with mocked ports.

## Sprint 15: Persistence Lifecycle Refactor
- Remove import-time side effects from `store` (mkdir/db open/schema exec).
- Introduce explicit DB initialization path and repository factory.
- Add repository tests for conversation/message operations.
- Keep migrations/init scripts as startup concerns.

## Sprint 16: API Coverage Expansion
- Add route tests for `/api/history` and `/api/conversations`.
- Cover auth failure, validation failure, ownership checks, not-found branches.
- Add integration tests for conversation rename/delete lifecycle.
- Add negative-path assertions for malformed payloads.

## Sprint 17: UI Correctness + Cleanup
- Persist and render per-message timestamps from stored data.
- Remove debug artifact text in chat bubble rendering.
- Add UI tests for thread select/rename/delete and timestamp rendering.
- Verify stream UX error states remain clear to user.

## Sprint 18: Hardening + Definition of Done
- Enforce lint/type/test/build quality gates on CI.
- Set minimum coverage threshold on API/use-case modules.
- Document architecture boundaries and clean-code standards.
- Close/defer each audit finding with explicit status and rationale.
