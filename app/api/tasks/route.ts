import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';

type Bindings = { DB: D1Database };
const db = () => (env as unknown as Bindings).DB;

async function prepareDatabase() {
  await db().batch([
    db().prepare('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, title TEXT NOT NULL, time TEXT NOT NULL DEFAULT \'09:00\', done INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)'),
    db().prepare('CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON tasks (user_id, created_at DESC)'),
  ]);
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  await prepareDatabase();
  const result = await db().prepare('SELECT id, title, time, done FROM tasks WHERE user_id = ? ORDER BY created_at DESC').bind(user.userId).all();
  return Response.json({ tasks: result.results });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json() as { title?: string; time?: string };
  const title = body.title?.trim();
  if (!title) return Response.json({ error: 'title_required' }, { status: 400 });
  await prepareDatabase();
  const result = await db().prepare('INSERT INTO tasks (user_id, title, time, done, created_at) VALUES (?, ?, ?, 0, ?)').bind(user.userId, title.slice(0, 160), body.time ?? '09:00', Date.now()).run();
  return Response.json({ id: result.meta.last_row_id, title, time: body.time ?? '09:00', done: false }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 });
  const body = await request.json() as { id?: number; done?: boolean };
  if (!body.id || typeof body.done !== 'boolean') return Response.json({ error: 'invalid_request' }, { status: 400 });
  await prepareDatabase();
  await db().prepare('UPDATE tasks SET done = ? WHERE id = ? AND user_id = ?').bind(body.done ? 1 : 0, body.id, user.userId).run();
  return Response.json({ ok: true });
}

