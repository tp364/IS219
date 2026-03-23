# Sprint 06: Required Gross Salary

- Unit (+): `gross = annual_cost / (1 - taxRate)`.
- Unit (-): taxRate `>=1` or `<0` is rejected.
- Integration (+): tax rate constant injected into salary calc service.
- Integration (-): missing tax rate falls back to default `25%`.
- E2E (+): known fixture returns exact expected gross salary.
- E2E (-): invalid config tax rate shows config error state.

