# Clean Architecture Definition (Uncle Bob)

## Objective
Keep the codebase clean, testable, and DRY by enforcing strict boundaries and dependency direction.

## Dependency Rule
- Source dependencies always point inward.
- `domain` depends on nothing external.
- `application` depends on `domain`.
- `interface_adapters` depend on `application` and `domain`.
- `infrastructure` depends on `application` ports and `domain` models.
- No outer layer may be imported by an inner layer.

## Target Folder Shape
- `src/domain`
- `src/application`
- `src/interface_adapters`
- `src/infrastructure`
- `src/shared`
- `tests/unit`
- `tests/integration`
- `tests/e2e`
- `tests/architecture`

## Layer Responsibilities
- `domain`: entities, value objects, domain services, domain errors
- `application`: use cases, input/output DTOs, ports (interfaces), orchestration policy
- `interface_adapters`: CLI controllers, presenters, mappers
- `infrastructure`: API clients, persistence adapters, queue/log/telemetry adapters
- `shared`: cross-cutting primitives (result types, clock interface, ID generator)

## SOLID + DRY Rules
- Single Responsibility: one reason to change per class/module
- Open/Closed: extend via ports/adapters, avoid core modification for provider additions
- Liskov: all adapter implementations satisfy port contracts
- Interface Segregation: small focused ports, no fat interfaces
- Dependency Inversion: use cases depend on abstractions, not concrete clients
- DRY: no copy-pasted business rules across use cases/adapters

## Clean Code Rules
- Functions should be small and intention-revealing
- Avoid boolean control flags in public APIs
- Use explicit domain names, avoid vague helper names
- Prefer typed error hierarchy over string matching
- Keep side effects at the edges (adapters/infrastructure)

## Architecture Test Requirements
- Import boundary tests enforce allowed dependency directions
- Contract tests enforce every adapter against each port
- Mutation or branch-sensitive tests for core domain rules
- CI blocks merge on architecture test failure

## Definition of Done Addendum
- New behavior mapped to a layer and port before implementation
- Positive and negative tests added at correct level
- Duplicate logic removed or extracted before sprint close
