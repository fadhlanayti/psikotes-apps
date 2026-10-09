// lib/store.ts
// ponytail: JSON file store — zero native deps, persists on disk.
//           Swap to SQLite/Postgres if concurrent writes cause corruption (unlikely for low-concurrency VPS).

import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "psikotes.json");

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

type DB = { sessions: Record<string, Session> };

function read(): DB {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return { sessions: {} };
  }
}

function write(db: DB) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db), "utf8");
}

export function createSession(id: string): Session {
  const now = Date.now();
  const session: Session = {
    id, startedAt: now, submittedAt: null,
    forced: false, disqualified: false,
    answers: null, violations: [], captures: [],
    lastHeartbeat: now,
  };
  const db = read();
  db.sessions[id] = session;
  write(db);
  return session;
}

export function getSession(id: string): Session | undefined {
  return read().sessions[id];
}

export function getAllSessions(): Session[] {
  const db = read();
  return Object.values(db.sessions).sort((a, b) => b.startedAt - a.startedAt);
}

export function addViolation(id: string, type: string, count: number) {
  const db = read();
  db.sessions[id]?.violations.push({ type, count, timestamp: Date.now() });
  write(db);
}

export function addCapture(id: string, dataUrl: string) {
  const db = read();
  const s = db.sessions[id];
  if (!s) return;
  s.captures.push({ timestamp: Date.now(), dataUrl });
  // ponytail: keep last 30 per session, O(n) shift fine at this scale
  if (s.captures.length > 30) s.captures = s.captures.slice(-30);
  write(db);
}

export function submitSession(
  id: string,
  answers: Record<number, number> | null,
  forced: boolean,
  reason?: string
) {
  const db = read();
  const s = db.sessions[id];
  if (!s) return;
  s.submittedAt = Date.now();
  s.answers = answers ?? s.answers;
  s.forced = forced;
  if (reason === "max_violations") s.disqualified = true;
  write(db);
}

export function heartbeat(id: string) {
  const db = read();
  if (db.sessions[id]) db.sessions[id].lastHeartbeat = Date.now();
  write(db);
}
