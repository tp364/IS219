Data provenance & notes

**Status (Phase 1)**: This is a scaffold/template with sample data. Real data retrievals pending per fetch plan below.

Retrieval date (draft): 2026-02-06

Planned primary sources:
- Zillow Home Value Index (Zillow Research) — median home price by region/time
- U.S. Census American Community Survey (ACS) — median household income by region
- Freddie Mac PMMS — 30-year fixed mortgage average rates
- BLS / CPI — optional inflation adjustments

Caveats:
- ACS income estimates are survey-based and available as 1-yr/5-yr estimates; they lag and have margins of error.
- Zillow provides monthly indices; we will aggregate to calendar-year medians for comparability.
- Mortgage rates vary weekly; we'll use a selected date rate or annual average depending on the interaction design.

Scripted fetch plan (outline):
1. Zillow: download CSVs for chosen regions via Zillow Research data portal (manual or automated if API available).
   - If Zillow offers CSV links, fetch with `curl -o data/zillow-region.csv <url>`.
2. ACS: use Census API to fetch median household income by region (requires API key).
   - Example curl: `curl "https://api.census.gov/data/2023/acs/acs5?get=B19013_001E&for=metropolitan%20statistical%20area/micropolitan%20statistical%20area:*&key=YOUR_KEY" -o data/acs-income.json`
3. Freddie Mac: download PMMS CSV for mortgage rates.
4. CPI: download BLS/CPI series if needed for inflation-adjustment.

Cleaning steps to implement:
- Normalize date ranges (calendar year), convert all dollar figures to consistent nominal or real USD.
- Join datasets on `region` + `year` and drop regions with inconsistent identifiers or >30% missing years.
- Compute derived fields for UI: price-to-income ratio, required_downpayment_usd, monthly_payment_usd (30y fixed formula).

Licensing & reuse:
- Follow each source's license terms. Zillow and some commercial datasets may restrict commercial reuse — for classwork this is typically acceptable with attribution.

## Data Audit Notes (Current)
- **Missing values**: Current sample has no gaps (Metro A & B, 2020–2024). Real data will reveal actual missing patterns.
- **Weird fields**: None identified yet in sample. Will flag outliers (e.g., luxury metro outliers, tiny-sample metro income estimates) once real data is integrated.
- **Cleaning status**: Sample is clean; production run will follow the steps outlined above.

## Next: Fetch & Integrate Real Data
Once Zillow, ACS, and Freddie Mac sources are obtained, run the scripted fetch plan, combine datasets on `region` + `year`, and regenerate `processed.json` via `src/lib/loadData.ts`.

### Processed dataset
A small node script `scripts/process_data.js` (and Python version in `scripts/`)
can be used to convert `/data/raw.csv` into `/data/processed.json` with derived
fields.  The web app prefers `processed.json` if available, which speeds up page
loads and makes builds deterministic.

---

## Development steps taken
1. **Initial scaffold**: created React/Vite project with TypeScript and added core
   components (`CityChart`, `Calculator`) along with `schema.ts` and data loading
   logic.
2. **Data pipeline**: defined CSV schema, implemented `loadData` to fetch raw or
   preprocessed files, added sample data in `/data/raw.csv` and generated
   `processed.json`.
3. **Phase 1 README**: wrote project description, planning notes, and status
   section.
4. **Express server**: added simple `server.js` and `start` npm script for
   production hosting; configured `vite.config.ts` port.
5. **Calculator view**: built affordability calculator with salary slider,
   monthly income conversion, and category text (`definitely/maybe/unlikely`).
6. **City chart**: started with basic bar chart, added year slider, color scales,
   tooltip, legend, and affordability coloring rules.
7. **Bug fixes**: resolved npm ENOENT/ERESOLVE issues, port conflicts, and
   ensured data visibility with initial year state.
8. **UX refinements**: adjusted label positions, added/removed numeric annotations,
   implemented gradient and color logic, and eventually cleaned up clutter.
9. **Styling upgrades**: added SVG background, page and chart container gradients,
   and overall site color scheme for visual appeal.
10. **Accessibility**: included ARIA labels, keyboard focus styles, and semantic
    HTML for improved usability.
11. **Documentation**: expanded README through Phase 5, added deployment notes,
    and included this `notes.md` provenance file.

These steps record the evolution of the project from scaffold to finished demo.
Feel free to update as new changes are made.

---

## Phase summaries
- **Phase 1:** initial scoping, sample data, and README notes (essential question and data plan).
- **Phase 2:** data pipeline & contract; schema defined, sample CSV parsing, derived field logic.
- **Phase 3:** prototype with single view (CityChart) including year slider, color coding, and annotation.
- **Phase 4:** second view added (affordability calculator), UI refinements, styling, accessibility, and narrative polish.
- **Phase 5:** final aesthetics and documentation, accessibility checks, deployment instructions, and demo preparation.
