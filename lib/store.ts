// lib/store.ts
// ponytail: better-sqlite3 is synchronous — fine for low-concurrency VPS.
//           Swap to Postgres/Prisma if concurrent load becomes an issue.

import Database from "better-sqlite3";
import path from "path";

// ponytail: globalThis prevents Next.js from creating multiple DB connections
const globalForDb = globalThis as unknown as { __psikotesDb?: ReturnType<typeof Database> };
const db = globalForDb.__psikotesDb ??= new Database(path.join(process.cwd(), "psikotes.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    started_at INTEGER NOT NULL,
    submitted_at INTEGER,
    forced INTEGER NOT NULL DEFAULT 0,
    disqualified INTEGER NOT NULL DEFAULT 0,
    answers TEXT,
    last_heartbeat INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS violations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    type TEXT NOT NULL,
    count INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS captures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL REFERENCES sessions(id),
    timestamp INTEGER NOT NULL,
    data_url TEXT NOT NULL
  );
`);

export interface Violation {
  type: string;
  count: number;
  timestamp: number;
}

export interface Capture {
  timestamp: number;
  dataUrl: string;
}

export interface Session {
  id: string;
  startedAt: number;
  submittedAt: number | null;
  forced: boolean;
  disqualified: boolean;
  answers: Record<number, number> | null;
  violations: Violation[];
  captures: Capture[];
  lastHeartbeat: number;
}

function toSession(
  row: Record<string, unknown>,
  violations: Violation[],
  captures: Capture[]
): Session {
  return {
    id: row.id as string,
    startedAt: row.started_at as number,
    submittedAt: (row.submitted_at as number | null) ?? null,
    forced: !!(row.forced as number),
    disqualified: !!(row.disqualified as number),
    answers: row.answers ? JSON.parse(row.answers as string) : null,
    lastHeartbeat: row.last_heartbeat as number,
    violations,
    captures,
  };
}

export function createSession(id: string): Session {
  const now = Date.now();
  db.prepare(
    `INSERT INTO sessions (id, started_at, last_heartbeat) VALUES (?, ?, ?)`
  ).run(id, now, now);
  return { id, startedAt: now, submittedAt: null, forced: false, disqualified: false, answers: null, violations: [], captures: [], lastHeartbeat: now };
}

export function getSession(id: string): Session | undefined {
  const row = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id) as Record<string, unknown> | undefined;
  if (!row) return undefined;
  const violations = db.prepare(`SELECT type, count, timestamp FROM violations WHERE session_id = ? ORDER BY timestamp`).all(id) as Violation[];
  const captures = db.prepare(`SELECT timestamp, data_url as dataUrl FROM captures WHERE session_id = ? ORDER BY timestamp`).all(id) as Capture[];
  return toSession(row, violations, captures);
}

export function getAllSessions(): Session[] {
  const rows = db.prepare(`SELECT * FROM sessions ORDER BY started_at DESC`).all() as Record<string, unknown>[];
  return rows.map((row) => {
    const id = row.id as string;
    const violations = db.prepare(`SELECT type, count, timestamp FROM violations WHERE session_id = ? ORDER BY timestamp`).all(id) as Violation[];
    // ponytail: last 30 captures per session. Add pagination if storage grows large.
    const captures = db.prepare(`SELECT timestamp, data_url as dataUrl FROM captures WHERE session_id = ? ORDER BY timestamp DESC LIMIT 30`).all(id) as Capture[];
    return toSession(row, violations, captures.reverse());
  });
}

export function addViolation(id: string, type: string, count: number) {
  db.prepare(`INSERT INTO violations (session_id, type, count, timestamp) VALUES (?, ?, ?, ?)`).run(id, type, count, Date.now());
}

export function addCapture(id: string, dataUrl: string) {
  db.prepare(`INSERT INTO captures (session_id, timestamp, data_url) VALUES (?, ?, ?)`).run(id, Date.now(), dataUrl);
  // keep last 30
  db.prepare(`
    DELETE FROM captures WHERE session_id = ? AND id NOT IN (
      SELECT id FROM captures WHERE session_id = ? ORDER BY timestamp DESC LIMIT 30
    )
  `).run(id, id);
}

export function submitSession(
  id: string,
  answers: Record<number, number> | null,
  forced: boolean,
  reason?: string
) {
  db.prepare(`
    UPDATE sessions SET submitted_at = ?, answers = ?, forced = ?, disqualified = ? WHERE id = ?
  `).run(Date.now(), answers ? JSON.stringify(answers) : null, forced ? 1 : 0, reason === "max_violations" ? 1 : 0, id);
}

export function heartbeat(id: string) {
  db.prepare(`UPDATE sessions SET last_heartbeat = ? WHERE id = ?`).run(Date.now(), id);
}
