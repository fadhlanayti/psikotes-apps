import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log("⚠️ Violation:", body);
  return NextResponse.json({ recorded: true });
}