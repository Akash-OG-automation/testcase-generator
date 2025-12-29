// backend/src/index.ts
import express from 'express';
import type { NextFunction } from 'express';
import type { Request } from 'express';
import type { Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  generateTestCases
} from './langchain/generator.js';
import {
  upsertSystemPrompt,
  getSystemPrompt,
  deletePrompt,
  getAllAppNames,
  createUser,
  getUserByUsername
} from './db/schema.js';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: { userId: number };
}

const app = express();
app.use(cors());
app.use(express.json());

// JWT Config
const JWT_SECRET = 'your-super-secret-jwt-key-change-in-production-12345';
const JWT_EXPIRES_IN = '7d';

// Auth Middleware
const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = { userId: decoded.userId };
    next();
  });
};

// Public: Register
app.post('/api/register', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const existingUser = getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = createUser(username, passwordHash);

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, token, message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Public: Login
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const user = getUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ success: true, token, message: 'Login successful' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected Routes
app.post('/api/generate', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { userStory, appName, complexity = 'medium' } = req.body;
  const userId = req.user!.userId;

  if (!appName || typeof appName !== 'string' || !userStory?.trim()) {
    return res.status(400).json({ error: 'Valid app name and user story required' });
  }

  try {
    const result = await generateTestCases(userStory.trim(), appName, complexity);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('Generation error:', err);
    res.status(500).json({ error: (err as Error).message || 'Generation failed' });
  }
});

app.get('/api/apps', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const apps = getAllAppNames(userId);
  res.json(apps);
});

app.post('/api/admin/prompt', authenticateToken, (req: AuthRequest, res: Response) => {
  const { appName, systemPrompt } = req.body;
  const userId = req.user!.userId;

  if (!appName || typeof appName !== 'string' || !systemPrompt || typeof systemPrompt !== 'string') {
    return res.status(400).json({ error: 'Valid app name and prompt required' });
  }

  try {
    upsertSystemPrompt(appName.trim(), systemPrompt.trim(), userId);
    res.json({ success: true, message: 'Prompt saved' });
  } catch (err) {
    res.status(500).json({ error: 'Save failed' });
  }
});

app.put('/api/admin/prompt', authenticateToken, (req: AuthRequest, res: Response) => {
  const { appName, systemPrompt } = req.body;
  const userId = req.user!.userId;

  if (!appName || typeof appName !== 'string' || !systemPrompt || typeof systemPrompt !== 'string') {
    return res.status(400).json({ error: 'Valid app name and prompt required' });
  }

  try {
    upsertSystemPrompt(appName.trim(), systemPrompt.trim(), userId);
    res.json({ success: true, message: 'Prompt updated' });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
});

app.delete('/api/admin/prompt', authenticateToken, (req: AuthRequest, res: Response) => {
  const { appName } = req.body;
  const userId = req.user!.userId;

  if (!appName || typeof appName !== 'string') {
    return res.status(400).json({ error: 'Valid app name required' });
  }

  try {
    deletePrompt(appName.trim(), userId);
    res.json({ success: true, message: 'App deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.get('/api/admin/prompt/:appName', authenticateToken, (req: AuthRequest, res: Response) => {
  const appName = req.params.appName; // Now properly typed as string
  const userId = req.user!.userId;

  if (!appName) {
    return res.status(400).json({ error: 'App name required' });
  }

  try {
    const prompt = getSystemPrompt(appName, userId);
    res.json({ systemPrompt: prompt });
  } catch (err) {
    res.status(404).json({ error: 'Prompt not found' });
  }
});

app.listen(4000, () => {
  console.log('Backend running on http://localhost:4000');
});