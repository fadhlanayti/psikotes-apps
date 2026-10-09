import { NextRequest, NextResponse } from "next/server";
import { addViolation } from "@/lib/store";

export async function POST(req: NextRequest) {
  const { sessionId, type, count } = await req.json();
  addViolation(sessionId, type, count);
  return NextResponse.json({ recorded: true });
}
