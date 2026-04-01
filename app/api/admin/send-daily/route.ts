/**
 * app/api/admin/send-daily/route.ts
 * Admin-only endpoint to send daily briefs NOW to VIP recipients.
 * Useful for testing and manual triggers.
 *
 * POST /api/admin/send-daily — sends to all VIPs + opted-in DB users
 * POST /api/admin/send-daily?to=254712345678 — sends to a specific number
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildDailyWhatsAppBrief } from "@/lib/whatsapp-ai";
import { prisma } from "@/lib/prisma";

// Same VIP list as the cron
const VIP_RECIPIENTS = [
  { name: "Edwin",  waId: "254726260884" },
  { name: "Robin",  waId: "254703469525" },
  { name: "Winnie", waId: "254712345678" },
];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const specificTo = searchParams.get("to");

  const results: { name: string; waId: string; status: string }[] = [];

  if (specificTo) {
    // Send to a specific number
    try {
      const brief = await buildDailyWhatsAppBrief("Investor", "guest");
      await sendWhatsAppMessage(specificTo, brief);
      results.push({ name: "Custom", waId: specificTo, status: "✅ sent" });
    } catch (err) {
      results.push({ name: "Custom", waId: specificTo, status: `❌ ${err}` });
    }
  } else {
    // Send to all VIPs
    for (const vip of VIP_RECIPIENTS) {
      try {
        // Try to find user in DB for portfolio context
        const user = await prisma.user.findFirst({
          where: { whatsappId: vip.waId },
          select: { id: true, name: true },
        });
        
        const brief = await buildDailyWhatsAppBrief(
          user?.name ?? vip.name,
          user?.id ?? "guest"
        );
        await sendWhatsAppMessage(vip.waId, brief, user?.id);
        results.push({ name: vip.name, waId: vip.waId, status: "✅ sent" });
        
        // Rate limit
        await new Promise((r) => setTimeout(r, 1100));
      } catch (err) {
        results.push({ name: vip.name, waId: vip.waId, status: `❌ ${err}` });
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: `Sent daily briefs to ${results.filter(r => r.status.includes("✅")).length}/${results.length} recipients`,
    results,
    timestamp: new Date().toISOString(),
  });
}
