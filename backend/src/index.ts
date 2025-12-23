// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import { generateTestCases } from './langchain/generator.js';
import { upsertSystemPrompt, getSystemPrompt, deletePrompt } from './db/schema.js';
import Database from 'better-sqlite3';

const db = new Database('app_prompts.db');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate', async (req, res) => {
  const { userStory, appName, complexity, outputFormat } = req.body;
  try {
    const result = await generateTestCases(userStory, appName, complexity, outputFormat);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/apps', (req, res) => {
  // Fetch all app names
  const apps = db.prepare('SELECT app_name FROM app_prompts').all() as { app_name: string }[];
  res.json(apps.map(a => a.app_name));
});

app.post('/api/admin/prompt', (req, res) => {
  const { appName, systemPrompt } = req.body;
  upsertSystemPrompt(appName, systemPrompt);
  res.json({ success: true });
});

// New: Update existing prompt
app.put('/api/admin/prompt', (req, res) => {
  const { appName, systemPrompt } = req.body;
  upsertSystemPrompt(appName, systemPrompt);  // Re-use upsert for update
  res.json({ success: true });
});

// New: Delete app prompt
app.delete('/api/admin/prompt', (req, res) => {
  const { appName } = req.body;
  deletePrompt(appName);
  res.json({ success: true });
});

app.get('/api/admin/prompt/:appName', (req, res) => {
  const { appName } = req.params;
  const row = db.prepare('SELECT system_prompt FROM app_prompts WHERE app_name = ?')
    .get(appName) as { system_prompt: string } | undefined;
  if (row) {
    res.json({ systemPrompt: row.system_prompt });
  } else {
    res.status(404).json({ error: 'App not found' });
  }
});

app.listen(4000, () => console.log('Backend running on http://localhost:4000'));