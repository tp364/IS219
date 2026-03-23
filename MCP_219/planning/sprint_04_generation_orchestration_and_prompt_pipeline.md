# Sprint 04: Generation Orchestration and Prompt Pipeline

## Goal
Create the core generation workflow with prompt templates, safety checks, and deterministic orchestration.

## Clean Architecture Alignment
- Layers in scope: application use cases + domain prompt rules
- Rule: orchestration policies stay in application; provider calls go through ports only
- Required test gate: architecture tests proving no infrastructure imports in use cases

## Dependencies and Anti-Gap Checks
- Depends on: Sprint 03 provider contracts
- Must produce: centralized prompt validation service to avoid duplicate checks
## Backlog
- Prompt templating and variable substitution
- Preflight validation for prompt parameters
- Generation orchestration service
- Idempotency key support to prevent duplicate generation

## Acceptance Criteria
- Prompt rendering is deterministic
- Invalid prompt inputs are blocked before provider calls
- Duplicate request with same idempotency key is not re-executed

## Automated Tests
### Positive tests
- Unit: prompt template renders expected text for valid inputs
- Unit: orchestration calls selected provider exactly once
- Integration: valid generation flow returns artifact metadata
- Integration: idempotent duplicate request returns cached result

### Negative tests
- Unit: missing required prompt variable fails validation
- Unit: disallowed prompt token/length fails preflight rule
- Integration: provider timeout triggers controlled error return
- Integration: invalid provider selection fails with actionable message

## Definition of Done
- Prompt pipeline fully covered by unit tests
- Orchestrator behavior traceable through test assertions


