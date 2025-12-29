// backend/src/db/schema.ts
import Database from 'better-sqlite3';

const db = new Database('app_prompts.db');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

// Recreate app_prompts with user_id (drop old if exists - safe for dev)
db.exec(`DROP TABLE IF EXISTS app_prompts;`);

db.exec(`
  CREATE TABLE app_prompts (
    app_name TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    PRIMARY KEY (app_name, user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// === USER FUNCTIONS ===
export function createUser(username: string, passwordHash: string): number {
  const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
  const result = stmt.run(username, passwordHash);
  return result.lastInsertRowid as number;
}

export function getUserByUsername(username: string): { id: number; password_hash: string } | undefined {
  return db.prepare('SELECT id, password_hash FROM users WHERE username = ?')
    .get(username) as { id: number; password_hash: string } | undefined;
}

// === APP PROMPT FUNCTIONS (User-Specific) ===
export function getSystemPrompt(appName: string, userId: number): string {
  const row = db.prepare('SELECT system_prompt FROM app_prompts WHERE app_name = ? AND user_id = ?')
    .get(appName, userId) as { system_prompt: string } | undefined;
  return row?.system_prompt || 'You are a QA expert. Generate detailed test cases covering positive, negative, boundary, and error scenarios.';
}

export function upsertSystemPrompt(appName: string, systemPrompt: string, userId: number) {
  db.prepare(`
    INSERT INTO app_prompts (app_name, system_prompt, user_id)
    VALUES (?, ?, ?)
    ON CONFLICT(app_name, user_id) DO UPDATE SET system_prompt = excluded.system_prompt
  `).run(appName, systemPrompt, userId);
}

export function getAllAppNames(userId: number): string[] {
  const rows = db.prepare('SELECT app_name FROM app_prompts WHERE user_id = ?')
    .all(userId) as { app_name: string }[];
  return rows.map(row => row.app_name);
}

export function deletePrompt(appName: string, userId: number) {
  db.prepare('DELETE FROM app_prompts WHERE app_name = ? AND user_id = ?')
    .run(appName, userId);
}

// Optional: Get all prompts for a user (useful later)
export function getAllPromptsForUser(userId: number): { app_name: string; system_prompt: string }[] {
  return db.prepare('SELECT app_name, system_prompt FROM app_prompts WHERE user_id = ?')
    .all(userId) as { app_name: string; system_prompt: string }[];
}