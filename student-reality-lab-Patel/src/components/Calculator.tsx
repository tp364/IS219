import React, { useState } from 'react';
import { calculateScenario } from '../lib/calculatorMath';

function formatCurrency(value: number, maximumFractionDigits = 0) {
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: maximumFractionDigits === 0 ? 0 : 2,
    maximumFractionDigits
  });
}

export default function Calculator() {
  const [annualIncome, setAnnualIncome] = useState(60000);
  const [incomeMode, setIncomeMode] = useState<'annual' | 'monthly'>('annual');
  const [downPct, setDownPct] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6);
  const price = 400000; // placeholder median price

  const displayedIncome = incomeMode === 'annual' ? annualIncome : annualIncome / 12;
  const minIncome = incomeMode === 'annual' ? 20000 : Math.round(20000 / 12);
  const maxIncome = incomeMode === 'annual' ? 120000 : Math.round(120000 / 12);
  const stepIncome = incomeMode === 'annual' ? 1000 : 100;

  const scenario = calculateScenario({
    annualIncome,
    homePrice: price,
    downpaymentPercent: downPct,
    mortgageRatePercent: mortgageRate
  });

  return (
    <div className="chart-container">
      <h2>Affordability Calculator</h2>
      <p>
        Experiment with your own assumptions: adjust income, the size of a down
        payment, and current mortgage rates to see how the required monthly payment
        changes. This tool helps personalize the city-level chart above.
      </p>
      <div className="controls">
        <label>
          Income mode:
          <br />
          <select
            aria-label="Income mode"
            value={incomeMode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setIncomeMode(e.target.value as 'annual' | 'monthly')}
          >
            <option value="annual">Annual</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        <br />
        <label>
          {incomeMode === 'annual' ? 'Annual income' : 'Monthly income'}: ${displayedIncome.toLocaleString(undefined, {
            maximumFractionDigits: incomeMode === 'annual' ? 0 : 1
          })}
          <br />
          (annual ${annualIncome.toLocaleString()} | monthly approx ${(annualIncome / 12).toLocaleString(undefined, { maximumFractionDigits: 1 })})
          <br />
          <input
            type="range"
            aria-label={incomeMode === 'annual' ? 'Annual income' : 'Monthly income'}
            min={minIncome}
            max={maxIncome}
            step={stepIncome}
            value={displayedIncome}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = +e.target.value;
              setAnnualIncome(incomeMode === 'annual' ? value : value * 12);
            }}
          />
        </label>
        <br />
        <label>
          Down payment %: {downPct}%
          <br />
          <input
            type="range"
            aria-label="Down payment percentage"
            min={0}
            max={50}
            step={1}
            value={downPct}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDownPct(+e.target.value)}
          />
        </label>
        <br />
        <label>
          Mortgage rate %: {mortgageRate}
          <br />
          <input
            type="range"
            aria-label="Mortgage rate"
            min={2}
            max={12}
            step={0.25}
            value={mortgageRate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMortgageRate(+e.target.value)}
          />
        </label>
      </div>
      <p>Using a {formatCurrency(price)} home (median example above),</p>
      <ul>
        <li>Annual income: {formatCurrency(annualIncome)}</li>
        <li>Monthly income: {formatCurrency(scenario.monthlyIncome ?? 0)}</li>
        <li>Down payment: {formatCurrency(scenario.downPayment)}</li>
        <li>Loan amount: {formatCurrency(scenario.loanAmount)}</li>
        <li>Estimated monthly payment: {formatCurrency(scenario.payment, 2)}</li>
        <li>Estimated yearly payment: {formatCurrency(scenario.payment * 12, 2)}</li>
        <li>
          Affordability:
          <strong style={{ color: scenario.affordability === 'definitely' ? 'green' : scenario.affordability === 'maybe' ? 'orange' : 'red' }}>
            {scenario.affordability}
          </strong>
        </li>
      </ul>
      <p>
        The calculator is simplistic; real budgets include taxes, insurance, and other
        debts.
      </p>
    </div>
  );
}
