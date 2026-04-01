/**
 * app/api/whatsapp/stats/route.ts
 * Returns WhatsApp activity stats + full user directory for admin dashboard.
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
    premiumCount,
    freeCount,
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
    prisma.user.count({ where: { isPremium: true, whatsappId: { not: null } } }),
    prisma.user.count({ where: { isPremium: false, whatsappId: { not: null } } }),
  ]);

  // Broadcast stats — count outbound messages
  const broadcastsSent = await prisma.whatsAppLog.count({
    where: { direction: "OUTBOUND", msgType: "template" },
  });

  // Full user directory for admin CRM view
  const allUsers = await prisma.user.findMany({
    where: { whatsappId: { not: null } },
    select: {
      id: true,
      name: true,
      email: true,
      whatsappId: true,
      whatsappVerified: true,
      isPremium: true,
      premiumActivatedAt: true,
      premiumExpiresAt: true,
      createdAt: true,
      payments: {
        where: { status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          method: true,
          plan: true,
          amount: true,
          reference: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          whatsappLogs: true,
          portfolioAssets: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Determine payment source for each user
  const usersWithSource = allUsers.map((u) => {
    let paymentSource: "whatsapp" | "website" | "app" | "free" = "free";
    if (u.payments.length > 0) {
      const ref = u.payments[0].reference?.toLowerCase() ?? "";
      if (ref.includes("wa-checkout") || ref.includes("whatsapp")) {
        paymentSource = "whatsapp";
      } else if (ref.includes("app") || ref.includes("mobile")) {
        paymentSource = "app";
      } else {
        paymentSource = "website";
      }
    }

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.whatsappId,
      verified: u.whatsappVerified,
      isPremium: u.isPremium,
      premiumActivatedAt: u.premiumActivatedAt,
      premiumExpiresAt: u.premiumExpiresAt,
      paymentSource,
      lastPayment: u.payments[0] ?? null,
      messageCount: u._count.whatsappLogs,
      assetsCount: u._count.portfolioAssets,
      joinedAt: u.createdAt,
    };
  });

  // Per-user message counts today
  const messagesToday = await prisma.whatsAppLog.groupBy({
    by: ["waId"],
    where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    _count: { id: true },
  });
  const msgTodayMap: Record<string, number> = {};
  messagesToday.forEach((m) => { msgTodayMap[m.waId] = m._count.id; });

  const conversionRate = totalWaUsers > 0 ? ((premiumCount / totalWaUsers) * 100).toFixed(1) : "0";

  return NextResponse.json({
    stats: {
      totalWaUsers,
      verifiedUsers,
      activeToday: activeToday.length,
      totalMessages: totalMsgs,
      broadcastsSent,
      premiumUsers: premiumCount,
      freeUsers: freeCount,
      conversionRate: parseFloat(conversionRate),
    },
    recentLogs,
    sessions,
    users: usersWithSource,
    messagesTodayMap: msgTodayMap,
  });
}
