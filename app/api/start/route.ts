import { NextResponse } from "next/server";
import { createSession } from "@/lib/store";

export async function POST() {
  const sessionId = crypto.randomUUID();
  createSession(sessionId);
  return NextResponse.json({ sessionId });
}
