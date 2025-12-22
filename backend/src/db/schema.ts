// backend/src/db/schema.ts
import Database from 'better-sqlite3';

const db = new Database('app_prompts.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS app_prompts (
    app_name TEXT PRIMARY KEY,
    system_prompt TEXT NOT NULL
  );
`);

export function getSystemPrompt(appName: string): string {
  const row = db.prepare('SELECT system_prompt FROM app_prompts WHERE app_name = ?').get(appName) as any;
  return row?.system_prompt || 'You are a QA expert. Generate detailed test cases.';
}

export function upsertSystemPrompt(appName: string, systemPrompt: string) {
  db.prepare(`
    INSERT INTO app_prompts (app_name, system_prompt) 
    VALUES (?, ?) 
    ON CONFLICT(app_name) DO UPDATE SET system_prompt = excluded.system_prompt
  `).run(appName, systemPrompt);
}