import { NextResponse } from "next/server";

export async function POST() {
  const sessionId = crypto.randomUUID();
  return NextResponse.json({ sessionId });
}