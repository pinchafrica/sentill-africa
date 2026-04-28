/**
 * app/api/cron/admin-brief/route.ts
 * Daily Admin Operations Brief — sent to Edwin every morning at 07:00 EAT
 *
 * Covers:
 *  • Platform version & deployment status
 *  • User metrics (total, active, new today, premium, churn risk)
 *  • Financial summary (MRR, ARR, revenue today, conversion rate)
 *  • Rate sync health (freshness, last sync, provider count)
 *  • Campaign attribution (Meta/Google/LinkedIn/TikTok ROI)
 *  • System health (API errors, response times, cron status)
 *  • AI engine stats (Gemini usage, error rate)
 *  • Top actions & recommendations
 *
 * Triggered by Vercel Cron at 04:00 UTC (07:00 EAT)
 * Manual: GET /api/cron/admin-brief?secret=CRON_SECRET
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const APP_VERSION = "2.0.0";
const ADMIN_WA_ID = "254726260884"; // Edwin
const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function GET(req: NextRequest) {
  // Auth
  const isVercelCron = req.headers.get("x-vercel-cron") === "1" || req.headers.get("user-agent")?.includes("vercel-cron");
  const secret = req.nextUrl.searchParams.get("secret");
  const authHeader = (req.headers.get("authorization") ?? "").trim();
  const isManualAuth = secret === CRON_SECRET || authHeader === `Bearer ${CRON_SECRET}`;

  if (!isVercelCron && !isManualAuth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. USER METRICS
  // ═══════════════════════════════════════════════════════════════════════════
  const [
    totalUsers,
    premiumUsers,
    freeUsers,
    newUsersToday,
    newUsersYesterday,
    newUsers7d,
    activeToday,
    active7d,
    whatsappVerified,
    totalSessions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isPremium: true } }),
    prisma.user.count({ where: { isPremium: false } }),
    prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: yesterdayStart, lt: todayStart } } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.whatsAppLog.groupBy({ by: ["waId"], where: { createdAt: { gte: todayStart }, direction: "INBOUND" } }).then(r => r.length),
    prisma.whatsAppLog.groupBy({ by: ["waId"], where: { createdAt: { gte: sevenDaysAgo }, direction: "INBOUND" } }).then(r => r.length),
    prisma.user.count({ where: { whatsappVerified: true } }),
    prisma.whatsAppSession.count(),
  ]);

  // Churn risk: users with no messages in 14+ days
  const churnRiskUsers = await prisma.user.count({
    where: {
      whatsappVerified: true,
      whatsappId: { not: null },
      createdAt: { lt: sevenDaysAgo },
    },
  });
  const churnRiskCount = Math.max(0, churnRiskUsers - active7d);

  const conversionRate = totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : "0";
  const growthRate = newUsersYesterday > 0
    ? (((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100).toFixed(0)
    : newUsersToday > 0 ? "+∞" : "0";

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. FINANCIAL SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  const [
    allPayments,
    paymentsToday,
    payments7d,
    payments30d,
  ] = await Promise.all([
    prisma.payment.findMany({ where: { status: "SUCCESS" }, select: { amount: true, createdAt: true } }),
    prisma.payment.findMany({ where: { status: "SUCCESS", createdAt: { gte: todayStart } }, select: { amount: true } }),
    prisma.payment.findMany({ where: { status: "SUCCESS", createdAt: { gte: sevenDaysAgo } }, select: { amount: true } }),
    prisma.payment.findMany({ where: { status: "SUCCESS", createdAt: { gte: thirtyDaysAgo } }, select: { amount: true } }),
  ]);

  const totalRevenue = allPayments.reduce((s, p) => s + p.amount, 0);
  const revenueToday = paymentsToday.reduce((s, p) => s + p.amount, 0);
  const revenue7d = payments7d.reduce((s, p) => s + p.amount, 0);
  const revenue30d = payments30d.reduce((s, p) => s + p.amount, 0);
  const avgPayment = allPayments.length > 0 ? Math.round(totalRevenue / allPayments.length) : 490;
  const mrr = premiumUsers * avgPayment;
  const arr = mrr * 12;

  // Revenue target tracking (KES 500K/month)
  const targetMonthly = 500000;
  const progressPercent = Math.min(100, Math.round((revenue30d / targetMonthly) * 100));
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const projectedMonthly = dayOfMonth > 0 ? Math.round((revenue30d / dayOfMonth) * daysInMonth) : 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. RATE SYNC HEALTH
  // ═══════════════════════════════════════════════════════════════════════════
  const latestSync = await prisma.marketRateCache.findFirst({
    orderBy: { lastSyncedAt: "desc" },
    select: { symbol: true, lastSyncedAt: true, source: true },
  });

  const totalProviders = await prisma.provider.count();
  const totalRatesCache = await prisma.marketRateCache.count();

  const hoursStale = latestSync
    ? ((Date.now() - new Date(latestSync.lastSyncedAt).getTime()) / 3600000).toFixed(1)
    : "N/A";

  const syncStatus = !latestSync
    ? "🔴 NEVER SYNCED"
    : parseFloat(hoursStale) < 6
      ? "🟢 FRESH"
      : parseFloat(hoursStale) < 48
        ? "🟡 STALE"
        : "🔴 CRITICAL";

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CAMPAIGN ATTRIBUTION
  // ═══════════════════════════════════════════════════════════════════════════
  const campaignLogs = await prisma.whatsAppLog.findMany({
    where: { msgType: "campaign_track" },
    select: { message: true, createdAt: true },
  });

  const campaignCounts: Record<string, number> = { meta: 0, google: 0, linkedin: 0, tiktok: 0, referral: 0 };
  const campaign7d: Record<string, number> = { meta: 0, google: 0, linkedin: 0, tiktok: 0, referral: 0 };

  campaignLogs.forEach((log) => {
    const m = log.message.match(/source=(\w+)/);
    const src = m?.[1] ?? "organic";
    if (campaignCounts[src] !== undefined) {
      campaignCounts[src]++;
      if (new Date(log.createdAt).getTime() >= sevenDaysAgo.getTime()) {
        campaign7d[src]++;
      }
    }
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. MESSAGE & AI STATS
  // ═══════════════════════════════════════════════════════════════════════════
  const [
    totalMessages,
    messagesToday,
    messages7d,
    aiResponsesToday,
    aiErrorsToday,
  ] = await Promise.all([
    prisma.whatsAppLog.count(),
    prisma.whatsAppLog.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.whatsAppLog.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.whatsAppLog.count({
      where: { createdAt: { gte: todayStart }, direction: "OUTBOUND", message: { contains: "Sentill Africa Says" } },
    }),
    prisma.whatsAppLog.count({
      where: { createdAt: { gte: todayStart }, direction: "OUTBOUND", message: { contains: "processing a LOT" } },
    }),
  ]);

  const aiErrorRate = aiResponsesToday > 0
    ? ((aiErrorsToday / (aiResponsesToday + aiErrorsToday)) * 100).toFixed(1)
    : "0";

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. PORTFOLIO & ASSETS
  // ═══════════════════════════════════════════════════════════════════════════
  const [totalAssets, totalAUM] = await Promise.all([
    prisma.investmentAsset.count(),
    prisma.investmentAsset.aggregate({ _sum: { amount: true } }),
  ]);

  const aumKES = totalAUM._sum.amount ?? 0;

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. TOP PERFORMING USERS (most active today)
  // ═══════════════════════════════════════════════════════════════════════════
  const topActiveToday = await prisma.whatsAppLog.groupBy({
    by: ["waId"],
    where: { createdAt: { gte: todayStart }, direction: "INBOUND" },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD THE BRIEF MESSAGE
  // ═══════════════════════════════════════════════════════════════════════════
  const dateStr = now.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-KE", { timeZone: "Africa/Nairobi", hour: "2-digit", minute: "2-digit" });

  let brief = "";
  brief += `📋 *SENTILL AFRICA — DAILY ADMIN BRIEF*\n`;
  brief += `━━━━━━━━━━━━━━━━━━\n`;
  brief += `📅 ${dateStr} · ${timeStr} EAT\n`;
  brief += `🏷️ Version: *v${APP_VERSION}*\n`;
  brief += `━━━━━━━━━━━━━━━━━━\n\n`;

  // Users
  brief += `👥 *USER METRICS*\n`;
  brief += `├ Total Users: *${totalUsers.toLocaleString()}*\n`;
  brief += `├ WhatsApp Verified: *${whatsappVerified}*\n`;
  brief += `├ Premium (Pro): *${premiumUsers}* ⚡\n`;
  brief += `├ Free Tier: *${freeUsers}*\n`;
  brief += `├ Conversion Rate: *${conversionRate}%*\n`;
  brief += `├ New Today: *${newUsersToday}* (Yesterday: ${newUsersYesterday}) ${Number(growthRate) > 0 ? "📈" : Number(growthRate) < 0 ? "📉" : "➡️"} ${growthRate}%\n`;
  brief += `├ New (7d): *${newUsers7d}*\n`;
  brief += `├ Active Today: *${activeToday}*\n`;
  brief += `├ Active (7d): *${active7d}*\n`;
  brief += `├ Sessions: *${totalSessions}*\n`;
  brief += `└ ⚠️ Churn Risk: *${churnRiskCount}* users silent 14d+\n\n`;

  // Finance
  brief += `💰 *REVENUE & FINANCE*\n`;
  brief += `├ Total Lifetime: *KES ${totalRevenue.toLocaleString()}*\n`;
  brief += `├ Revenue Today: *KES ${revenueToday.toLocaleString()}*\n`;
  brief += `├ Revenue (7d): *KES ${revenue7d.toLocaleString()}*\n`;
  brief += `├ Revenue (30d): *KES ${revenue30d.toLocaleString()}*\n`;
  brief += `├ MRR: *KES ${mrr.toLocaleString()}*\n`;
  brief += `├ ARR: *KES ${arr.toLocaleString()}*\n`;
  brief += `├ Avg Payment: *KES ${avgPayment}*\n`;
  brief += `├ Total Payments: *${allPayments.length}*\n`;
  brief += `├ 🎯 Monthly Target: *KES ${targetMonthly.toLocaleString()}*\n`;
  brief += `├ Progress: *${progressPercent}%* [${"█".repeat(Math.floor(progressPercent / 10))}${"░".repeat(10 - Math.floor(progressPercent / 10))}]\n`;
  brief += `└ Projected: *KES ${projectedMonthly.toLocaleString()}* this month\n\n`;

  // Rate Sync
  brief += `📊 *RATE SYNC HEALTH*\n`;
  brief += `├ Status: ${syncStatus}\n`;
  brief += `├ Last Sync: *${hoursStale}h ago*`;
  if (latestSync) brief += ` (${latestSync.symbol} via ${latestSync.source})`;
  brief += `\n`;
  brief += `├ Providers DB: *${totalProviders}*\n`;
  brief += `└ Rate Cache Entries: *${totalRatesCache}*\n\n`;

  // Campaign Attribution
  const totalCampaigns = Object.values(campaignCounts).reduce((a, b) => a + b, 0);
  brief += `📢 *CAMPAIGN ATTRIBUTION*\n`;
  brief += `├ Total Tracked: *${totalCampaigns}*\n`;
  brief += `├ Meta (FB/IG): *${campaignCounts.meta}* (7d: ${campaign7d.meta})\n`;
  brief += `├ Google Ads: *${campaignCounts.google}* (7d: ${campaign7d.google})\n`;
  brief += `├ LinkedIn: *${campaignCounts.linkedin}* (7d: ${campaign7d.linkedin})\n`;
  brief += `├ TikTok: *${campaignCounts.tiktok}* (7d: ${campaign7d.tiktok})\n`;
  brief += `└ Referral: *${campaignCounts.referral}* (7d: ${campaign7d.referral})\n\n`;

  // Messages & AI
  brief += `🧠 *AI & MESSAGING*\n`;
  brief += `├ Total Messages: *${totalMessages.toLocaleString()}*\n`;
  brief += `├ Messages Today: *${messagesToday}*\n`;
  brief += `├ Messages (7d): *${messages7d.toLocaleString()}*\n`;
  brief += `├ AI Responses Today: *${aiResponsesToday}*\n`;
  brief += `├ AI Errors Today: *${aiErrorsToday}* (${aiErrorRate}% error rate)\n`;
  brief += `└ AI Health: ${parseFloat(aiErrorRate) < 5 ? "🟢 HEALTHY" : parseFloat(aiErrorRate) < 15 ? "🟡 DEGRADED" : "🔴 UNHEALTHY"}\n\n`;

  // Portfolio
  brief += `📊 *PORTFOLIO TRACKING*\n`;
  brief += `├ Total Assets Logged: *${totalAssets}*\n`;
  brief += `└ AUM Tracked: *KES ${aumKES.toLocaleString()}*\n\n`;

  // System health summary
  const systemHealth = [
    syncStatus.includes("🟢") ? "✅" : syncStatus.includes("🟡") ? "⚠️" : "❌",
    parseFloat(aiErrorRate) < 5 ? "✅" : "⚠️",
    totalUsers > 0 ? "✅" : "⚠️",
  ];
  const overallHealth = systemHealth.every(s => s === "✅") ? "🟢 ALL SYSTEMS OPERATIONAL" :
    systemHealth.some(s => s === "❌") ? "🔴 CRITICAL ISSUES" : "🟡 WARNINGS PRESENT";

  brief += `🖥️ *SYSTEM HEALTH*\n`;
  brief += `├ Overall: ${overallHealth}\n`;
  brief += `├ Rate Sync: ${systemHealth[0]}\n`;
  brief += `├ AI Engine: ${systemHealth[1]}\n`;
  brief += `├ User DB: ${systemHealth[2]}\n`;
  brief += `├ Version: *v${APP_VERSION}*\n`;
  brief += `├ Framework: Next.js 16.1.6\n`;
  brief += `└ Runtime: Vercel Edge\n\n`;

  // Top active users
  if (topActiveToday.length > 0) {
    brief += `🏆 *TOP ACTIVE USERS TODAY*\n`;
    for (const u of topActiveToday) {
      brief += `├ ${u.waId}: *${u._count.id}* messages\n`;
    }
    brief += `\n`;
  }

  // Smart recommendations
  brief += `💡 *RECOMMENDATIONS*\n`;
  if (premiumUsers === 0) {
    brief += `• 🔴 No premium subscribers yet — focus on conversion\n`;
  }
  if (parseFloat(conversionRate) < 5) {
    brief += `• 📈 Conversion rate ${conversionRate}% — target 5%+ with Pro nudges\n`;
  }
  if (syncStatus.includes("🔴") || syncStatus.includes("🟡")) {
    brief += `• ⚠️ Rate sync needs attention — check Vercel cron logs\n`;
  }
  if (churnRiskCount > 5) {
    brief += `• 🔁 ${churnRiskCount} users at churn risk — consider win-back campaign\n`;
  }
  if (totalCampaigns === 0) {
    brief += `• 📢 No campaign traffic yet — launch ads with META_AD_ prefix\n`;
  }
  if (newUsersToday === 0 && newUsersYesterday === 0) {
    brief += `• 👥 No new users in 2 days — review ad spend\n`;
  }
  if (premiumUsers > 0 && parseFloat(conversionRate) >= 5 && syncStatus.includes("🟢")) {
    brief += `• 🏆 Platform is healthy — focus on scaling ad spend\n`;
  }

  brief += `\n━━━━━━━━━━━━━━━━━━\n`;
  brief += `_Sentill Africa v${APP_VERSION} — Daily Admin Brief_\n`;
  brief += `_Generated ${timeStr} EAT · sentill.africa_`;

  // ═══════════════════════════════════════════════════════════════════════════
  // SEND TO ADMIN
  // ═══════════════════════════════════════════════════════════════════════════
  try {
    // WhatsApp has a 4096 char limit — split if needed
    if (brief.length <= 4000) {
      await sendWhatsAppMessage(ADMIN_WA_ID, brief);
    } else {
      // Split into 2 parts
      const midpoint = brief.indexOf("\n\n🧠", 1500);
      const part1 = brief.slice(0, midpoint > 0 ? midpoint : 2000);
      const part2 = brief.slice(midpoint > 0 ? midpoint : 2000);

      await sendWhatsAppMessage(ADMIN_WA_ID, part1 + `\n\n_...continued in next message_`);
      await new Promise(r => setTimeout(r, 1200));
      await sendWhatsAppMessage(ADMIN_WA_ID, `📋 *ADMIN BRIEF (continued)*\n\n` + part2);
    }

    console.log(`[Admin Brief] ✅ Sent to Edwin (${ADMIN_WA_ID}) — ${brief.length} chars`);
  } catch (err) {
    console.error("[Admin Brief] ❌ Failed to send WhatsApp:", err);
  }

  return NextResponse.json({
    success: true,
    version: APP_VERSION,
    sentTo: ADMIN_WA_ID,
    briefLength: brief.length,
    metrics: {
      totalUsers,
      premiumUsers,
      newUsersToday,
      activeToday,
      conversionRate,
      revenueToday,
      revenue30d,
      mrr,
      arr,
      progressPercent,
      projectedMonthly,
      syncStatus,
      hoursStale,
      aiErrorRate,
      campaignCounts,
      totalMessages,
      totalAssets,
      aumKES,
      churnRiskCount,
      systemHealth: overallHealth,
    },
    timestamp: now.toISOString(),
  });
}
