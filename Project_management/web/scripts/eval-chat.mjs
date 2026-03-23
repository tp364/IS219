import path from "node:path";
import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

function createMcpClient() {
  const serverPath = path.resolve(process.cwd(), "mcp-server", "calculator-server.mjs");
  const child = spawn(process.execPath, [serverPath], {
    stdio: ["pipe", "pipe", "pipe"],
  });
  const rl = createInterface({ input: child.stdout });
  const pending = new Map();
  let requestId = 1;

  rl.on("line", (line) => {
    try {
      const message = JSON.parse(line);
      if (message.id && pending.has(message.id)) {
        const resolve = pending.get(message.id);
        resolve(message);
        pending.delete(message.id);
      }
    } catch {
      // ignore malformed lines
    }
  });

  const request = (method, params) => {
    const id = requestId++;
    const payload = { jsonrpc: "2.0", id, method, params };
    child.stdin.write(`${JSON.stringify(payload)}\n`);
    return new Promise((resolve) => pending.set(id, resolve));
  };

  const close = () => {
    rl.close();
    child.kill();
  };

  return { request, close };
}

async function runEval() {
  const client = createMcpClient();

  try {
    const init = await client.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "eval-chat", version: "1.0.0" },
    });
    if (init.error) throw new Error(init.error.message || "Initialization failed");

    await client.request("tools/list");

    const cases = [
      { expression: "257*43", expected: 11051 },
      { expression: "55+45", expected: 100 },
      { expression: "144/12", expected: 12 },
      { expression: "(21*4)-9", expected: 75 },
    ];

    let pass = 0;
    for (const testCase of cases) {
      const result = await client.request("tools/call", {
        name: "calculate",
        arguments: { expression: testCase.expression },
      });
      const text = result?.result?.content?.[0]?.text;
      const numeric = Number(text);
      const ok = Number.isFinite(numeric) && numeric === testCase.expected;
      if (ok) pass++;
      console.log(
        `${ok ? "PASS" : "FAIL"} expression=${testCase.expression} expected=${testCase.expected} got=${text}`,
      );
    }

    const summary = `Passed ${pass}/${cases.length} calculator MCP evals`;
    console.log(summary);
    if (pass !== cases.length) process.exit(1);
  } finally {
    client.close();
  }
}

runEval().catch((error) => {
  console.error("Eval failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
