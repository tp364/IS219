// Node script to read CSV and output processed.json
const fs = require('fs');
const path = require('path');
const csv = fs.readFileSync(path.join(__dirname, '..', 'data', 'raw.csv'), 'utf8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',');

function toNumber(x) { return x === '' ? null : +x; }

function monthlyPayment(principal, annualRatePercent, years = 30) {
  const rate = annualRatePercent / 100 / 12;
  const n = years * 12;
  if (rate === 0) return principal / n;
  return (principal * rate) / (1 - Math.pow(1 + rate, -n));
}

const records = [];
for (let i = 1; i < lines.length; i++) {
  const vals = lines[i].split(',');
  const rec = {};
  headers.forEach((h, j) => rec[h] = isNaN(vals[j]) ? vals[j] : toNumber(vals[j]));
  rec.price_to_income = rec.median_home_price / rec.median_income;
  rec.required_downpayment_usd = rec.median_home_price * (rec.downpayment_percent / 100);
  rec.loan_amount = rec.median_home_price - rec.required_downpayment_usd;
  rec.monthly_payment_usd = monthlyPayment(rec.loan_amount, rec.mortgage_rate_percent);
  records.push(rec);
}

fs.writeFileSync(path.join(__dirname, '..', 'data', 'processed.json'), JSON.stringify(records, null, 2));
console.log('Wrote', records.length, 'records to data/processed.json');
