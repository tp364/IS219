export type Affordability = 'definitely' | 'maybe' | 'unlikely' | 'unknown';

export type CalculatorScenario = {
  annualIncome?: number;
  monthlyIncome?: number;
  homePrice: number;
  downpaymentPercent: number;
  mortgageRatePercent: number;
  termYears?: number;
  loanAmount?: number;
};

export function monthlyPayment(principal: number, annualRatePercent: number, years = 30) {
  const rate = annualRatePercent / 100 / 12;
  const periods = Math.max(1, years * 12);
  if (rate === 0) return principal / periods;
  return (principal * rate) / (1 - Math.pow(1 + rate, -periods));
}

export function calculateScenario(input: CalculatorScenario) {
  const termYears = input.termYears ?? 30;
  const derivedDownPayment = input.homePrice * (input.downpaymentPercent / 100);
  const effectiveLoanAmount = input.loanAmount ?? (input.homePrice - derivedDownPayment);
  const downPayment = Math.max(0, input.homePrice - effectiveLoanAmount);
  const payment = monthlyPayment(effectiveLoanAmount, input.mortgageRatePercent, termYears);
  const monthlyIncome = input.monthlyIncome ?? (input.annualIncome !== undefined ? input.annualIncome / 12 : undefined);
  const annualIncome = input.annualIncome ?? (input.monthlyIncome !== undefined ? input.monthlyIncome * 12 : undefined);

  let affordability: Affordability = 'unknown';
  if (monthlyIncome !== undefined) {
    if (monthlyIncome >= payment * 2) {
      affordability = 'definitely';
    } else if (monthlyIncome >= payment) {
      affordability = 'maybe';
    } else {
      affordability = 'unlikely';
    }
  }

  return {
    termYears,
    downPayment,
    loanAmount: effectiveLoanAmount,
    payment,
    annualIncome,
    monthlyIncome,
    affordability
  };
}
