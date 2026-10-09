import { NextResponse } from "next/server";
import { getAllSessions } from "@/lib/store";

export async function GET() {
  const sessions = getAllSessions().map((s) => ({
    id: s.id,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt,
    forced: s.forced,
    disqualified: s.disqualified,
    violationCount: s.violations.length,
    violations: s.violations,
    captureCount: s.captures.length,
    // send last 5 captures only to avoid huge payload
    recentCaptures: s.captures.slice(-5),
    answers: s.answers,
    lastHeartbeat: s.lastHeartbeat,
  }));
  return NextResponse.json(sessions);
}
