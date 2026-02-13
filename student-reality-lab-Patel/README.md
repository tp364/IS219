# Can Recent Graduates Afford to Buy a House?

## Essential Question

Can a student or recent graduate realistically buy a median-priced home in their city within five years of graduation given typical starting salaries, a 20% down payment target, and prevailing mortgage rates?

## Claim (Hypothesis)

Most students cannot afford a median-priced home within five years after graduation without additional financial support or substantially above-average earnings.

## Audience

College students, recent graduates, financial aid advisors, and student-focused policy researchers.

## STAR Draft

- **S  Situation:** Rising home prices, student debt loads, and recent mortgage-rate volatility create uncertainty for graduates considering homeownership.
- **T  Task:** Give viewers an evidence-based, interactive way to test whether homeownership is feasible in their city within five years.
- **A  Action:** Build a concise data story (2 views):
  - View 1  City Affordability Map: color-coded by affordability (years-to-save or percent of cities affordable within 5 years). Filter by state/region.
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
