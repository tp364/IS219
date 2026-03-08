import pandas as pd
import json

def monthly_payment(principal, annualRatePercent, years=30):
    rate = annualRatePercent / 100 / 12
    n = years * 12
    if rate == 0:
        return principal / n
    return (principal * rate) / (1 - (1 + rate) ** (-n))


df = pd.read_csv('data/raw.csv')
records = []
for _, row in df.iterrows():
    d = row.to_dict()
    d['price_to_income'] = d['median_home_price'] / d['median_income']
    d['required_downpayment_usd'] = d['median_home_price'] * (d['downpayment_percent'] / 100)
    d['loan_amount'] = d['median_home_price'] - d['required_downpayment_usd']
    d['monthly_payment_usd'] = monthly_payment(d['loan_amount'], d['mortgage_rate_percent'])
    records.append(d)

with open('data/processed.json', 'w') as f:
    json.dump(records, f, indent=2)
print('processed.json written with', len(records), 'records')
