import { NextRequest, NextResponse } from "next/server";
import { heartbeat } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { sessionId } = await req.json();
  heartbeat(sessionId);
  return NextResponse.json({ alive: true, ts: Date.now() });
}
