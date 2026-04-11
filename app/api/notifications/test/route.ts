/**
 * app/api/notifications/test/route.ts
 * Sends the user an instant test daily brief via WhatsApp.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildDailyMorningBrief } from "@/lib/whatsapp-briefs";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, whatsappId: true, isPremium: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.whatsappId) {
    return NextResponse.json({
      error: "No WhatsApp number linked. Connect WhatsApp first via the WhatsApp Hub.",
    }, { status: 400 });
  }

  try {
    const brief = await buildDailyMorningBrief(user.name, user.id, user.isPremium);
    await sendWhatsAppMessage(user.whatsappId, brief, user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Notification Test]", err);
    return NextResponse.json({ error: "Failed to send test message" }, { status: 500 });
  }
}
