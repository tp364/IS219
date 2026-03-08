import React, { useState } from 'react';

function monthlyPayment(principal: number, annualRatePercent: number, years = 30) {
  const rate = annualRatePercent / 100 / 12;
  const n = years * 12;
  if (rate === 0) return principal / n;
  return (principal * rate) / (1 - Math.pow(1 + rate, -n));
}

export default function Calculator() {
  const [income, setIncome] = useState(60000);
  const [downPct, setDownPct] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6);
  const price = 400000; // placeholder median price

  const downPayment = price * (downPct / 100);
  const loan = price - downPayment;
  const payment = monthlyPayment(loan, mortgageRate);
  const monthlyIncome = income / 12;
  // affordability categories: 'definitely' if income >= 2*payment,
  // 'maybe' if income >= payment, otherwise 'unlikely'.
  let affordability: 'definitely' | 'maybe' | 'unlikely';
  if (monthlyIncome >= payment * 2) {
    affordability = 'definitely';
  } else if (monthlyIncome >= payment) {
    affordability = 'maybe';
  } else {
    affordability = 'unlikely';
  }

  return (
    <div className="chart-container">
      <h2>Affordability Calculator</h2>
      <p>
        Experiment with your own assumptions: adjust income, the size of a down
        payment, and current mortgage rates to see how the required monthly payment
        changes.  This tool helps personalize the city-level chart above.
      </p>
      <div className="controls">
        <label>
          Annual income: ${income.toLocaleString()}
          <br />
          (monthly ≈ ${(income/12).toLocaleString(undefined,{maximumFractionDigits:1})})
          <br />
          <input
            type="range"
            aria-label="Annual income"
            min={20000}
            max={120000}
            step={1000}
            value={income}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIncome(+e.target.value)}
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
      <p>Using a ${price.toLocaleString()} home (median example above),</p>
      <ul>
        <li>Monthly income: ${monthlyIncome.toLocaleString(undefined, {maximumFractionDigits:0})}</li>
        <li>Down payment: ${downPayment.toLocaleString()}</li>
        <li>Loan amount: ${loan.toLocaleString()}</li>
        <li>Estimated monthly payment: ${payment.toFixed(2)}</li>
        <li>
          Affordability: 
          <strong style={{color: affordability === 'definitely' ? 'green' : affordability === 'maybe' ? 'orange' : 'red'}}>
            {affordability}
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
