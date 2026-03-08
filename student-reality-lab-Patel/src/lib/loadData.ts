import * as d3 from 'd3';
import { RawRecord, ProcessedRecord } from './schema';

/**
 * Load a processed dataset if available; otherwise read the raw CSV and compute
 * derived fields on the fly.  This gives us a stable build artifact while
 * still allowing live recomputation during development.
 */
export async function loadData(): Promise<ProcessedRecord[]> {
  const dataBaseUrl = import.meta.env.BASE_URL;
  const processedPath = `${dataBaseUrl}data/processed.json`;
  const rawPath = `${dataBaseUrl}data/raw.csv`;

  try {
    // attempt to fetch precomputed JSON (production build may include this)
    const resp = await fetch(processedPath);
    if (resp.ok) {
      return (await resp.json()) as ProcessedRecord[];
    }
  } catch {
    // fall through to raw CSV path
  }

  const data: RawRecord[] = await d3.csv(rawPath, d3.autoType) as RawRecord[];
  return data.map((d: RawRecord) => {
    const price_to_income = d.median_home_price / d.median_income;
    const required_downpayment_usd = d.median_home_price * (d.downpayment_percent / 100);
    const loan_amount = d.median_home_price - required_downpayment_usd;
    const rate = d.mortgage_rate_percent / 100 / 12;
    const n = 30 * 12;
    const monthly_payment_usd = rate === 0 ? loan_amount / n :
      (loan_amount * rate) / (1 - Math.pow(1 + rate, -n));

    return {
      ...d,
      price_to_income,
      required_downpayment_usd,
      loan_amount,
      monthly_payment_usd
    };
  });
}
