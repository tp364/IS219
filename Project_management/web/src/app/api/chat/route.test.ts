/** @jest-environment node */

import { POST } from "@/app/api/chat/route";

const mockCreateAssistantReplyStream = jest.fn();
const mockGetOpenAIClient = jest.fn();
const mockGetOpenAIModel = jest.fn();
const mockAuth = jest.fn();
const mockFindConversationById = jest.fn();
const mockCreateConversation = jest.fn();
const mockTouchConversation = jest.fn();
const mockMessageCreate = jest.fn();
const mockCalculateViaMcp = jest.fn();

jest.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

jest.mock("@/lib/openai", () => ({
  getOpenAIClient: () => mockGetOpenAIClient(),
  getOpenAIModel: () => mockGetOpenAIModel(),
}));

jest.mock("@/services/chat.service", () => ({
  createAssistantReplyStream: (...args: unknown[]) => mockCreateAssistantReplyStream(...args),
}));

jest.mock("@/lib/store", () => ({
  getStore: () => ({
    findConversationById: (...args: unknown[]) => mockFindConversationById(...args),
    createConversation: (...args: unknown[]) => mockCreateConversation(...args),
    touchConversation: (...args: unknown[]) => mockTouchConversation(...args),
    createMessage: (...args: unknown[]) => mockMessageCreate(...args),
  }),
}));

jest.mock("@/lib/mcp-client", () => ({
  calculateViaMcp: (...args: unknown[]) => mockCalculateViaMcp(...args),
}));

jest.mock("@/lib/logger", () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/chat", () => {
  beforeEach(() => {
    mockCreateAssistantReplyStream.mockReset();
    mockGetOpenAIClient.mockReset();
    mockGetOpenAIModel.mockReset();
    mockAuth.mockReset();
    mockFindConversationById.mockReset();
    mockCreateConversation.mockReset();
    mockTouchConversation.mockReset();
    mockMessageCreate.mockReset();
    mockCalculateViaMcp.mockReset();

    mockGetOpenAIClient.mockReturnValue({
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    });
    mockGetOpenAIModel.mockReturnValue("gpt-4o-mini");
    mockAuth.mockResolvedValue({
      user: { id: "user-1", email: "admin@example.com" },
    });
    mockFindConversationById.mockReturnValue(null);
    mockCreateConversation.mockReturnValue({ id: "conv-1", userId: "user-1" });
    mockTouchConversation.mockReturnValue(undefined);
    mockMessageCreate.mockReturnValue({ id: "msg-1" });
    mockCalculateViaMcp.mockResolvedValue(null);
  });

  it("returns 401 when user is unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "hello" }],
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
  });

  it("returns 500 when OpenAI client configuration fails", async () => {
    mockGetOpenAIClient.mockImplementation(() => {
      throw new Error("Missing OPENAI_API_KEY. Add it to .env.local.");
    });

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "hello" }],
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Missing OPENAI_API_KEY. Add it to .env.local.",
    });
  });

  it("returns 400 when payload is invalid", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request payload.",
    });
  });

  it("returns 200 with assistant reply", async () => {
    async function* stream() {
      yield "Hi ";
      yield "there!";
    }
    mockCreateAssistantReplyStream.mockReturnValue(stream());

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Say hi" }],
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("Hi there!");
    expect(response.headers.get("X-Conversation-Id")).toBe("conv-1");
  });

  it("errors the stream when model stream is empty", async () => {
    async function* stream() {
      yield "";
    }
    mockCreateAssistantReplyStream.mockReturnValue(stream());

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Say hi" }],
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).rejects.toThrow();
  });

  it("returns 500 when upstream client throws", async () => {
    mockCreateAssistantReplyStream.mockImplementation(() => {
      throw new Error("Upstream failed");
    });

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "Say hi" }],
      }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Upstream failed",
    });
  });

  it("keeps chat path healthy when MCP call fails", async () => {
    async function* stream() {
      yield "Math ";
      yield "done";
    }
    mockCalculateViaMcp.mockRejectedValue(new Error("timeout"));
    mockCreateAssistantReplyStream.mockReturnValue(stream());

    const response = await POST(
      makeRequest({
        messages: [{ role: "user", content: "2+2" }],
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("Math done");
  });
});
