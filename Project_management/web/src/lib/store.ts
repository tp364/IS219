import Database from "better-sqlite3";
import { nanoid } from "nanoid";

import { getDatabase } from "@/lib/db";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
};

export type ConversationRow = {
  id: string;
  user_id: string;
  title: string;
  updated_at: string;
  created_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Store = ReturnType<typeof createStore>;

export function createStore(db: Database.Database) {
  return {
    findUserByEmail(email: string) {
      const stmt = db.prepare("SELECT id, email, name, password_hash FROM users WHERE email = ?");
      return stmt.get(email.toLowerCase()) as UserRow | undefined;
    },

    upsertUser(input: { email: string; name?: string; passwordHash: string }) {
      const existing = this.findUserByEmail(input.email);
      if (existing) {
        db.prepare(
          "UPDATE users SET name = ?, password_hash = ?, updated_at = datetime('now') WHERE id = ?",
        ).run(input.name ?? existing.name, input.passwordHash, existing.id);

        return {
          id: existing.id,
          email: existing.email,
          name: input.name ?? existing.name,
          passwordHash: input.passwordHash,
        };
      }

      const id = nanoid();
      db.prepare("INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)").run(
        id,
        input.email.toLowerCase(),
        input.name ?? null,
        input.passwordHash,
      );

      return {
        id,
        email: input.email.toLowerCase(),
        name: input.name ?? null,
        passwordHash: input.passwordHash,
      };
    },

    findConversationById(userId: string, conversationId: string) {
      const stmt = db.prepare(
        "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ?",
      );
      return stmt.get(conversationId, userId) as ConversationRow | undefined;
    },

    createConversation(userId: string, title: string) {
      const id = nanoid();
      db.prepare("INSERT INTO conversations (id, user_id, title) VALUES (?, ?, ?)").run(
        id,
        userId,
        title,
      );
      return { id, userId, title };
    },

    createMessage(input: { conversationId: string; role: "user" | "assistant"; content: string }) {
      const id = nanoid();
      db.prepare("INSERT INTO messages (id, conversation_id, role, content) VALUES (?, ?, ?, ?)").run(
        id,
        input.conversationId,
        input.role,
        input.content,
      );
      return { id, ...input };
    },

    touchConversation(conversationId: string) {
      db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(
        conversationId,
      );
    },

    getLatestConversationWithMessages(userId: string) {
      const conversationStmt = db.prepare(
        "SELECT id, user_id, title, created_at, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1",
      );
      const conversation = conversationStmt.get(userId) as ConversationRow | undefined;

      if (!conversation) return null;

      const messagesStmt = db.prepare(
        "SELECT id, conversation_id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
      );
      const messages = messagesStmt.all(conversation.id) as MessageRow[];

      return {
        conversation,
        messages,
      };
    },

    listConversations(userId: string) {
      const stmt = db.prepare(
        "SELECT id, title, updated_at FROM conversations WHERE user_id = ? ORDER BY updated_at DESC",
      );
      return stmt.all(userId) as Array<{ id: string; title: string; updated_at: string }>;
    },

    getConversationWithMessages(userId: string, conversationId: string) {
      const conversation = this.findConversationById(userId, conversationId);
      if (!conversation) return null;

      const messagesStmt = db.prepare(
        "SELECT id, conversation_id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
      );
      const messages = messagesStmt.all(conversation.id) as MessageRow[];

      return { conversation, messages };
    },

    renameConversation(userId: string, conversationId: string, title: string) {
      const result = db
        .prepare(
          "UPDATE conversations SET title = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
        )
        .run(title, conversationId, userId);
      return result.changes > 0;
    },

    deleteConversation(userId: string, conversationId: string) {
      const result = db
        .prepare("DELETE FROM conversations WHERE id = ? AND user_id = ?")
        .run(conversationId, userId);
      return result.changes > 0;
    },
  };
}

let singletonStore: Store | null = null;

export function getStore() {
  if (!singletonStore) {
    singletonStore = createStore(getDatabase());
  }

  return singletonStore;
}

export function resetStoreSingleton() {
  singletonStore = null;
}
