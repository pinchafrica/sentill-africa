/**
 * app/api/whatsapp/send/route.ts
 * Internal API to send WhatsApp messages programmatically
 * (used by admin panel, broadcast triggers, etc.)
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, message } = await req.json();

    if (!to || !message) {
      return NextResponse.json({ error: "to and message are required" }, { status: 400 });
    }

    await sendWhatsAppMessage(to, message);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[WhatsApp Send API]", err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
