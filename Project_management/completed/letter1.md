Hi,

I’d like to build a lean MVP for a web-based Student Future Budget Planner. The goal is to launch quickly with core functionality only.

OBJECTIVE
Create a simple web tool that calculates the income a student would need to support their desired lifestyle after graduation.

SCOPE: KEEP IT SIMPLE
This is a calculation tool only. No accounts, no AI, no advanced comparisons.

CORE FEATURES

1. User Inputs (Single Page Form)
   The user should input:

* City (start with 3–5 predefined cities)
* Monthly rent (auto-filled based on city average but editable)
* Utilities estimate
* Food budget
* Transportation cost
* Discretionary spending
* Monthly student loan payment (optional)
* Savings goal (monthly amount)

2. Calculation Logic
   The system should:

* Calculate total monthly expenses
* Multiply by 12 for annual expenses
* Add annual savings target
* Estimate required gross annual salary using a fixed assumed tax rate (e.g., 25%)

3. Results Page
   Display clearly:

* Total monthly cost
* Total annual cost
* Required annual gross salary
* Required hourly wage (based on 40 hours/week)

4. Static Data
   Include:

* Hardcoded city average rent values
* Hardcoded tax rate
* No external APIs required

TECH STACK
Frontend: Next.js (single-page app)
No backend required for MVP
No authentication
Deploy on Vercel

UI REQUIREMENTS

* Clean, minimal layout
* One input page → one results page
* Fully responsive
* Clear call-to-action to “Adjust Your Plan”

OUT OF SCOPE (FOR NOW)

* Career comparisons
* Scenario comparisons
* User accounts
* Saving plans
* AI features
* Advanced tax modeling

DELIVERABLE

* Deployed live URL
* Clean, readable source code
* Documented calculation formula

The priority is speed and clarity. Build the simplest usable version first, then we iterate.

Please confirm structure before development begins.

Thanks.
