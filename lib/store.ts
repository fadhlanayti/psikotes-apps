// lib/store.ts
// ponytail: in-memory store, hilang saat restart. DB kalau perlu persist.

export interface Violation {
  type: string;
  count: number;
  timestamp: number;
}

export interface Capture {
  timestamp: number;
  /** base64 data URL */
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

const sessions = new Map<string, Session>();

export function createSession(id: string): Session {
  const session: Session = {
    id,
    startedAt: Date.now(),
    submittedAt: null,
    forced: false,
    disqualified: false,
    answers: null,
    violations: [],
    captures: [],
    lastHeartbeat: Date.now(),
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function getAllSessions(): Session[] {
  return Array.from(sessions.values()).sort((a, b) => b.startedAt - a.startedAt);
}

export function addViolation(id: string, type: string, count: number) {
  const s = sessions.get(id);
  if (!s) return;
  s.violations.push({ type, count, timestamp: Date.now() });
}

export function addCapture(id: string, dataUrl: string) {
  const s = sessions.get(id);
  if (!s) return;
  // keep last 30 per session to avoid memory bloat
  if (s.captures.length >= 30) s.captures.shift();
  s.captures.push({ timestamp: Date.now(), dataUrl });
}

export function submitSession(
  id: string,
  answers: Record<number, number> | null,
  forced: boolean,
  reason?: string
) {
  const s = sessions.get(id);
  if (!s) return;
  s.submittedAt = Date.now();
  s.answers = answers ?? s.answers;
  s.forced = forced;
  if (reason === "max_violations") s.disqualified = true;
}

export function heartbeat(id: string) {
  const s = sessions.get(id);
  if (s) s.lastHeartbeat = Date.now();
}
