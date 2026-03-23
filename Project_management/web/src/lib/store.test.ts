/** @jest-environment node */

jest.mock("nanoid", () => ({
  nanoid: () => `id-${Math.random().toString(16).slice(2)}`,
}));

import Database from "better-sqlite3";

import { initializeDatabase } from "@/lib/db";
import { createStore } from "@/lib/store";

describe("store repository", () => {
  let db: Database.Database;
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    db = new Database(":memory:");
    initializeDatabase(db);
    store = createStore(db);

    store.upsertUser({
      email: "user@example.com",
      name: "User",
      passwordHash: "hash",
    });
  });

  afterEach(() => {
    db.close();
  });

  it("creates and retrieves a conversation with messages", () => {
    const user = store.findUserByEmail("user@example.com");
    expect(user?.id).toBeDefined();

    const conversation = store.createConversation(user!.id, "Test");
    store.createMessage({ conversationId: conversation.id, role: "user", content: "Hello" });
    store.createMessage({ conversationId: conversation.id, role: "assistant", content: "Hi" });

    const payload = store.getConversationWithMessages(user!.id, conversation.id);

    expect(payload?.conversation.id).toBe(conversation.id);
    expect(payload?.messages).toHaveLength(2);
    expect(payload?.messages[0].content).toBe("Hello");
  });

  it("renames and deletes only owned conversation", () => {
    const user = store.findUserByEmail("user@example.com");
    const conversation = store.createConversation(user!.id, "Original");

    expect(store.renameConversation(user!.id, conversation.id, "Updated")).toBe(true);
    expect(store.deleteConversation(user!.id, conversation.id)).toBe(true);
    expect(store.getConversationWithMessages(user!.id, conversation.id)).toBeNull();
  });
});
