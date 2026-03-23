# Sprint 06: CLI and User Experience

## Goal
Build an intuitive and script-friendly CLI with clear command ergonomics and failure feedback.

## Clean Architecture Alignment
- Layers in scope: interface_adapters CLI controllers/presenters
- Rule: CLI must call application use cases, never infrastructure directly
- Required test gate: CLI integration tests against use-case interfaces

## Dependencies and Anti-Gap Checks
- Depends on: Sprint 04 generation use cases and Sprint 05 analysis use cases
- Must produce: reusable argument validation helpers (single source, DRY)
## Backlog
- Command groups (`generate`, `analyze`, `providers`, `config`)
- Input argument parsing and validation
- Rich but parseable output modes (`table`, `json`)
- Error messaging with remediation hints

## Acceptance Criteria
- All commands support `--help`
- JSON output is stable and machine-readable
- User-facing errors include cause and next action

## Automated Tests
### Positive tests
- Unit: argument parser maps CLI flags to command options
- Unit: `--output json` returns valid JSON schema
- E2E: `generate` command with valid args succeeds
- E2E: `analyze` command with valid local image succeeds

### Negative tests
- Unit: unknown command or flag returns usage error
- Unit: conflicting options are rejected
- E2E: missing required positional arg exits non-zero with help text
- E2E: invalid output format value returns validation message

## Definition of Done
- CLI docs generated from command definitions
- Command behavior stable under test snapshots


