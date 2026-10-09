import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const photo = formData.get("photo") as File | null;
  const sessionId = formData.get("sessionId") as string;

  console.log(
    `📸 Capture received: session=${sessionId}, size=${photo?.size} bytes`
  );

  return NextResponse.json({ received: true });
}