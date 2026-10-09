import { NextRequest, NextResponse } from "next/server";
import { submitSession } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { sessionId, answers, forced, reason } = await req.json();
  submitSession(sessionId, answers ?? null, !!forced, reason);
  return NextResponse.json({ ok: true });
}
