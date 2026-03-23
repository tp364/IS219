#!/usr/bin/env node

import readline from "node:readline";

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function sanitizeExpression(value) {
  const expression = String(value ?? "")
    .replace(/[xX]/g, "*")
    .trim();
  if (!/^[\d+\-*/().\s]+$/.test(expression)) {
    throw new Error("Expression contains unsupported characters.");
  }
  return expression;
}

function evaluateExpression(rawExpression) {
  const expression = sanitizeExpression(rawExpression);
  // Controlled eval with strict whitelist above.
  const result = Function(`"use strict"; return (${expression});`)();
  if (typeof result !== "number" || Number.isNaN(result) || !Number.isFinite(result)) {
    throw new Error("Expression did not produce a finite number.");
  }
  return result;
}

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

rl.on("line", (line) => {
  if (!line.trim()) return;

  let request;
  try {
    request = JSON.parse(line);
  } catch {
    return;
  }

  const { id, method, params } = request;

  try {
    if (method === "initialize") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "calculator-mcp", version: "1.0.0" },
          capabilities: {
            tools: {},
          },
        },
      });
      return;
    }

    if (method === "tools/list") {
      send({
        jsonrpc: "2.0",
        id,
        result: {
          tools: [
            {
              name: "calculate",
              description: "Evaluate a basic arithmetic expression.",
              inputSchema: {
                type: "object",
                properties: {
                  expression: { type: "string" },
                },
                required: ["expression"],
              },
            },
          ],
        },
      });
      return;
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      if (toolName !== "calculate") {
        throw new Error(`Unknown tool: ${toolName}`);
      }

      const expression = params?.arguments?.expression;
      const result = evaluateExpression(expression);
      send({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: String(result),
            },
          ],
          structuredContent: {
            expression: String(expression),
            result,
          },
        },
      });
      return;
    }

    send({
      jsonrpc: "2.0",
      id,
      error: { code: -32601, message: `Method not found: ${method}` },
    });
  } catch (error) {
    send({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32000,
        message: error instanceof Error ? error.message : "Unknown server error",
      },
    });
  }
});
