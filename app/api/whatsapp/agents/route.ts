/**
 * app/api/whatsapp/agents/route.ts
 * Returns real WhatsApp pipeline metrics for the AI agents dashboard.
 * Pulls actual data from WhatsApp logs to show real processing stats.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const h1 = new Date(now - 3600000);     // 1 hour
  const h24 = new Date(now - 86400000);    // 24 hours
  const d7 = new Date(now - 7 * 86400000); // 7 days

  try {
    const [
      totalMessages,
      msgsLastHour,
      msgsToday,
      inboundToday,
      outboundToday,
      failedToday,
      uniqueUsersToday,
      avgResponsePairs,
    ] = await Promise.all([
      prisma.whatsAppLog.count({ where: { waId: { not: "WEBHOOK_RAW" } } }),
      prisma.whatsAppLog.count({ where: { createdAt: { gte: h1 }, waId: { not: "WEBHOOK_RAW" } } }),
      prisma.whatsAppLog.count({ where: { createdAt: { gte: h24 }, waId: { not: "WEBHOOK_RAW" } } }),
      prisma.whatsAppLog.count({ where: { createdAt: { gte: h24 }, direction: "INBOUND", waId: { not: "WEBHOOK_RAW" } } }),
      prisma.whatsAppLog.count({ where: { createdAt: { gte: h24 }, direction: "OUTBOUND", waId: { not: "WEBHOOK_RAW" } } }),
      prisma.whatsAppLog.count({ where: { createdAt: { gte: h24 }, status: "FAILED" } }),
      prisma.whatsAppLog.groupBy({ by: ["waId"], where: { createdAt: { gte: h24 }, waId: { not: "WEBHOOK_RAW" } } }),
      // Get recent inbound+outbound pairs for response time calc
      prisma.whatsAppLog.findMany({
        where: { createdAt: { gte: h1 }, waId: { not: "WEBHOOK_RAW" } },
        orderBy: { createdAt: "asc" },
        select: { direction: true, createdAt: true, waId: true },
        take: 200,
      }),
    ]);

    // Calculate average response time from message pairs
    let totalResponseMs = 0;
    let responseCount = 0;
    const grouped: Record<string, typeof avgResponsePairs> = {};
    avgResponsePairs.forEach((m) => {
      if (!grouped[m.waId]) grouped[m.waId] = [];
      grouped[m.waId].push(m);
    });
    Object.values(grouped).forEach((msgs) => {
      for (let i = 1; i < msgs.length; i++) {
        if (msgs[i].direction === "OUTBOUND" && msgs[i - 1].direction === "INBOUND") {
          const diff = new Date(msgs[i].createdAt).getTime() - new Date(msgs[i - 1].createdAt).getTime();
          if (diff > 0 && diff < 120000) { totalResponseMs += diff; responseCount++; }
        }
      }
    });
    const avgResponseMs = responseCount > 0 ? Math.round(totalResponseMs / responseCount) : null;

    // Error rate
    const errorRate = msgsToday > 0 ? ((failedToday / msgsToday) * 100).toFixed(1) : "0";

    // Hourly throughput (last 24h)
    const hourlyLogs = await prisma.whatsAppLog.findMany({
      where: { createdAt: { gte: h24 }, waId: { not: "WEBHOOK_RAW" } },
      select: { createdAt: true, direction: true },
    });
    const hourlyBuckets: { hour: string; inbound: number; outbound: number }[] = [];
    for (let i = 23; i >= 0; i--) {
      const start = new Date(now - (i + 1) * 3600000);
      const end = new Date(now - i * 3600000);
      const bucket = hourlyLogs.filter((l) => {
        const t = new Date(l.createdAt).getTime();
        return t >= start.getTime() && t < end.getTime();
      });
      hourlyBuckets.push({
        hour: end.toLocaleTimeString("en-KE", { hour: "2-digit", hour12: false }),
        inbound: bucket.filter((l) => l.direction === "INBOUND").length,
        outbound: bucket.filter((l) => l.direction === "OUTBOUND").length,
      });
    }

    return NextResponse.json({
      pipeline: {
        totalProcessed: totalMessages,
        processedLastHour: msgsLastHour,
        processedToday: msgsToday,
        inboundToday,
        outboundToday,
        failedToday,
        uniqueUsersToday: uniqueUsersToday.length,
        avgResponseMs,
        avgResponseFormatted: avgResponseMs
          ? avgResponseMs < 1000 ? `${avgResponseMs}ms` : `${(avgResponseMs / 1000).toFixed(1)}s`
          : "N/A",
        errorRate: parseFloat(errorRate),
        systemHealth: Math.max(0, 100 - parseFloat(errorRate) * 5),
      },
      hourlyThroughput: hourlyBuckets,
    });
  } catch (err) {
    console.error("[Agents API] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
