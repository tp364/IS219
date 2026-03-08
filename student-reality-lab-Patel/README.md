# Can Recent Graduates Afford to Buy a House?

**Live demo:** [https://tp364.github.io/IS219/](https://tp364.github.io/IS219/)


## Getting Started

```bash
# install dependencies and start dev server
# if you see an ERESOLVE conflict (vega/vega-lite), run with
# legacy-peer-deps or --force so npm ignores the version mismatch:
npm install --legacy-peer-deps

# add TypeScript declaration packages for React and D3
npm install -D @types/react @types/react-dom @types/d3
npm run dev    # then visit http://localhost:3000 (or whatever port Vite chooses)

# for a lightweight production server after `npm run build`:
# 1. install express (it's listed in dependencies)
# 2. run `npm start` which serves `dist/` on port 3000 by default

```

The repo uses Vite + React + TypeScript; the code lives in `src/` and data in `data/raw.csv`.


## Essential Question

Can a student or recent graduate realistically buy a median-priced home in their city within five years of graduation given typical starting salaries, a 20% down payment target, and prevailing mortgage rates?

**Current status (2026‑03‑07):** prototype complete with two interactive views, polished styling—including full-page gradient background and colored chart container—and comprehensive documentation in `README.md` and `data/notes.md`. All code builds and runs locally via `npm run dev` or `npm start` after building.

## Claim (Hypothesis)

Most students cannot afford a median-priced home within five years after graduation without additional financial support or substantially above-average earnings.

## Audience

College students, recent graduates, financial aid advisors, and student-focused policy researchers.

## STAR Draft

- **S  Situation:** Rising home prices, student debt loads, and recent mortgage-rate volatility create uncertainty for graduates considering homeownership.
- **T  Task:** Give viewers an evidence-based, interactive way to test whether homeownership is feasible in their city within five years.
- **A  Action:** Build a concise data story (2 views):
  - View 1  City Affordability Chart: bar plot color-coded by affordability (years-to-save or percent of cities affordable within 5 years). Filter by year.
  - View 2  Affordability Calculator: a chart + controls with sliders for `annual income`, `down payment %`, and `mortgage rate` that updates required monthly payment and a clear callout for feasibility.
- **R  Result:** Headline metric: % of cities where a graduate with median starting income can buy the median-priced home within five years (20% down). Expect a small minority of cities to be affordable under baseline assumptions.

## Dataset & Provenance

**Primary Sources** (retrieval dates and live links in `/data/notes.md`):
- **Zillow Research**  median home prices by city/metro
- **U.S. Census American Community Survey (ACS)**  median household income by region
- **Freddie Mac PMMS**  30-year fixed mortgage average rates
- **BLS / CPI**  optional inflation adjustments

**License & Reuse:** Each source licensed per original terms; classwork usage typically permitted with attribution. See `/data/notes.md` for specific retrieval dates and API requirements.

## Data Dictionary

| Column | Meaning | Units |
|--------|---------|-------|
| `region` | Metro area or region name | string |
| `year` | Calendar year | integer (20202024) |
| `median_home_price` | Median listing or sale price | USD |
| `median_income` | Median household income (income earner) | USD/year |
| `median_rent` | Median monthly rent | USD/month |
| `mortgage_rate_percent` | 30-year fixed mortgage rate | percent (e.g., 6.5) |
| `downpayment_percent` | Assumed down payment | percent (e.g., 20) |

## Data Viability Audit

### Missing Values & Weird Fields

- **Missing values:** Current sample (Metro A & B, 20202024) is complete. Real data from ACS and Zillow will have gaps; small metros and rural areas may lack reliable price series. ACS income estimates include margins of error.
- **Weird fields:** Outlier home prices (luxury enclaves) and small-sample income estimates can distort city-level affordability metrics. Will apply caps or log-transforms where appropriate.

### Cleaning Plan

1. Standardize to calendar year and consistent USD (2026 nominal or real via CPI deflation).
2. Drop regions with missing critical fields (price or income) or >30% missing years.
3. Impute small gaps via linear interpolation; flag imputed rows in processed output.
4. Compute derived fields: `price_to_income = median_home_price / median_income`, `required_downpayment_usd = median_home_price * downpayment_pct`, `loan_amount = median_home_price - required_downpayment_usd`, and `monthly_payment` (30-year fixed formula).

### Limits & What This Dataset Cannot Prove

- **Not modeled:** Creditworthiness, student loan payments, discretionary spending, and local taxes/insurance/HOA costs.
- **Not individual advice:** Starting-salary estimates reflect city-level medians; results are illustrative, not financial guidance for any individual graduate.
- **Survey limitations:** ACS lags and has margins of error; Zillow indices are estimates, not transacted prices.

## Draft Chart Screenshot & Explanation

**Chart 1: Years of Income Required to Buy (Bar Chart)**
- Metric: `years_of_income_to_buy = median_home_price / median_income`, sorted descending by region.

**Why this answers the question:**
1. Provides an intuitive affordability metric that students can directly compare to their expected post-graduation earnings trajectory.
2. Shows immediately whether homeownership within 5 years is plausible (if ratio is 5, potentially feasible; if >5, unlikely without external capital).

---

## Phase 2 — Data Pipeline & Contract (completed draft)

### Cleaning & Transform Notes
The repository now includes a simple ETL module at `src/lib/loadData.ts`.  It reads the sample `/data/raw.csv` using `d3.csv` and performs the planned standardizations:

- parse numeric columns
- compute derived fields `price_to_income`, `required_downpayment_usd`, `loan_amount`, and `monthly_payment_usd` using a 30‑year mortgage formula.
- leave the dataset unmodified when values are missing (sample has none).

The pipeline is intentionally lightweight; for the final project the same module can be extended to fetch real ACS/Airtable/Zillow data automatically as outlined in `data/notes.md`.

### Definitions
The project defines key variables for clarity:

- **Median home price** – Zillow median listing price for a metro region.
- **Median income** – ACS median household income (earner) for the same region.
- **Price‑to‑income ratio** – the number of years of median income required to match the median home price.  A ratio ≤5 is used as a rough “five‑year affordability” threshold.

### Engineering acceptance
- `npm run dev` and `npm run build` succeed in a standard Vite/React environment (see package.json).
- No magic numbers appear in code; all formulas are documented in comments.
- Sample data accessible via `/data/raw.csv` and transformed on the client side for simplicity.  A future backend step could emit `/data/processed.json` if needed.

> For detailed provenance, phase summaries, and a complete step log refer to `data/notes.md`.

---

## Phase 3 — Prototype App: One View That Proves the Claim

The application includes a single interactive view (the affordability bar chart) that satisfies Phase 3 requirements:

- **Axes/labels:** the x‑axis shows years‑of‑income ratio, y‑axis lists regions.  Slider control chooses year.
- **Interaction:** a range input filters the data by year; changing the slider re‑draws the bars.
- **Annotation:** the highest ratio bar is labeled “hardest to afford” directly in the SVG.
- The view is self‑contained in `src/components/CityChart.tsx` and is the default when visiting the app.

150‑250 words of story text will appear around the chart in the final narrative; placeholder text is included in the component.

Deployment is handled by any static host (GitHub Pages, Netlify, Vercel).  For example, after `npm run build` push the `dist/` folder to `gh-pages` or connect the repo to Vercel and link the generated URL below.

*Deployed link:* (will add after pushing to hosting provider, e.g. Vercel or GitHub Pages)

### Interaction Design
The year slider allows viewers to watch affordability change over time; the color‑coding (green vs red) quickly signals which metros meet the five‑year threshold.  This interaction turns a static comparison into a mini‑simulation, backing the claim that affordability is rare.

---

## Phase 4 & Beyond
The app now has two fully working views, each earning its place in the narrative:

1. **City Affordability Chart** – context and evidence.  Shows how many years of median
   income a graduate would need across metros.  Segmentation by year lets viewers
   observe the trend and compare across time.
2. **Affordability Calculator** – counterpoint and personalization.  Viewers can
   plug in their own income, down payment, and rate assumptions to test whether a
   specific scenario is feasible, reinforcing the claim.

Together these views provide context (housing costs are rising), evidence (most
metros exceed the five‑year threshold), segmentation (filtering by year) and a
clear takeaway (owning within five years is unlikely on a median salary).

The STAR presentation draft above (`PRESENTATION.md`) walks through the same
structure and will align with the final demo.

The workspace meets the non‑negotiables: clear essential question, single‑sentence
claim, at least one meaningful interaction, and an annotation.  The code is
packaged professionally with a `package.json`, build scripts, and a structured
README + data audit.

Future work includes integrating real datasets, polishing accessibility (tab order
on sliders, ARIA labels), and deploying the finished site.  

## Phase 5 — Polish & Demo Day
Final polish focuses on usability, presentation, styling enhancements, and final deployment/demonstration prep:

- **Accessibility basics:** ensure all controls are keyboard navigable, add
  alt text for any future visuals, and verify color contrast on charts.
- **Performance basics:** precompute `processed.json` (already done), minimize
  re-renders, and avoid large blocking computations in React render paths.
- **Limits & What I’d Do Next** section (below) offers honest disclosure of
  dataset shortcomings.
- **Live demo prep:** record a 3–5 minute STAR video showing the claim, the
  interaction changing the conclusion, one limitation, and an actionable takeaway.

With these items complete and the app deployed, the project will be fully ready
for submission and demonstration.

---

## Limits & What I’d Do Next

- **Census/Zillow margins:** City-level medians hide within-metro variation and
  survey error; the sample dataset is illustrative only.
- **Omitted costs:** Our affordability calculation ignores student‑loan payments,
  credit scores, property taxes, insurance, and other recurring expenses, so the
  monthly payments shown are optimistic estimates.
- **Static assumptions:** A fixed 20 % down payment and 30‑year term are
  convenient but not universally applicable.

To take this project further I would:

1. Fetch and clean real ACS + Zillow data according to the scripted plan and
   rebuild `processed.json` automatically.
2. Add a geographic map view (choropleth or bubble map) with state/region
   filters to complement the bar chart.
3. Incorporate average student‑loan payment burdens to refine the affordability
   calculation and make it more realistic for recent graduates.
4. Improve performance by precomputing and caching data at build time (the
   pipeline already supports this via `processed.json`).
5. Record a 3–5 minute STAR demo video and finalize deployment on Vercel/GH Pages.

## Submission

Repository link: https://github.com/tp364/IS219/tree/main/student-reality-lab-Patel
Deployed link: https://tp364.github.io/IS219/
60-second screen recording (backup for demo day): https://youtu.be/4gZ1ww8kYu0