/**
 * app/api/whatsapp/stats/route.ts
 * Returns WhatsApp activity stats for admin dashboard.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalWaUsers,
    verifiedUsers,
    activeToday,
    totalMsgs,
    recentLogs,
    sessions,
  ] = await Promise.all([
    prisma.user.count({ where: { whatsappId: { not: null } } }),
    prisma.user.count({ where: { whatsappVerified: true } }),
    prisma.whatsAppLog.groupBy({
      by: ["waId"],
      where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    }),
    prisma.whatsAppLog.count(),
    prisma.whatsAppLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.whatsAppSession.findMany({
      orderBy: { lastSeen: "desc" },
      take: 20,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  // Broadcast stats — count outbound messages
  const broadcastsSent = await prisma.whatsAppLog.count({
    where: { direction: "OUTBOUND", msgType: "template" },
  });

  return NextResponse.json({
    stats: {
      totalWaUsers,
      verifiedUsers,
      activeToday: activeToday.length,
      totalMessages: totalMsgs,
      broadcastsSent,
    },
    recentLogs,
    sessions,
  });
}
