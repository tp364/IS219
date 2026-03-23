/** @jest-environment node */

import { DELETE, PATCH } from "@/app/api/conversations/route";

const mockAuth = jest.fn();
const mockRenameConversation = jest.fn();
const mockDeleteConversation = jest.fn();

jest.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

jest.mock("@/lib/store", () => ({
  getStore: () => ({
    renameConversation: (...args: unknown[]) => mockRenameConversation(...args),
    deleteConversation: (...args: unknown[]) => mockDeleteConversation(...args),
  }),
}));

function makePatchRequest(body: unknown) {
  return new Request("http://localhost/api/conversations", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

describe("/api/conversations", () => {
  beforeEach(() => {
    mockAuth.mockReset();
    mockRenameConversation.mockReset();
    mockDeleteConversation.mockReset();

    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockRenameConversation.mockReturnValue(true);
    mockDeleteConversation.mockReturnValue(true);
  });

  it("returns 401 when unauthenticated (PATCH)", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await PATCH(makePatchRequest({ conversationId: "conv-1", title: "Renamed" }));

    expect(response.status).toBe(401);
  });

  it("returns 400 when PATCH payload is invalid", async () => {
    const response = await PATCH(makePatchRequest({ conversationId: "", title: "" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "conversationId and title are required.",
    });
  });

  it("returns 404 when conversation rename target is missing", async () => {
    mockRenameConversation.mockReturnValue(false);

    const response = await PATCH(makePatchRequest({ conversationId: "conv-404", title: "Renamed" }));

    expect(response.status).toBe(404);
  });

  it("renames a conversation", async () => {
    const response = await PATCH(makePatchRequest({ conversationId: "conv-1", title: "Renamed" }));

    expect(response.status).toBe(200);
    expect(mockRenameConversation).toHaveBeenCalledWith("user-1", "conv-1", "Renamed");
  });

  it("returns 400 when DELETE query is invalid", async () => {
    const response = await DELETE(new Request("http://localhost/api/conversations?conversationId="));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "conversationId is required.",
    });
  });

  it("deletes a conversation", async () => {
    const response = await DELETE(new Request("http://localhost/api/conversations?conversationId=conv-1"));

    expect(response.status).toBe(200);
    expect(mockDeleteConversation).toHaveBeenCalledWith("user-1", "conv-1");
  });

  it("returns 404 when delete target is missing", async () => {
    mockDeleteConversation.mockReturnValue(false);

    const response = await DELETE(new Request("http://localhost/api/conversations?conversationId=conv-404"));

    expect(response.status).toBe(404);
  });
});
