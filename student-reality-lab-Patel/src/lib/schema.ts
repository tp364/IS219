// schema.ts
export interface RawRecord {
  region: string;
  year: number;
  median_home_price: number;
  median_income: number;
  median_rent: number;
  mortgage_rate_percent: number;
  downpayment_percent: number;
}

export interface ProcessedRecord extends RawRecord {
  price_to_income: number;
  required_downpayment_usd: number;
  loan_amount: number;
  monthly_payment_usd: number;
}
