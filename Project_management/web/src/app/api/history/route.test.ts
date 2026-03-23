/** @jest-environment node */

import { GET } from "@/app/api/history/route";

const mockAuth = jest.fn();
const mockGetConversationWithMessages = jest.fn();
const mockGetLatestConversationWithMessages = jest.fn();
const mockListConversations = jest.fn();

jest.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

jest.mock("@/lib/store", () => ({
  getStore: () => ({
    getConversationWithMessages: (...args: unknown[]) => mockGetConversationWithMessages(...args),
    getLatestConversationWithMessages: (...args: unknown[]) =>
      mockGetLatestConversationWithMessages(...args),
    listConversations: (...args: unknown[]) => mockListConversations(...args),
  }),
}));

describe("GET /api/history", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockGetConversationWithMessages.mockReset();
    mockGetLatestConversationWithMessages.mockReset();
    mockListConversations.mockReset();

    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockGetLatestConversationWithMessages.mockReturnValue(null);
    mockListConversations.mockReturnValue([]);
  });

  it("returns 401 when user is unauthenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api/history"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns latest history for authenticated users", async () => {
    mockGetLatestConversationWithMessages.mockReturnValue({
      conversation: { id: "conv-1" },
      messages: [
        { id: "msg-1", role: "assistant", content: "Hello", created_at: "2026-03-02T00:00:00.000Z" },
      ],
    });
    mockListConversations.mockReturnValue([
      { id: "conv-1", title: "New conversation", updated_at: "2026-03-02T00:00:00.000Z" },
    ]);

    const response = await GET(new Request("http://localhost/api/history"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      conversationId: "conv-1",
      messages: [
        {
          id: "msg-1",
          role: "assistant",
          content: "Hello",
          createdAt: "2026-03-02T00:00:00.000Z",
        },
      ],
      conversations: [
        {
          id: "conv-1",
          title: "New conversation",
          updatedAt: "2026-03-02T00:00:00.000Z",
        },
      ],
    });
  });

  it("returns selected conversation history when conversationId is provided", async () => {
    mockGetConversationWithMessages.mockReturnValue({
      conversation: { id: "conv-2" },
      messages: [],
    });

    const response = await GET(new Request("http://localhost/api/history?conversationId=conv-2"));

    expect(response.status).toBe(200);
    expect(mockGetConversationWithMessages).toHaveBeenCalledWith("user-1", "conv-2");
  });
});
