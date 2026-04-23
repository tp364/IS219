import React, { useEffect, useMemo, useState } from 'react';
import { evaluate } from 'mathjs';
import { loadData } from '../lib/loadData';
import { ProcessedRecord } from '../lib/schema';
import { calculateScenario } from '../lib/calculatorMath';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type QuickAction = {
  label: string;
  description: string;
  prompt: string;
};

type PaymentInput = {
  homePrice?: number;
  downpaymentPercent?: number;
  mortgageRatePercent?: number;
  termYears?: number;
  loanAmount?: number;
  annualIncome?: number;
  monthlyIncome?: number;
};

function parseFlexibleNumber(raw: string): number | undefined {
  const cleaned = raw.toLowerCase().replace(/[$,\s]/g, '');
  const multiplier = cleaned.endsWith('k') ? 1000 : 1;
  const base = multiplier === 1000 ? cleaned.slice(0, -1) : cleaned;
  const value = Number(base);
  return Number.isFinite(value) ? value * multiplier : undefined;
}

function formatMoney(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

function formatMoneyCents(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatIncomeLines(annualIncome?: number, monthlyIncome?: number) {
  return [
    annualIncome !== undefined ? `Annual income: ${formatMoney(annualIncome)}` : null,
    monthlyIncome !== undefined ? `Monthly income: ${formatMoney(monthlyIncome)}` : null
  ].filter(Boolean) as string[];
}

function formatRatioCalculation(record: ProcessedRecord) {
  return `${record.year}: ${formatMoney(record.median_home_price)} / ${formatMoney(record.median_income)} = ${record.price_to_income.toFixed(2)}`;
}

function wantsEveryYear(text: string) {
  const lower = text.toLowerCase();
  return [
    'every year',
    'all years',
    'by year',
    'across years',
    'over time',
    'timeline',
    'trend'
  ].some((phrase) => lower.includes(phrase));
}

function extractYear(text: string): number | undefined {
  const match = text.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : undefined;
}

function extractLabeledValue(text: string, labels: string[]): number | undefined {
  const pattern = new RegExp(`(?:${labels.join('|')})\\s*:?\\s*\\$?\\s*([\\d,]+(?:\\.\\d+)?)\\s*%?`, 'i');
  const match = text.match(pattern);
  if (!match) return undefined;
  const value = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(value) ? value : undefined;
}

function extractNaturalValue(text: string, patterns: RegExp[]): number | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = parseFlexibleNumber(match[1]);
    if (value !== undefined) return value;
  }
  return undefined;
}

function extractHistoryValue(messages: ChatMessage[], labels: string[]): number | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const value = extractLabeledValue(messages[i].text, labels);
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

function extractIncomeValues(text: string, messages: ChatMessage[]) {
  const currentMonthlyIncome = extractNaturalValue(text, [
    /monthly income[^0-9$]*([$]?\d[\d,.]*(?:\.\d+)?k?)/i,
    /(?:i|we)\s*(?:make|earn|bring home|take home|get paid).*?\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:month|mo|monthly)\b/i,
    /\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:month|mo|monthly)\b/i
  ]) ?? extractLabeledValue(text, ['monthly income']);

  const explicitAnnualIncome = extractNaturalValue(text, [
    /annual income[^0-9$]*([$]?\d[\d,.]*(?:\.\d+)?k?)/i,
    /yearly income[^0-9$]*([$]?\d[\d,.]*(?:\.\d+)?k?)/i,
    /(?:i|we)\s*(?:make|earn|bring home|take home|get paid).*?\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:year|yr|annual|annually|yearly)\b/i,
    /(?:income|salary)\s*(?:is|=|:)?\s*\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:year|yr|annual|annually|yearly)\b/i
  ]) ?? extractLabeledValue(text, ['annual income', 'yearly income']);

  const genericIncome = extractNaturalValue(text, [
    /(?:i|we)\s*(?:make|earn|bring home|take home|get paid).*?\$?([\d,.]+(?:\.\d+)?k?)\b/i,
    /(?:income|salary)\s*(?:is|=|:)?\s*\$?([\d,.]+(?:\.\d+)?k?)\b/i
  ]);

  const historyMonthlyIncome = extractHistoryValue(messages, ['monthly income']);
  const historyAnnualIncome = extractHistoryValue(messages, ['annual income', 'yearly income', 'salary', 'income']);

  const currentAnnualIncome = explicitAnnualIncome ?? (currentMonthlyIncome === undefined ? genericIncome : undefined);

  if (currentMonthlyIncome !== undefined) {
    return {
      annualIncome: explicitAnnualIncome,
      monthlyIncome: currentMonthlyIncome
    };
  }

  if (currentAnnualIncome !== undefined) {
    return {
      annualIncome: currentAnnualIncome,
      monthlyIncome: currentAnnualIncome / 12
    };
  }

  return {
    annualIncome: historyAnnualIncome,
    monthlyIncome: historyMonthlyIncome ?? (historyAnnualIncome !== undefined ? historyAnnualIncome / 12 : undefined)
  };
}

function extractNumber(text: string, labelPattern: RegExp): number | undefined {
  const match = text.match(labelPattern);
  if (!match) return undefined;
  const raw = match[match.length - 1].replace(/,/g, '');
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function extractMoney(text: string): number | undefined {
  const match = text.match(/\$?\s*([\d,]+(?:\.\d+)?)/);
  if (!match) return undefined;
  const raw = match[1].replace(/,/g, '');
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function extractLabeledMoney(text: string, label: RegExp): number | undefined {
  const match = text.match(new RegExp(`${label.source}\\s*:?\\s*\\$?\\s*([\\d,]+(?:\\.\\d+)?)`, 'i'));
  if (!match) return undefined;
  const raw = match[1].replace(/,/g, '');
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function extractHomePriceFromText(text: string): number | undefined {
  return extractNaturalValue(text, [
    /\busing\s+\$?([\d,.]+(?:\.\d+)?k?)\s+(?:home|house)\b/i,
    /\bfor\s+a[n]?\s+\$?([\d,.]+(?:\.\d+)?k?)\s+(?:home|house)\b/i,
    /\b\$?([\d,.]+(?:\.\d+)?k?)\s+(?:home|house)\b/i
  ]) ?? extractLabeledValue(text, ['home price', 'house price', 'price', 'home', 'house']);
}

function extractThreshold(text: string): number | undefined {
  const match = text.match(/threshold\s*=?\s*([\d.]+)/i) || text.match(/<=\s*([\d.]+)/);
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function extractPercent(text: string, label: RegExp): number | undefined {
  const match = text.match(new RegExp(`${label.source}\\s*:?\\s*([\\d.]+)\\s*%?`, 'i'));
  if (!match) return undefined;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : undefined;
}

function extractHomePriceFromHistory(messages: ChatMessage[]): number | undefined {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const text = messages[i].text;
    if (!text) continue;
    const homePrice = extractHomePriceFromText(text);
    if (homePrice !== undefined) return homePrice;
  }
  return undefined;
}

function extractValueWithHistory(text: string, messages: ChatMessage[], labels: string[]): number | undefined {
  const currentValue = extractLabeledValue(text, labels);
  if (currentValue !== undefined) {
    return currentValue;
  }
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const historyValue = extractLabeledValue(messages[i].text, labels);
    if (historyValue !== undefined) {
      return historyValue;
    }
  }
  return undefined;
}

function buildScenarioInput(text: string, messages: ChatMessage[]): PaymentInput {
  const incomeValues = extractIncomeValues(text, messages);
  const annualIncome = incomeValues.annualIncome;
  const monthlyIncome = incomeValues.monthlyIncome;
  const rate = extractNaturalValue(text, [
    /\bat\s*\$?([\d,.]+(?:\.\d+)?k?)\s*%\b/i,
    /\binterest(?: rate)?\s*(?:is|=|:)?\s*\$?([\d,.]+(?:\.\d+)?k?)\s*%\b/i
  ]) ?? extractValueWithHistory(text, messages, ['mortgage rate', 'interest rate', 'rate', 'apr']);
  const termYears = extractValueWithHistory(text, messages, ['term', 'years']) ?? 30;
  const currentHomePrice = extractHomePriceFromText(text);
  const homePrice = currentHomePrice ?? extractHomePriceFromHistory(messages);
  const currentLoanAmount = extractLabeledValue(text, ['loan amount']);
  const historyLoanAmount = extractHistoryValue(messages, ['loan amount']);
  const currentDownpaymentPercent = extractNaturalValue(text, [
    /\b\$?([\d,.]+(?:\.\d+)?k?)\s*%\s*down\b/i,
    /\bwith\s+\$?([\d,.]+(?:\.\d+)?k?)\s*%\s*down\b/i
  ]) ?? extractLabeledValue(text, ['down payment %', 'downpayment %', 'down payment percent', 'down percent', 'down']);
  const historyDownpaymentPercent = extractHistoryValue(messages, ['down payment %', 'downpayment %', 'down payment percent', 'down percent', 'down']);
  const currentDownpaymentDollars = extractNaturalValue(text, [
    /\bput\s+\$?([\d,.]+(?:\.\d+)?k?)\s+down\b/i,
    /\bdown payment of\s+\$?([\d,.]+(?:\.\d+)?k?)\b/i
  ]) ?? extractLabeledValue(text, ['down payment']);
  const historyDownpaymentDollars = extractHistoryValue(messages, ['down payment']);
  const currentScenarioOverridesLoan = currentHomePrice !== undefined
    || currentDownpaymentPercent !== undefined
    || currentDownpaymentDollars !== undefined;
  const loanAmount = currentLoanAmount ?? (currentScenarioOverridesLoan ? undefined : historyLoanAmount);
  const downpaymentDollars = currentDownpaymentDollars ?? historyDownpaymentDollars;
  let effectiveHomePrice = homePrice;
  if (!effectiveHomePrice && text.toLowerCase().includes('median example above')) {
    effectiveHomePrice = 400000;
  }
  if (!effectiveHomePrice && (annualIncome !== undefined || monthlyIncome !== undefined || rate !== undefined || currentDownpaymentPercent !== undefined || currentDownpaymentDollars !== undefined)) {
    effectiveHomePrice = 400000;
  }
  let effectiveDownpaymentPercent = currentDownpaymentPercent ?? historyDownpaymentPercent;
  if (currentDownpaymentDollars !== undefined && effectiveHomePrice) {
    effectiveDownpaymentPercent = (currentDownpaymentDollars / effectiveHomePrice) * 100;
  }
  if (effectiveDownpaymentPercent === undefined && downpaymentDollars !== undefined && effectiveHomePrice) {
    effectiveDownpaymentPercent = (downpaymentDollars / effectiveHomePrice) * 100;
  }
  if (effectiveDownpaymentPercent === undefined && loanAmount !== undefined && effectiveHomePrice) {
    effectiveDownpaymentPercent = ((effectiveHomePrice - loanAmount) / effectiveHomePrice) * 100;
  }
  return {
    annualIncome,
    monthlyIncome,
    mortgageRatePercent: rate,
    termYears,
    homePrice: effectiveHomePrice,
    loanAmount,
    downpaymentPercent: effectiveDownpaymentPercent
  };
}

function formatScenarioResult(input: PaymentInput) {
  if (input.homePrice === undefined || input.mortgageRatePercent === undefined) {
    return null;
  }
  const scenario = calculateScenario({
    annualIncome: input.annualIncome ?? (input.monthlyIncome !== undefined ? input.monthlyIncome * 12 : undefined),
    homePrice: input.homePrice,
    downpaymentPercent: input.downpaymentPercent ?? 0,
    mortgageRatePercent: input.mortgageRatePercent,
    termYears: input.termYears ?? 30,
    loanAmount: input.loanAmount
  });
  return [
    input.homePrice === 400000 ? `Using a ${formatMoney(input.homePrice)} home (median example above),` : null,
    ...formatIncomeLines(scenario.annualIncome, scenario.monthlyIncome),
    `Down payment: ${formatMoney(scenario.downPayment)}`,
    `Loan amount: ${formatMoney(scenario.loanAmount)}`,
    `Estimated monthly payment: $${scenario.payment.toFixed(2)}`,
    `Estimated yearly payment: ${formatMoneyCents(scenario.payment * 12)}`,
    `Affordability: ${scenario.affordability}`
  ].filter(Boolean).join('\n');
}

function helpText() {
  return [
    'Try commands like:',
    '- "list regions" or "regions"',
    '- "years"',
    '- "record Metro A 2023"',
    '- "summary year 2024 threshold 5"',
    '- "price-to-income ratio for Metro A every year"',
    '- "monthly payment price 400000 down 20 rate 6.5 term 30"',
    '- "price to income ratio price 350000 income 70000"',
    '- "calc (350000 - 70000) / 12"'
  ].join('\n');
}

export default function Chatbot() {
  const [data, setData] = useState<ProcessedRecord[] | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Ask me anything. I can answer general questions and project-specific affordability questions. Type "help" for examples.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadData().then((rows) => {
      if (mounted) setData(rows);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const regionMap = useMemo(() => {
    if (!data) return new Map<string, string>();
    const map = new Map<string, string>();
    data.forEach((row) => {
      map.set(row.region.toLowerCase(), row.region);
    });
    return map;
  }, [data]);

  const regions = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((d) => d.region))).sort();
  }, [data]);

  const years = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((d) => d.year))).sort();
  }, [data]);

  const quickActions = useMemo<QuickAction[]>(() => {
    const featuredRegion = regions[0] ?? 'Metro A';
    const latestYear = years[years.length - 1] ?? 2024;
    return [
      {
        label: 'List Regions',
        description: 'See every region available in the dataset.',
        prompt: 'regions'
      },
      {
        label: 'Show Year Range',
        description: 'Check what years are included in the data.',
        prompt: 'years'
      },
      {
        label: 'Latest Summary',
        description: `Get affordability status for ${latestYear}.`,
        prompt: `summary year ${latestYear} threshold 5`
      },
      {
        label: 'Region Trend',
        description: `View price-to-income trend for ${featuredRegion}.`,
        prompt: `price-to-income ratio for ${featuredRegion} every year`
      },
      {
        label: 'Mortgage Example',
        description: 'Run a sample monthly payment scenario.',
        prompt: 'monthly payment price 400000 down 20 rate 6.5 term 30'
      },
      {
        label: 'How To Use',
        description: 'Show example commands and supported questions.',
        prompt: 'help'
      }
    ];
  }, [regions, years]);

  function detectRegion(text: string): string | undefined {
    const lower = text.toLowerCase();
    for (const [key, value] of regionMap.entries()) {
      if (lower.includes(key)) return value;
    }
    return undefined;
  }

  function buildRatioResponse(text: string): string | null {
    const lower = text.toLowerCase();
    const hasRatioIntent = lower.includes('ratio') || lower.includes('price to income') || lower.includes('price-to-income');
    if (!hasRatioIntent) {
      return null;
    }

    const region = detectRegion(text);
    const year = extractYear(text);
    const wantsTimeline = wantsEveryYear(text);

    if (region && (wantsTimeline || !year)) {
      const records = data
        .filter((d) => d.region === region)
        .sort((a, b) => a.year - b.year);

      if (records.length === 0) {
        return `No records found for ${region}.`;
      }

      return [
        `Price-to-income ratio for ${region} by year:`,
        ...records.map((record) => formatRatioCalculation(record))
      ].join('\n');
    }

    if (!region && wantsTimeline) {
      const sections = regions.map((regionName) => {
        const records = data
          .filter((d) => d.region === regionName)
          .sort((a, b) => a.year - b.year);
        return [
          `${regionName}:`,
          ...records.map((record) => formatRatioCalculation(record))
        ].join('\n');
      });

      return [
        'Price-to-income ratio by region for every year:',
        ...sections
      ].join('\n\n');
    }

    if (region && year) {
      const record = data.find((d) => d.region === region && d.year === year);
      if (!record) return `No record found for ${region} in ${year}.`;
      return `Price-to-income ratio for ${region} ${year}: ${formatMoney(record.median_home_price)} / ${formatMoney(record.median_income)} = ${record.price_to_income.toFixed(2)}.`;
    }

    const price = extractNumber(text, /(price|home|house)\s*=?\s*\$?([\d,]+(?:\.\d+)?)/i) ?? extractMoney(text);
    const income = extractNumber(text, /(income|salary)\s*=?\s*\$?([\d,]+(?:\.\d+)?)/i);
    if (!price || !income) {
      return 'Please provide a region, a year, or price and income, e.g., "price-to-income ratio for Metro A every year" or "ratio price 350000 income 70000".';
    }

    return `Price-to-income ratio: ${formatMoney(price)} / ${formatMoney(income)} = ${(price / income).toFixed(2)}.`;
  }

  function handleMessage(text: string) {
    if (!data) {
      return 'Loading data. Try again in a moment.';
    }

    const lower = text.toLowerCase();
    if (lower.includes('help') || lower.includes('commands')) {
      return helpText();
    }

    if (lower.includes('loan amount')) {
      const labeled = extractLabeledMoney(text, /loan amount/);
      if (labeled !== undefined) {
        return `Loan amount: ${formatMoney(labeled)}`;
      }
    }

    if (lower.includes('down payment')) {
      const labeled = extractLabeledMoney(text, /down payment/);
      if (labeled !== undefined) {
        return `Down payment: ${formatMoney(labeled)}`;
      }
    }

    if (lower.includes('regions')) {
      return `Regions: ${regions.join(', ')}`;
    }

    if (lower.includes('years')) {
      return `Years: ${years.join(', ')}`;
    }

    if (lower.includes('summary') || lower.includes('affordability')) {
      const year = extractYear(text);
      if (!year) return 'Please specify a year, e.g., "summary year 2024".';
      const threshold = extractThreshold(text) ?? 5;
      const rows = data
        .filter((d) => d.year === year)
        .map((d) => ({
          region: d.region,
          price_to_income: d.price_to_income,
          affordable: d.price_to_income <= threshold
        }));
      if (rows.length === 0) return `No records found for year ${year}.`;
      const affordableCount = rows.filter((r) => r.affordable).length;
      return [
        `Affordability summary for ${year} (threshold ${threshold}):`,
        `Affordable regions: ${affordableCount}/${rows.length}`,
        rows
          .map((r) => `${r.region}: ${r.price_to_income.toFixed(2)} (${r.affordable ? 'affordable' : 'not affordable'})`)
          .join('\n')
      ].join('\n');
    }

    const ratioReply = buildRatioResponse(text);
    if (ratioReply) {
      return ratioReply;
    }

    if (lower.includes('payment') || lower.includes('mortgage')) {
      const labeledPrice = extractLabeledMoney(text, /(price|home price|house price)/);
      const labeledDownpayment = extractLabeledMoney(text, /down payment/);
      const labeledLoanAmount = extractLabeledMoney(text, /loan amount/);
      const paymentInput: PaymentInput = {
        homePrice: labeledPrice ?? extractNumber(text, /(price|home|house)\s*=?\s*\$?([\d,]+(?:\.\d+)?)/i),
        downpaymentPercent: extractNumber(text, /(down\s*payment\s*percent|downpayment\s*percent|down\s*percent|down)\s*%?\s*=?\s*([\d,]+(?:\.\d+)?)/i),
        mortgageRatePercent: extractNumber(text, /(rate|interest|apr)\s*%?\s*=?\s*([\d,]+(?:\.\d+)?)/i),
        termYears: extractNumber(text, /(term|years)\s*=?\s*([\d,]+(?:\.\d+)?)/i),
        loanAmount: labeledLoanAmount
      };
      if (paymentInput.homePrice === undefined) {
        paymentInput.homePrice = extractMoney(text);
      }
      if (paymentInput.downpaymentPercent === undefined && labeledDownpayment !== undefined && paymentInput.homePrice !== undefined) {
        paymentInput.downpaymentPercent = (labeledDownpayment / paymentInput.homePrice) * 100;
      }
      const missing: string[] = [];
      if (paymentInput.homePrice === undefined && paymentInput.loanAmount === undefined) missing.push('price or loan amount');
      if (paymentInput.downpaymentPercent === undefined && paymentInput.loanAmount === undefined) missing.push('down payment percent');
      if (paymentInput.mortgageRatePercent === undefined) missing.push('rate');
      if (paymentInput.termYears === undefined) paymentInput.termYears = 30;
      if (missing.length > 0) {
        return 'Please include price, down payment percent, and rate. Example: "monthly payment price 400000 down 20 rate 6.5 term 30".';
      }
      if (paymentInput.homePrice === undefined && paymentInput.loanAmount !== undefined) {
        paymentInput.homePrice = paymentInput.loanAmount;
        paymentInput.downpaymentPercent = 0;
      }
      const scenario = calculateScenario({
        homePrice: paymentInput.homePrice,
        downpaymentPercent: paymentInput.downpaymentPercent ?? 0,
        mortgageRatePercent: paymentInput.mortgageRatePercent!,
        termYears: paymentInput.termYears,
        loanAmount: paymentInput.loanAmount
      });
      return [
        ...formatIncomeLines(scenario.annualIncome, scenario.monthlyIncome),
        `Loan amount: ${formatMoney(scenario.loanAmount)}`,
        `Down payment: ${formatMoney(scenario.downPayment)}`,
        `Estimated monthly payment: $${scenario.payment.toFixed(2)} (term ${scenario.termYears} years)`,
        `Estimated yearly payment: ${formatMoneyCents(scenario.payment * 12)}`
      ].join('\n');
    }

    const calcMatch = lower.match(/^(calc|calculate|math)\s+(.+)$/);
    const rawExpression = calcMatch ? calcMatch[2] : null;
    if (rawExpression || /^[0-9\s.+\-*/^()%]+$/.test(lower)) {
      const expression = rawExpression ?? text;
      try {
        const result = evaluate(expression);
        return `Result: ${String(result)}`;
      } catch {
        return 'Please provide a valid math expression. Example: "calc (350000 - 70000) / 12".';
      }
    }

    const region = detectRegion(text);
    const year = extractYear(text);
    if (region && year) {
      const record = data.find((d) => d.region === region && d.year === year);
      if (!record) return `No record found for ${region} in ${year}.`;
      return [
        `${region} ${year}:`,
        `Median home price: ${formatMoney(record.median_home_price)}`,
        `Median income: ${formatMoney(record.median_income)}`,
        `Mortgage rate: ${record.mortgage_rate_percent}%`,
        `Price-to-income ratio: ${record.price_to_income.toFixed(2)}`
      ].join('\n');
    }

    return `I did not understand that. Type "help" for examples.`;
  }

  function handleLocalFirst(text: string): string | null {
    const lower = text.toLowerCase();
    const ratioReply = buildRatioResponse(text);
    if (ratioReply) {
      return ratioReply;
    }
    const scenarioInput = buildScenarioInput(text, messages);
    const hasScenarioSignals = [
      'income',
      'salary',
      'down payment',
      'mortgage',
      'rate',
      'apr',
      'home',
      'house',
      'loan amount',
      'monthly payment',
      'affordability'
    ].some((term) => lower.includes(term))
      || /\b\d+(?:\.\d+)?\s*%\s*down\b/i.test(text)
      || /\bput\s+\$?[\d,.]+(?:\.\d+)?k?\s+down\b/i.test(text);

    if (hasScenarioSignals) {
      const scenarioReply = formatScenarioResult(scenarioInput);
      if (scenarioReply) {
        return scenarioReply;
      }
    }

    if (lower.includes('monthly income') && (lower.includes('down payment') || lower.includes('loan amount'))) {
      const homePrice = extractLabeledMoney(text, /(home|house|price|home price|house price)/);
      const monthlyIncome = extractLabeledMoney(text, /monthly income/);
      const downPayment = extractLabeledMoney(text, /down payment/);
      const loanAmount = extractLabeledMoney(text, /loan amount/);
      const estimatedPayment = extractLabeledMoney(text, /estimated monthly payment|monthly payment/);
      const affordabilityMatch = text.match(/affordability\s*:?[\s]*([a-z]+)/i);
      const affordability = affordabilityMatch ? affordabilityMatch[1].toLowerCase() : undefined;
      if (monthlyIncome || downPayment || loanAmount || estimatedPayment) {
        const lines = [
          homePrice ? `Using a ${formatMoney(homePrice)} home (median example above),` : null,
          ...formatIncomeLines(monthlyIncome !== undefined ? monthlyIncome * 12 : undefined, monthlyIncome),
          downPayment !== undefined ? `Down payment: ${formatMoney(downPayment)}` : null,
          loanAmount !== undefined ? `Loan amount: ${formatMoney(loanAmount)}` : null,
          estimatedPayment !== undefined ? `Estimated monthly payment: ${formatMoney(estimatedPayment)}` : null,
          estimatedPayment !== undefined ? `Estimated yearly payment: ${formatMoneyCents(estimatedPayment * 12)}` : null,
          affordability ? `Affordability: ${affordability}` : null
        ].filter(Boolean) as string[];
        return lines.join('\n');
      }
    }
    if (lower.includes('loan amount')) {
      const labeled = extractLabeledMoney(text, /loan amount/);
      if (labeled !== undefined) {
        return `Loan amount: ${formatMoney(labeled)}`;
      }
    }
    if (lower.includes('down payment')) {
      const labeled = extractLabeledMoney(text, /down payment/);
      if (labeled !== undefined) {
        return `Down payment: ${formatMoney(labeled)}`;
      }
    }
    if (lower.includes('payment') || lower.includes('mortgage')) {
      const labeledPrice = extractLabeledMoney(text, /(price|home price|house price)/);
      const labeledDownpayment = extractLabeledMoney(text, /down payment/);
      const labeledLoanAmount = extractLabeledMoney(text, /loan amount/);
      const paymentInput: PaymentInput = {
        homePrice: labeledPrice ?? extractNumber(text, /(price|home|house)\s*=?\s*\$?([\d,]+(?:\.\d+)?)/i),
        downpaymentPercent: extractNumber(text, /(down\s*payment\s*percent|downpayment\s*percent|down\s*percent|down)\s*%?\s*=?\s*([\d,]+(?:\.\d+)?)/i),
        mortgageRatePercent: extractNumber(text, /(rate|interest|apr)\s*%?\s*=?\s*([\d,]+(?:\.\d+)?)/i),
        termYears: extractNumber(text, /(term|years)\s*=?\s*([\d,]+(?:\.\d+)?)/i),
        loanAmount: labeledLoanAmount
      };
      if (paymentInput.homePrice === undefined) {
        paymentInput.homePrice = extractMoney(text);
      }
      if (paymentInput.downpaymentPercent === undefined && labeledDownpayment !== undefined && paymentInput.homePrice !== undefined) {
        paymentInput.downpaymentPercent = (labeledDownpayment / paymentInput.homePrice) * 100;
      }
      if (paymentInput.termYears === undefined) paymentInput.termYears = 30;
      const hasRate = paymentInput.mortgageRatePercent !== undefined;
      const hasPriceOrLoan = paymentInput.homePrice !== undefined || paymentInput.loanAmount !== undefined;
      const hasDownPercentOrLoan = paymentInput.downpaymentPercent !== undefined || paymentInput.loanAmount !== undefined;
      if (hasRate && hasPriceOrLoan && hasDownPercentOrLoan) {
        if (paymentInput.homePrice === undefined && paymentInput.loanAmount !== undefined) {
          paymentInput.homePrice = paymentInput.loanAmount;
          paymentInput.downpaymentPercent = 0;
        }
        const scenario = calculateScenario({
          homePrice: paymentInput.homePrice,
          downpaymentPercent: paymentInput.downpaymentPercent ?? 0,
          mortgageRatePercent: paymentInput.mortgageRatePercent!,
          termYears: paymentInput.termYears,
          loanAmount: paymentInput.loanAmount
        });
        return [
          ...formatIncomeLines(scenario.annualIncome, scenario.monthlyIncome),
          `Loan amount: ${formatMoney(scenario.loanAmount)}`,
          `Down payment: ${formatMoney(scenario.downPayment)}`,
          `Estimated monthly payment: $${scenario.payment.toFixed(2)} (term ${scenario.termYears} years)`,
          `Estimated yearly payment: ${formatMoneyCents(scenario.payment * 12)}`
        ].join('\n');
      }
    }
    return null;
  }

  async function sendMessageFromText(text: string, clearInput = false) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = { role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    if (clearInput) {
      setInput('');
    }
    setIsLoading(true);

    try {
      const localReply = handleLocalFirst(trimmed);
      if (localReply) {
        setMessages((prev) => [...prev, { role: 'assistant', text: localReply }]);
        return;
      }
      const apiMessages = [...messages, userMsg].map((msg) => ({
        role: msg.role,
        content: msg.text
      }));
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });
      if (!resp.ok) {
        throw new Error(`API error (${resp.status})`);
      }
      const data = await resp.json();
      const replyText = typeof data?.reply === 'string' && data.reply.trim().length > 0
        ? data.reply
        : 'No response from the AI service.';
      setMessages((prev) => [...prev, { role: 'assistant', text: replyText }]);
    } catch (err) {
      const fallback = handleMessage(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: fallback
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function sendMessage() {
    void sendMessageFromText(input, true);
  }

  return (
    <div className="chat-container">
      <h2>Affordability Chatbot</h2>
      <p className="chat-help">
        How to use: Ask a housing affordability question in plain English, include details like region, year, income, home price, down payment, and interest rate when possible, then press Enter or click Send.
        Try: "Metro A 2024 affordability summary", "monthly payment for 400000 home at 6.5% with 20% down", or "price to income ratio price 350000 income 70000".
      </p>
      <section className="quick-actions" aria-label="Quick actions">
        <h3>Quick Actions</h3>
        <p>
          Tap any button to instantly run a useful prompt and discover key information faster.
        </p>
        <div className="quick-action-grid">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="quick-action-button"
              onClick={() => {
                void sendMessageFromText(action.prompt);
              }}
              disabled={isLoading}
            >
              <span className="quick-action-title">{action.label}</span>
              <span className="quick-action-description">{action.description}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="chat-log" aria-live="polite">
        {messages.map((msg, idx) => (
          <div key={`${msg.role}-${idx}`} className={`chat-message ${msg.role}`}>
            <div className="chat-bubble">{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Ask about regions, years, payments, or affordability."
          aria-label="Chat input"
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
