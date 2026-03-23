# Sprint 02: Configuration and Secret Management

## Goal
Implement safe runtime configuration with strict validation and secure secret handling.

## Clean Architecture Alignment
- Layers in scope: application config ports, infrastructure config/secret adapters
- Rule: use cases read config through ports; no direct env/global reads in domain/application logic
- Required test gate: boundary tests for config adapter isolation

## Dependencies and Anti-Gap Checks
- Depends on: Sprint 01 CI and test harness
- Must produce: typed config contract and secret redaction shared utility to avoid duplication
## Backlog
- Centralized config loader with schema validation
- Environment profiles (`dev`, `test`, `prod`)
- Secret read strategy from env and secure stores
- Redaction support for logs and error output

## Acceptance Criteria
- App fails fast on invalid/missing required config
- Secrets never printed in logs or CLI output
- Config behavior is deterministic across environments

## Automated Tests
### Positive tests
- Unit: valid config maps to typed settings object
- Unit: optional config fields use correct defaults
- Integration: environment profile switching loads expected values

### Negative tests
- Unit: malformed values (e.g., non-numeric timeout) fail validation
- Unit: unknown config keys are rejected or warned based on mode
- Integration: missing API key blocks provider initialization
- Integration: secret values are redacted in structured logs

## Definition of Done
- Config schema versioned and documented
- Secret-handling tests enforced in CI


