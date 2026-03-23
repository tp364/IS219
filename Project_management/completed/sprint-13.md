# Sprint 13: Uncle Bob Audit Remediation (Active)

## Goal
Address the highest-risk audit issues first so the app is secure, predictable at boundaries, and testable.

## Scope (This Sprint)
- Enforce secure auth secret policy (no insecure fallback in runtime environments).
- Add runtime request validation for `/api/chat`, `/api/history`, and `/api/conversations`.
- Add MCP timeout and graceful fallback behavior.

## Deliverables
- Updated auth/env guards that fail fast on invalid config.
- Shared Zod schemas for request/query validation and consistent 400 responses.
- MCP client timeout handling with deterministic error/fallback path.
- Regression tests for auth secret guard, validation failures, and MCP timeout.

## Exit Criteria
- App cannot start in non-test mode with missing/weak `AUTH_SECRET`.
- Invalid API input never reaches use-case logic.
- MCP calls cannot block the request indefinitely.
- New tests pass in CI.
