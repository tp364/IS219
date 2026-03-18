import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "data", "processed.json");

let cachedData = null;

async function loadData() {
  if (cachedData) return cachedData;
  const raw = await fs.readFile(dataPath, "utf8");
  cachedData = JSON.parse(raw);
  return cachedData;
}

function mortgageMonthlyPayment({ home_price, downpayment_percent, mortgage_rate_percent, term_years }) {
  const downpayment = home_price * (downpayment_percent / 100);
  const loan_amount = home_price - downpayment;
  const n = term_years * 12;
  const rate = mortgage_rate_percent / 100 / 12;
  const monthly_payment_usd = rate === 0
    ? loan_amount / n
    : (loan_amount * rate) / (1 - Math.pow(1 + rate, -n));
  return { loan_amount, downpayment, monthly_payment_usd };
}

const server = new McpServer({
  name: "student-reality-lab",
  version: "1.0.0"
});

server.tool(
  "list_regions",
  "List available regions and years from the processed dataset.",
  {},
  async () => {
    const data = await loadData();
    const regions = Array.from(new Set(data.map((d) => d.region))).sort();
    const years = Array.from(new Set(data.map((d) => d.year))).sort();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ regions, years, count: data.length }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "get_affordability_record",
  "Get a single affordability record for a region and year.",
  {
    region: z.string(),
    year: z.number()
  },
  async ({ region, year }) => {
    const data = await loadData();
    const record = data.find((d) => d.region === region && d.year === year);
    if (!record) {
      return {
        content: [
          { type: "text", text: `No record found for region="${region}" year=${year}.` }
        ]
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(record, null, 2) }]
    };
  }
);

server.tool(
  "affordability_summary",
  "Summarize price-to-income affordability for a given year (<=5 is considered affordable).",
  {
    year: z.number(),
    threshold: z.number().optional()
  },
  async ({ year, threshold }) => {
    const data = await loadData();
    const limit = typeof threshold === "number" ? threshold : 5;
    const rows = data
      .filter((d) => d.year === year)
      .map((d) => ({
        region: d.region,
        year: d.year,
        price_to_income: d.price_to_income,
        affordable_within_five_years: d.price_to_income <= limit
      }));
    return {
      content: [{ type: "text", text: JSON.stringify({ year, threshold: limit, rows }, null, 2) }]
    };
  }
);

server.tool(
  "calculate_monthly_payment",
  "Calculate monthly mortgage payment given price, down payment %, rate, and term.",
  {
    home_price: z.number(),
    downpayment_percent: z.number(),
    mortgage_rate_percent: z.number(),
    term_years: z.number().optional()
  },
  async ({ home_price, downpayment_percent, mortgage_rate_percent, term_years }) => {
    const term = term_years ?? 30;
    const result = mortgageMonthlyPayment({
      home_price,
      downpayment_percent,
      mortgage_rate_percent,
      term_years: term
    });
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ term_years: term, ...result }, null, 2)
        }
      ]
    };
  }
);

server.tool(
  "price_to_income",
  "Compute price-to-income ratio for a home price and annual income.",
  {
    home_price: z.number(),
    annual_income: z.number()
  },
  async ({ home_price, annual_income }) => {
    const ratio = home_price / annual_income;
    return {
      content: [{ type: "text", text: JSON.stringify({ price_to_income: ratio }, null, 2) }]
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
