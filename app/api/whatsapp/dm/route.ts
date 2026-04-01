/**
 * app/api/whatsapp/dm/route.ts
 * Send a direct WhatsApp message to a specific user from admin dashboard.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { waId, message, userId } = await req.json();

  if (!waId || !message?.trim()) {
    return NextResponse.json({ error: "waId and message required" }, { status: 400 });
  }

  try {
    await sendWhatsAppMessage(waId, message.trim(), userId);
    return NextResponse.json({ success: true, waId, preview: message.slice(0, 50) });
  } catch (err) {
    console.error("[Admin DM] Failed:", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
