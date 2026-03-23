# Sprint 01: Foundation and Repo Hardening

## Goal
Create a stable project baseline with strict quality gates and repeatable local/CI execution.

## Clean Architecture Alignment
- Layers in scope: domain, application, interface_adapters, infrastructure
- Sprint output: create initial folder boundaries and enforce inward dependency rules
- Required test gate: add architecture import-rule tests in tests/architecture

## Dependencies and Anti-Gap Checks
- Depends on: none (bootstrap sprint)
- Must produce: baseline structure, CI rule for boundary tests, coding standards doc link
## Backlog
- Define project structure (`src/`, `tests/unit`, `tests/integration`, `tests/e2e`)
- Add formatter, linter, and type checker
- Add test runner and coverage reports
- Add CI pipeline for lint + type + test + coverage threshold

## Acceptance Criteria
- CI fails on lint/type/test failure
- Coverage report generated on each run
- Contributor can run full validation with one command

## Automated Tests
### Positive tests
- Unit: valid utility helpers return expected output
- Integration: CI workflow executes in clean environment
- E2E: project bootstrap command succeeds with sample config

### Negative tests
- Unit: invalid utility inputs throw typed errors
- Integration: intentionally broken lint fixture fails CI job
- E2E: missing required env values causes startup failure with clear message

## Definition of Done
- Merge only allowed through green CI
- Baseline quality gates documented


