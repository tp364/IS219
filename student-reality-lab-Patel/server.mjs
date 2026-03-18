import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs/promises";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const basePath = "/IS219";
const dataPath = path.join(__dirname, "data", "processed.json");
const readmePath = path.join(__dirname, "README.md");

app.use(express.json({ limit: "1mb" }));

let cachedData = null;
let cachedReadme = null;

async function loadData() {
  if (cachedData) return cachedData;
  const raw = await fs.readFile(dataPath, "utf8");
  cachedData = JSON.parse(raw);
  return cachedData;
}

async function loadReadme() {
  if (cachedReadme) return cachedReadme;
  cachedReadme = await fs.readFile(readmePath, "utf8");
  return cachedReadme;
}

function extractYear(text) {
  const match = text.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : undefined;
}

function extractLabeledNumber(text, labels) {
  const pattern = new RegExp(`(?:${labels.join("|")})\\s*:?\\s*\\$?\\s*([\\d,]+(?:\\.\\d+)?)\\s*%?`, "i");
  const match = text.match(pattern);
  if (!match) return undefined;
  const value = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(value) ? value : undefined;
}

function parseFlexibleNumber(raw) {
  const cleaned = raw.toLowerCase().replace(/[$,\s]/g, "");
  const multiplier = cleaned.endsWith("k") ? 1000 : 1;
  const base = multiplier === 1000 ? cleaned.slice(0, -1) : cleaned;
  const value = Number(base);
  return Number.isFinite(value) ? value * multiplier : undefined;
}

function extractNaturalNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const value = parseFlexibleNumber(match[1]);
    if (value !== undefined) return value;
  }
  return undefined;
}

function extractHistoryNumber(messages, labels) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const value = extractLabeledNumber(String(messages[i]?.content ?? ""), labels);
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
}

function extractIncomeValues(message, messages) {
  const currentMonthlyIncome = extractNaturalNumber(message, [
    /monthly income[^0-9$]*([$]?\d[\d,.]*(?:\.\d+)?k?)/i,
    /(?:i|we)\s*(?:make|earn|bring home|take home|get paid).*?\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:month|mo|monthly)\b/i,
    /\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:month|mo|monthly)\b/i
  ]) ?? extractLabeledNumber(message, ["monthly income"]);

  const explicitAnnualIncome = extractNaturalNumber(message, [
    /annual income[^0-9$]*([$]?\d[\d,.]*(?:\.\d+)?k?)/i,
    /yearly income[^0-9$]*([$]?\d[\d,.]*(?:\.\d+)?k?)/i,
    /(?:i|we)\s*(?:make|earn|bring home|take home|get paid).*?\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:year|yr|annual|annually|yearly)\b/i,
    /(?:income|salary)\s*(?:is|=|:)?\s*\$?([\d,.]+(?:\.\d+)?k?)\s*(?:a|per|\/)?\s*(?:year|yr|annual|annually|yearly)\b/i
  ]) ?? extractLabeledNumber(message, ["annual income", "yearly income"]);

  const genericIncome = extractNaturalNumber(message, [
    /(?:i|we)\s*(?:make|earn|bring home|take home|get paid).*?\$?([\d,.]+(?:\.\d+)?k?)\b/i,
    /(?:income|salary)\s*(?:is|=|:)?\s*\$?([\d,.]+(?:\.\d+)?k?)\b/i
  ]);

  const historyMonthlyIncome = extractHistoryNumber(messages, ["monthly income"]);
  const historyAnnualIncome = extractHistoryNumber(messages, ["annual income", "yearly income", "salary", "income"]);

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

function mortgageMonthlyPayment({ homePrice, downpaymentPercent, mortgageRatePercent, termYears, loanAmount }) {
  const downpayment = homePrice * (downpaymentPercent / 100);
  const effectiveLoanAmount = loanAmount ?? (homePrice - downpayment);
  const n = termYears * 12;
  const rate = mortgageRatePercent / 100 / 12;
  const monthlyPayment = rate === 0
    ? effectiveLoanAmount / n
    : (effectiveLoanAmount * rate) / (1 - Math.pow(1 + rate, -n));
  return { downpayment, loanAmount: effectiveLoanAmount, monthlyPayment };
}

function detectRegion(text, data) {
  const lower = text.toLowerCase();
  const regions = Array.from(new Set(data.map((d) => d.region)));
  for (const region of regions) {
    if (lower.includes(region.toLowerCase())) return region;
  }
  return undefined;
}

function buildDatasetOverview(data) {
  const years = Array.from(new Set(data.map((d) => d.year))).sort();
  const regions = Array.from(new Set(data.map((d) => d.region))).sort();
  const latestYear = years[years.length - 1];
  const latestRecords = data.filter((d) => d.year === latestYear);
  const summary = latestRecords.map((d) => ({
    region: d.region,
    year: d.year,
    median_home_price: d.median_home_price,
    median_income: d.median_income,
    price_to_income: Number(d.price_to_income.toFixed(2)),
    mortgage_rate_percent: d.mortgage_rate_percent
  }));
  return {
    years,
    regions,
    latest_year: latestYear,
    latest_records: summary
  };
}

function buildRelevantDatasetContext(message, data) {
  const year = extractYear(message);
  const region = detectRegion(message, data);
  const records = data.filter((d) => {
    if (year && d.year !== year) return false;
    if (region && d.region !== region) return false;
    return true;
  });
  if (records.length === 0) return "";
  return JSON.stringify(records.slice(0, 8), null, 2);
}

function buildScenarioContext(message, messages, data) {
  const incomeValues = extractIncomeValues(message, messages);
  const annualIncome = incomeValues.annualIncome;
  const monthlyIncomeExplicit = incomeValues.monthlyIncome;
  const rate = extractNaturalNumber(message, [
    /\bat\s*\$?([\d,.]+(?:\.\d+)?k?)\s*%\b/i,
    /\binterest(?: rate)?\s*(?:is|=|:)?\s*\$?([\d,.]+(?:\.\d+)?k?)\s*%\b/i
  ]) ?? extractLabeledNumber(message, ["mortgage rate", "interest rate", "rate", "apr"])
    ?? extractHistoryNumber(messages, ["mortgage rate", "interest rate", "rate", "apr"]);
  const termYears = extractLabeledNumber(message, ["term", "years"])
    ?? extractHistoryNumber(messages, ["term", "years"])
    ?? 30;
  const currentHomePrice = extractNaturalNumber(message, [
    /\busing\s+\$?([\d,.]+(?:\.\d+)?k?)\s+(?:home|house)\b/i,
    /\bfor\s+a[n]?\s+\$?([\d,.]+(?:\.\d+)?k?)\s+(?:home|house)\b/i,
    /\b\$?([\d,.]+(?:\.\d+)?k?)\s+(?:home|house)\b/i
  ]) ?? extractLabeledNumber(message, ["home price", "house price", "price", "home", "house"]);
  const homePrice = currentHomePrice
    ?? extractHistoryNumber(messages, ["home price", "house price", "price", "home", "house"]);
  const currentLoanAmount = extractLabeledNumber(message, ["loan amount"]);
  const historyLoanAmount = extractHistoryNumber(messages, ["loan amount"]);
  const currentDownpaymentPercent = extractNaturalNumber(message, [
    /\b\$?([\d,.]+(?:\.\d+)?k?)\s*%\s*down\b/i,
    /\bwith\s+\$?([\d,.]+(?:\.\d+)?k?)\s*%\s*down\b/i
  ]) ?? extractLabeledNumber(message, ["down payment %", "downpayment %", "down percent", "down payment percent", "down"]);
  const historyDownpaymentPercent = extractHistoryNumber(messages, ["down payment %", "downpayment %", "down percent", "down payment percent", "down"]);
  const currentDownpaymentDollars = extractNaturalNumber(message, [
    /\bput\s+\$?([\d,.]+(?:\.\d+)?k?)\s+down\b/i,
    /\bdown payment of\s+\$?([\d,.]+(?:\.\d+)?k?)\b/i
  ]) ?? extractLabeledNumber(message, ["down payment"]);
  const historyDownpaymentDollars = extractHistoryNumber(messages, ["down payment"]);
  const currentScenarioOverridesLoan = currentHomePrice !== undefined
    || currentDownpaymentPercent !== undefined
    || currentDownpaymentDollars !== undefined;
  const loanAmount = currentLoanAmount ?? (currentScenarioOverridesLoan ? undefined : historyLoanAmount);
  const downpaymentDollars = currentDownpaymentDollars ?? historyDownpaymentDollars;
  const inferredHomePrice = homePrice ?? (message.toLowerCase().includes("median example above") ? 400000 : undefined);
  const effectiveHomePrice = inferredHomePrice ?? loanAmount ?? 400000;
  const effectiveDownpaymentPercent = (currentDownpaymentPercent ?? historyDownpaymentPercent)
    ?? (downpaymentDollars && effectiveHomePrice ? (downpaymentDollars / effectiveHomePrice) * 100 : 0);
  const monthlyIncome = monthlyIncomeExplicit ?? (annualIncome ? annualIncome / 12 : undefined);
  if (rate === undefined && annualIncome === undefined && monthlyIncomeExplicit === undefined && homePrice === undefined && loanAmount === undefined) {
    return "";
  }
  if (rate === undefined) {
    return JSON.stringify({
      detected_inputs: {
        annual_income: annualIncome,
        monthly_income: monthlyIncome,
        home_price: effectiveHomePrice,
        downpayment_percent: effectiveDownpaymentPercent,
        loan_amount: loanAmount,
        term_years: termYears
      }
    }, null, 2);
  }
  const payment = mortgageMonthlyPayment({
    homePrice: effectiveHomePrice,
    downpaymentPercent: effectiveDownpaymentPercent,
    mortgageRatePercent: rate,
    termYears,
    loanAmount
  });
  const affordability = monthlyIncome === undefined
    ? "unknown"
    : monthlyIncome >= payment.monthlyPayment * 2
      ? "definitely"
      : monthlyIncome >= payment.monthlyPayment
        ? "maybe"
        : "unlikely";
  return JSON.stringify({
    detected_inputs: {
      annual_income: annualIncome,
      monthly_income: monthlyIncome,
      home_price: effectiveHomePrice,
      downpayment_percent: Number(effectiveDownpaymentPercent.toFixed(2)),
      mortgage_rate_percent: rate,
      term_years: termYears,
      loan_amount_override: loanAmount
    },
    computed_result: {
      down_payment: Number(payment.downpayment.toFixed(2)),
      loan_amount: Number(payment.loanAmount.toFixed(2)),
      estimated_monthly_payment: Number(payment.monthlyPayment.toFixed(2)),
      estimated_yearly_payment: Number((payment.monthlyPayment * 12).toFixed(2)),
      affordability
    }
  }, null, 2);
}

function buildProjectContext(readme, data) {
  const overview = buildDatasetOverview(data);
  const essentialQuestionMatch = readme.match(/## Essential Question[\s\S]*?\n\n([^\n]+)/);
  const claimMatch = readme.match(/## Claim \(Hypothesis\)[\s\S]*?\n\n([^\n]+)/);
  return JSON.stringify({
    essential_question: essentialQuestionMatch ? essentialQuestionMatch[1].trim() : null,
    claim: claimMatch ? claimMatch[1].trim() : null,
    dataset_overview: overview
  }, null, 2);
}

function toInputMessage(role, text) {
  return {
    role,
    content: [{ type: "input_text", text }]
  };
}

app.post("/api/chat", async (req, res) => {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(400).json({ error: "Missing OPENAI_API_KEY on the server." });
  }

  const { messages } = req.body ?? {};
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: "Expected { messages: [...] }." });
  }

  const userMessage = messages.slice().reverse().find((m) => m?.role === "user")?.content ?? "";
  const data = await loadData();
  const readme = await loadReadme();
  const projectContext = buildProjectContext(readme, data);
  const relevantDataContext = buildRelevantDatasetContext(String(userMessage), data);
  const scenarioContext = buildScenarioContext(String(userMessage), messages, data);

  const systemPrompt = [
    "You are a helpful assistant for a housing affordability project.",
    "Answer any question concisely and clearly.",
    "Use the project context and dataset context below when relevant.",
    "If the user asks a housing affordability or mortgage question and computed_result is available, use those numbers directly.",
    "If the user gives incomplete housing inputs but refers to a prior example above, use the prior example from the conversation.",
    "If no prior example is explicit and the user asks for a scenario based on the median example above, use a $400,000 home as the example.",
    "When you provide a scenario answer, include Annual income and Monthly income when available, plus Down payment, Loan amount, Estimated monthly payment, Estimated yearly payment, and Affordability whenever enough information exists.",
    "If the answer is not in the dataset, say that clearly and answer generally rather than inventing project facts."
  ].join(" ");

  const contextBlocks = [
    `Project context:\n${projectContext}`,
    relevantDataContext ? `Relevant dataset records:\n${relevantDataContext}` : "",
    scenarioContext ? `Scenario context:\n${scenarioContext}` : ""
  ].filter(Boolean).join("\n\n");

  const input = [
    toInputMessage("system", `${systemPrompt}\n\n${contextBlocks}`),
    ...messages.map((m) => toInputMessage(m.role, String(m.content)))
  ];

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input
    });
    const reply = response.output_text ?? "";
    return res.json({ reply });
  } catch (err) {
    const message = err?.message || "OpenAI request failed.";
    return res.status(500).json({ error: message });
  }
});

app.use(basePath, express.static(path.join(__dirname, "dist")));

app.get("/", (req, res) => {
  res.redirect(`${basePath}/`);
});

app.get(`${basePath}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
