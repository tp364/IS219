import path from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

type JsonRpcResponse = {
  id?: number;
  result?: {
    content?: Array<{ type?: string; text?: string }>;
    structuredContent?: { expression?: string; result?: number };
  };
  error?: { message?: string };
};

const MCP_TIMEOUT_MS = Number(process.env.MCP_TIMEOUT_MS ?? 2000);

function extractMathExpression(input: string) {
  const normalized = input.replace(/[xX]/g, "*");
  const match = normalized.match(/[-+*/().\d\s]{3,}/);
  if (!match) return null;
  const expression = match[0].trim();
  if (!/^[\d+\-*/().\s]+$/.test(expression)) return null;
  return expression;
}

function withTimeout<T>(promise: Promise<T>, label: string) {
  let timer: NodeJS.Timeout | null = null;

  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${MCP_TIMEOUT_MS}ms`));
    }, MCP_TIMEOUT_MS);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}

export async function calculateViaMcp(
  input: string,
): Promise<{ expression: string; result: number } | null> {
  const expression = extractMathExpression(input);
  if (!expression) return null;

  const serverPath = path.resolve(process.cwd(), "mcp-server", "calculator-server.mjs");
  const child = spawn(process.execPath, [serverPath], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  const rl = createInterface({ input: child.stdout });
  let requestId = 1;

  const pending = new Map<number, (value: JsonRpcResponse) => void>();
  rl.on("line", (line) => {
    try {
      const message = JSON.parse(line) as JsonRpcResponse;
      if (message.id && pending.has(message.id)) {
        const resolve = pending.get(message.id);
        if (resolve) resolve(message);
        pending.delete(message.id);
      }
    } catch {
      // ignore invalid server lines
    }
  });

  function sendRequest(method: string, params?: unknown) {
    const id = requestId++;
    const payload = { jsonrpc: "2.0", id, method, params };
    child.stdin.write(`${JSON.stringify(payload)}\n`);

    return withTimeout(
      new Promise<JsonRpcResponse>((resolve) => {
        pending.set(id, resolve);
      }),
      `MCP request '${method}'`,
    );
  }

  try {
    const initResponse = await sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      clientInfo: { name: "nextjs-chat", version: "1.0.0" },
      capabilities: {},
    });
    if (initResponse.error) throw new Error(initResponse.error.message ?? "MCP init failed");

    await sendRequest("tools/list");
    const toolResponse = await sendRequest("tools/call", {
      name: "calculate",
      arguments: { expression },
    });
    if (toolResponse.error) throw new Error(toolResponse.error.message ?? "MCP tool call failed");

    const resultText = toolResponse.result?.content?.[0]?.text;
    const resultNumber = Number(resultText);
    if (!Number.isFinite(resultNumber)) return null;

    return { expression, result: resultNumber };
  } finally {
    rl.close();
    child.kill();
  }
}
