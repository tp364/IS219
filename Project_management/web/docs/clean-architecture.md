# Clean Architecture Notes

## Dependency Rule
- Route handlers in `src/app/api/*` stay thin and handle HTTP only.
- Application orchestration lives in `src/services/*`.
- Adapters live in `src/lib/*` and are passed into services via interfaces.

## Side-Effect Policy
- Database initialization is explicit (`src/lib/db.ts`) and not performed at module import time.
- Repository access goes through `getStore()` or `createStore(db)`.

## Boundary Validation
- All API request/query payloads are validated with shared Zod schemas in `src/lib/validation.ts`.
- Invalid boundary payloads return deterministic `400` responses.

## Security Baseline
- `AUTH_SECRET` must be strong in runtime environments.
- Test and production-build phases are explicit special cases handled in `src/lib/auth-secret.ts`.

## QA Gates
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
