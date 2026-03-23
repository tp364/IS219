# Sprint 07: Required Hourly Wage

- Unit (+): hourly = gross / (40*52).
- Unit (-): zero/negative hour basis blocked by guard.
- Integration (+): results page shows hourly with currency formatting.
- Integration (-): rounding keeps cents precision and no `NaN`.
- E2E (+): gross salary result displays matching hourly wage.
- E2E (-): extreme large values still render finite formatted output.

