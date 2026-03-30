/**
 * app/api/whatsapp/broadcast/route.ts
 * Admin-only endpoint to send a manual broadcast to all WhatsApp-verified users.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();
  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  // Fetch all verified WhatsApp users
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users: any[] = await prisma.$queryRaw`
    SELECT u.id, u.name, u."whatsappId"
    FROM "User" u
    WHERE u."whatsappId" IS NOT NULL
      AND u."whatsappVerified" = true
  `;

  let sent = 0;
  let failed = 0;

  for (const user of users) {
    try {
      await sendWhatsAppMessage(user.whatsappId, message, user.id);
      sent++;
      await new Promise((r) => setTimeout(r, 1100));
    } catch {
      failed++;
    }
  }

  return NextResponse.json({ success: true, sent, failed, total: users.length });
}
