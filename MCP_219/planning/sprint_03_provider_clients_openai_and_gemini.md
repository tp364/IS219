# Sprint 03: Provider Clients (OpenAI and Gemini)

## Goal
Build robust provider adapters with uniform contracts, retries, and typed errors.

## Clean Architecture Alignment
- Layers in scope: application provider ports, infrastructure provider adapters
- Rule: provider SDKs only in infrastructure layer
- Required test gate: shared contract tests for all provider adapters

## Dependencies and Anti-Gap Checks
- Depends on: Sprint 02 validated config and secret loading
- Must produce: reusable adapter base patterns to keep provider logic DRY
## Backlog
- Provider interface (`generateImage`, `analyzeImage`, `healthCheck`)
- OpenAI client adapter
- Gemini client adapter
- Error normalization layer and retry/backoff policy

## Acceptance Criteria
- Both providers satisfy shared interface tests
- Upstream transient failures are retried safely
- Provider-specific errors are mapped to common error types

## Automated Tests
### Positive tests
- Unit: OpenAI adapter transforms request/response correctly
- Unit: Gemini adapter transforms request/response correctly
- Integration: mocked 200 response returns valid domain object
- Integration: retry succeeds on second attempt after one transient 5xx

### Negative tests
- Unit: invalid provider payload triggers validation error
- Integration: 401/403 auth errors map to `AuthFailureError`
- Integration: permanent 4xx does not retry
- Integration: malformed JSON response is surfaced as parse error

## Definition of Done
- Contract tests run against both adapters
- Retry and timeout behavior configurable and tested


