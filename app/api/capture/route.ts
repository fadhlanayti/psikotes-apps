import { NextRequest, NextResponse } from "next/server";
import { addCapture } from "@/lib/store";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const photo = formData.get("photo") as File | null;
  const sessionId = formData.get("sessionId") as string;

  if (photo && sessionId) {
    const buf = await photo.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${b64}`;
    addCapture(sessionId, dataUrl);
  }

  return NextResponse.json({ received: true });
}
