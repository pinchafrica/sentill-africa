/**
 * app/api/whatsapp/stats/route.ts
 * Returns WhatsApp activity stats, user directory, revenue analytics,
 * activity heatmap, and churn risk scores for admin dashboard.
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

  // Broadcast stats
  const broadcastsSent = await prisma.whatsAppLog.count({
    where: { direction: "OUTBOUND", msgType: "template" },
  });

  // ── Revenue Analytics ─────────────────────────────────────────────────────
  const allPayments = await prisma.payment.findMany({
    where: { status: "SUCCESS" },
    select: { amount: true, createdAt: true, plan: true },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = allPayments.reduce((s, p) => s + p.amount, 0);

  // Monthly revenue (last 6 months)
  const monthlyRevenue: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const start = new Date();
    start.setMonth(start.getMonth() - i, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    const rev = allPayments
      .filter((p) => new Date(p.createdAt) >= start && new Date(p.createdAt) < end)
      .reduce((s, p) => s + p.amount, 0);
    monthlyRevenue.push({
      month: start.toLocaleDateString("en-KE", { month: "short", year: "2-digit" }),
      revenue: rev,
    });
  }

  // Current MRR (Monthly Recurring Revenue — based on active premium users)
  // Estimate: premium users × average plan price
  const avgPayment = allPayments.length > 0
    ? allPayments.reduce((s, p) => s + p.amount, 0) / allPayments.length
    : 349;
  const mrr = premiumCount * avgPayment;
  const arr = mrr * 12;

  // Revenue today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const revenueToday = allPayments
    .filter((p) => new Date(p.createdAt) >= todayStart)
    .reduce((s, p) => s + p.amount, 0);

  // ── Activity Heatmap (7 days × 24 hours) ──────────────────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const heatmapLogs = await prisma.whatsAppLog.findMany({
    where: { createdAt: { gte: sevenDaysAgo } },
    select: { createdAt: true },
  });

  // Build 7×24 grid: [day][hour] = count
  const heatmap: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  const dayNames: string[] = [];
  for (let d = 6; d >= 0; d--) {
    const day = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
    dayNames.push(day.toLocaleDateString("en-KE", { weekday: "short" }));
  }

  heatmapLogs.forEach((log) => {
    const dt = new Date(log.createdAt);
    const daysAgo = Math.floor((Date.now() - dt.getTime()) / (24 * 60 * 60 * 1000));
    if (daysAgo >= 0 && daysAgo < 7) {
      const dayIndex = 6 - daysAgo;
      const hour = dt.getHours();
      heatmap[dayIndex][hour]++;
    }
  });

  // ── Full user directory ───────────────────────────────────────────────────
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

  // Get last message time per user for churn risk
  const lastMessagePerUser = await prisma.whatsAppLog.groupBy({
    by: ["waId"],
    _max: { createdAt: true },
  });
  const lastMsgMap: Record<string, Date> = {};
  lastMessagePerUser.forEach((m) => {
    if (m._max.createdAt) lastMsgMap[m.waId] = m._max.createdAt;
  });

  // Determine payment source + churn risk
  const usersWithSource = allUsers.map((u) => {
    let paymentSource: "whatsapp" | "website" | "app" | "free" = "free";
    if (u.payments.length > 0) {
      const ref = u.payments[0].reference?.toLowerCase() ?? "";
      if (ref.includes("wa-checkout") || ref.includes("whatsapp")) paymentSource = "whatsapp";
      else if (ref.includes("app") || ref.includes("mobile")) paymentSource = "app";
      else paymentSource = "website";
    }

    // Churn risk score (0-100): higher = more likely to churn
    const lastMsg = u.whatsappId ? lastMsgMap[u.whatsappId] : null;
    const daysSinceLastMsg = lastMsg
      ? Math.floor((Date.now() - new Date(lastMsg).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const msgRate = u._count.whatsappLogs;
    let churnRisk = 0;
    if (daysSinceLastMsg > 14) churnRisk += 40;
    else if (daysSinceLastMsg > 7) churnRisk += 25;
    else if (daysSinceLastMsg > 3) churnRisk += 10;
    if (msgRate < 5) churnRisk += 30;
    else if (msgRate < 15) churnRisk += 15;
    if (!u.isPremium) churnRisk += 15;
    if (u._count.portfolioAssets === 0) churnRisk += 15;
    churnRisk = Math.min(100, churnRisk);

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
      churnRisk,
      lastMessageAt: lastMsg ?? null,
      daysSinceLastMsg,
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

  // ── Campaign Attribution Analytics ────────────────────────────────────────
  const campaignLogs = await prisma.whatsAppLog.findMany({
    where: { msgType: "campaign_track" },
    select: { message: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const campaignStats: Record<string, { total: number; last7d: number; last30d: number }> = {
    meta: { total: 0, last7d: 0, last30d: 0 },
    google: { total: 0, last7d: 0, last30d: 0 },
    linkedin: { total: 0, last7d: 0, last30d: 0 },
    tiktok: { total: 0, last7d: 0, last30d: 0 },
    referral: { total: 0, last7d: 0, last30d: 0 },
    organic: { total: 0, last7d: 0, last30d: 0 },
  };

  const now = Date.now();
  const d7 = now - 7 * 86400000;
  const d30 = now - 30 * 86400000;

  campaignLogs.forEach((log) => {
    const sourceMatch = log.message.match(/source=(\w+)/);
    const source = sourceMatch?.[1] ?? "organic";
    if (campaignStats[source]) {
      campaignStats[source].total++;
      const t = new Date(log.createdAt).getTime();
      if (t >= d7) campaignStats[source].last7d++;
      if (t >= d30) campaignStats[source].last30d++;
    }
  });

  // Calculate estimated cost-per-acquisition per channel
  const adBudget: Record<string, number> = {
    meta: 10000, google: 6000, linkedin: 4000, tiktok: 0,
  };
  const campaignROI = Object.entries(campaignStats).map(([source, stats]) => ({
    source,
    ...stats,
    cpa: stats.last30d > 0 && adBudget[source]
      ? Math.round((adBudget[source] ?? 0) / stats.last30d)
      : null,
  }));

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
    revenue: {
      totalRevenue,
      mrr: Math.round(mrr),
      arr: Math.round(arr),
      revenueToday,
      monthlyRevenue,
      totalPayments: allPayments.length,
    },
    campaigns: {
      bySource: campaignStats,
      roi: campaignROI,
      totalAdAttributed: campaignLogs.length,
    },
    heatmap: { data: heatmap, days: dayNames },
    recentLogs,
    sessions,
    users: usersWithSource,
    messagesTodayMap: msgTodayMap,
  });
}
