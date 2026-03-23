import { mkdirSync } from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";

export function resolveDbPath() {
  const relative = process.env.DATABASE_PATH ?? "./data/app.db";
  const absolute = path.resolve(process.cwd(), relative);
  mkdirSync(path.dirname(absolute), { recursive: true });
  return absolute;
}

export function initializeDatabase(db: Database.Database) {
  db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
`);
}

export function createDatabase(dbPath = resolveDbPath()) {
  const db = new Database(dbPath);
  initializeDatabase(db);
  return db;
}

let singletonDb: Database.Database | null = null;

export function getDatabase() {
  if (!singletonDb) {
    singletonDb = createDatabase();
  }

  return singletonDb;
}

export function resetDatabaseSingleton() {
  singletonDb?.close();
  singletonDb = null;
}
