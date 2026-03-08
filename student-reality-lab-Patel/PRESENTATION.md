<<<<<<< HEAD
# STAR Presentation Draft

## Situation
Graduates face unprecedented housing costs and high student loan burdens; many wonder whether it's even realistic to buy a home on a starting salary in their city.

## Task
Answer the essential question: can a student or recent graduate afford a median-priced home in their metro area within five years of graduation using typical starting salaries and a 20% down payment?

## Action
Built a small React/Vite web app with two views:

- **Affordability chart:** interactive bar chart of years‑of‑income ratio by region with a year slider.  Uses a simple data pipeline (`src/lib/loadData.ts`) to compute derived metrics from sample CSV data.
- **Calculator:** slider-based tool letting users adjust income, down payment %, and mortgage rate and see the resulting monthly payment.

Interactions were chosen to let viewers explore time trends and personalize assumptions.  The code is modular, with a lightweight schema and transform.

## Result
Baseline sample data show only a couple of metros fall below the five‑year threshold; most require 6–7 years of median income, underscoring the claim that homeownership is out of reach for many recent graduates.

- Headline number: _X%_ of tracked metros are affordable under baseline assumptions (placeholder until real data).  When the slider moves from 2020 to 2024, price‑to‑income ratios steadily increase.
- Calculator demonstrates that even modest variations in income or mortgage rate swing affordability significantly.

One limitation: dataset uses city‑level medians and ignores student loan payments, credit scores, and cost-of-living differences.  Real individual circumstances may vary widely.

=======
# STAR Presentation Draft

## Situation
Graduates face unprecedented housing costs and high student loan burdens; many wonder whether it's even realistic to buy a home on a starting salary in their city.

## Task
Answer the essential question: can a student or recent graduate afford a median-priced home in their metro area within five years of graduation using typical starting salaries and a 20% down payment?

## Action
Built a small React/Vite web app with two views:

- **Affordability chart:** interactive bar chart of years‑of‑income ratio by region with a year slider.  Uses a simple data pipeline (`src/lib/loadData.ts`) to compute derived metrics from sample CSV data.
- **Calculator:** slider-based tool letting users adjust income, down payment %, and mortgage rate and see the resulting monthly payment.

Interactions were chosen to let viewers explore time trends and personalize assumptions.  The code is modular, with a lightweight schema and transform.

## Result
Baseline sample data show only a couple of metros fall below the five‑year threshold; most require 6–7 years of median income, underscoring the claim that homeownership is out of reach for many recent graduates.

- Headline number: _X%_ of tracked metros are affordable under baseline assumptions (placeholder until real data).  When the slider moves from 2020 to 2024, price‑to‑income ratios steadily increase.
- Calculator demonstrates that even modest variations in income or mortgage rate swing affordability significantly.

One limitation: dataset uses city‑level medians and ignores student loan payments, credit scores, and cost-of-living differences.  Real individual circumstances may vary widely.

>>>>>>> 1675a0f6ca1e57d3994666bdb9917cb2c78fbd23
Takeaway: without additional income or support, homeownership is typically not achievable within five years post‑graduation; policymakers and students should plan accordingly.