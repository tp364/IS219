# Student Future Budget Planner - TDD Sprint Matrix

## Sprint 1: App Shell + Routing
- Unit (+): route constants include `/` and `/results`.
- Unit (-): unknown route returns 404 component.
- Integration (+): app renders input page by default.
- Integration (-): direct `/results` without data shows safe fallback.
- E2E (+): user lands on input page and sees all required fields.
- E2E (-): manual URL tamper to invalid route shows 404.

## Sprint 2: Static Data (Cities + Tax Rate)
- Unit (+): city list loads 3-5 valid entries; tax rate defaults to `0.25`.
- Unit (-): missing city rent map key throws handled error.
- Integration (+): selecting city auto-fills rent.
- Integration (-): invalid city selection keeps previous valid state.
- E2E (+): user picks city and sees rent auto-populate.
- E2E (-): corrupted local state city key shows user-friendly error.

## Sprint 3: Input Validation Rules
- Unit (+): accepts non-negative numeric values; loan optional.
- Unit (-): rejects negative, NaN, empty required fields.
- Integration (+): submit enabled only when form valid.
- Integration (-): invalid field blocks transition to results.
- E2E (+): valid form submits and routes to results.
- E2E (-): entering `-100` rent shows inline error and no route change.

## Sprint 4: Monthly Expense Calculation
- Unit (+): sums rent+utilities+food+transport+discretionary+loan+savings correctly.
- Unit (-): undefined optional loan treated as `0`.
- Integration (+): calculated monthly total passed to results state.
- Integration (-): string numeric inputs normalized before calc.
- E2E (+): known fixture inputs produce expected monthly total.
- E2E (-): malformed numeric text triggers validation, not wrong math.

## Sprint 5: Annual Cost Calculation
- Unit (+): annual living cost = monthly expenses * 12.
- Unit (-): zero monthly yields zero annual.
- Integration (+): annual output updates when any monthly field changes.
- Integration (-): stale cache does not preserve old annual value.
- E2E (+): user edits food and sees annual total increase correctly.
- E2E (-): back/forward nav does not duplicate yearly multiplier.

## Sprint 6: Required Gross Salary
- Unit (+): `gross = annual_cost / (1 - taxRate)`.
- Unit (-): taxRate `>=1` or `<0` is rejected.
- Integration (+): tax rate constant injected into salary calc service.
- Integration (-): missing tax rate falls back to default `25%`.
- E2E (+): known fixture returns exact expected gross salary.
- E2E (-): invalid config tax rate shows config error state.

## Sprint 7: Required Hourly Wage
- Unit (+): hourly = gross / (40*52).
- Unit (-): zero/negative hour basis blocked by guard.
- Integration (+): results page shows hourly with currency formatting.
- Integration (-): rounding keeps cents precision and no `NaN`.
- E2E (+): gross salary result displays matching hourly wage.
- E2E (-): extreme large values still render finite formatted output.

## Sprint 8: Results Page UI + "Adjust Your Plan"
- Unit (+): results component renders 4 required outputs.
- Unit (-): null result payload renders fallback message.
- Integration (+): "Adjust Your Plan" returns to form with prior values.
- Integration (-): adjust action never clears state unexpectedly.
- E2E (+): complete flow: input -> results -> adjust -> edit -> results.
- E2E (-): refresh on results gracefully handles missing transient state.

## Sprint 9: Responsive Layout + Accessibility
- Unit (+): CTA/button components include accessible labels.
- Unit (-): missing label fails accessibility test.
- Integration (+): mobile breakpoint keeps form usable and readable.
- Integration (-): long currency values do not overflow small screens.
- E2E (+): viewport tests (mobile/tablet/desktop) all complete flow.
- E2E (-): keyboard-only navigation cannot trap focus.

## Sprint 10: Out-of-Scope Guardrails
- Unit (+): no auth, no API clients, no AI modules present.
- Unit (-): accidental import of disallowed modules fails test.
- Integration (+): build passes with static-only data path.
- Integration (-): attempted network request is blocked in test harness.
- E2E (+): app works offline after initial load of static bundle.
- E2E (-): no UI entry points for comparisons/accounts/features out-of-scope.

## Sprint 11: Formula Documentation Test Coverage
- Unit (+): formula doc examples match calculator outputs.
- Unit (-): changed formula without doc update fails snapshot/doc test.
- Integration (+): docs link visible in app/repo README.
- Integration (-): missing formula section fails CI check.
- E2E (+): user can access explanation of all displayed metrics.
- E2E (-): stale doc version warning appears when mismatch detected.

## Sprint 12: Deployment and Smoke Regression (Vercel)
- Unit (+): env/config defaults resolve without backend vars.
- Unit (-): unexpected env var dependency fails build test.
- Integration (+): production build and start command succeed.
- Integration (-): route fallback works under static hosting rules.
- E2E (+): live URL smoke: submit valid fixture and verify outputs.
- E2E (-): hard refresh deep link behavior verified (`/results` safe fallback).
