/**
 * app/api/whatsapp/conversations/route.ts
 * Returns full conversation threads grouped by WhatsApp user.
 * Supports search, filter by status, pagination, and last message preview.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const filter = searchParams.get("filter") ?? "all"; // all, active, premium, unverified
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "50", 10);

  try {
    // Get all unique WhatsApp users from logs
    const uniqueWaIds = await prisma.whatsAppLog.groupBy({
      by: ["waId"],
      _count: { id: true },
      _max: { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
      where: {
        waId: { not: "WEBHOOK_RAW" }, // Exclude debug logs
      },
    });

    // Get user info for all waIds
    const allUsers = await prisma.user.findMany({
      where: { whatsappId: { in: uniqueWaIds.map((u) => u.waId) } },
      select: {
        id: true,
        name: true,
        email: true,
        whatsappId: true,
        whatsappVerified: true,
        isPremium: true,
        createdAt: true,
      },
    });

    const userMap: Record<string, typeof allUsers[0]> = {};
    allUsers.forEach((u) => {
      if (u.whatsappId) userMap[u.whatsappId] = u;
    });

    // Get session states
    const sessions = await prisma.whatsAppSession.findMany({
      select: { waId: true, state: true, lastSeen: true },
    });
    const sessionMap: Record<string, { state: string; lastSeen: Date }> = {};
    sessions.forEach((s) => {
      sessionMap[s.waId] = { state: s.state, lastSeen: s.lastSeen };
    });

    // Get last message per conversation (for preview text)
    const waIds = uniqueWaIds.map((u) => u.waId);
    const lastMessages = await prisma.whatsAppLog.findMany({
      where: {
        waId: { in: waIds },
        msgType: { not: "webhook_debug" },
      },
      orderBy: { createdAt: "desc" },
      distinct: ["waId"],
      select: {
        waId: true,
        message: true,
        direction: true,
        createdAt: true,
      },
    });
    const lastMsgMap: Record<string, { message: string; direction: string; createdAt: Date }> = {};
    lastMessages.forEach((m) => {
      lastMsgMap[m.waId] = { message: m.message, direction: m.direction, createdAt: m.createdAt };
    });

    // Build conversation list
    let conversations = uniqueWaIds.map((entry) => {
      const user = userMap[entry.waId];
      const sess = sessionMap[entry.waId];
      const lastMsg = lastMsgMap[entry.waId];
      return {
        waId: entry.waId,
        messageCount: entry._count.id,
        lastMessageAt: entry._max.createdAt,
        user: user
          ? {
              id: user.id,
              name: user.name,
              email: user.email,
              verified: user.whatsappVerified,
              isPremium: user.isPremium,
              joinedAt: user.createdAt,
            }
          : null,
        sessionState: sess?.state ?? "UNKNOWN",
        lastSeen: sess?.lastSeen ?? entry._max.createdAt,
        lastMessage: lastMsg
          ? {
              text: lastMsg.message.slice(0, 120),
              direction: lastMsg.direction,
            }
          : null,
      };
    });

    // Apply filters
    if (filter === "active") {
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      conversations = conversations.filter(
        (c) => c.lastMessageAt && new Date(c.lastMessageAt) >= dayAgo
      );
    } else if (filter === "premium") {
      conversations = conversations.filter((c) => c.user?.isPremium);
    } else if (filter === "unverified") {
      conversations = conversations.filter((c) => !c.user?.verified);
    } else if (filter === "unlinked") {
      conversations = conversations.filter((c) => !c.user);
    }

    // Apply search
    if (search) {
      conversations = conversations.filter(
        (c) =>
          c.waId.includes(search) ||
          c.user?.name?.toLowerCase().includes(search) ||
          c.user?.email?.toLowerCase().includes(search)
      );
    }

    const total = conversations.length;
    const paginated = conversations.slice((page - 1) * limit, page * limit);

    // Get today's message counts
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const [messagesToday, inboundToday, outboundToday, totalMessages] = await Promise.all([
      prisma.whatsAppLog.count({
        where: { createdAt: { gte: todayStart }, waId: { not: "WEBHOOK_RAW" } },
      }),
      prisma.whatsAppLog.count({
        where: { 
          createdAt: { gte: todayStart }, 
          direction: "INBOUND",
          waId: { not: "WEBHOOK_RAW" },
        },
      }),
      prisma.whatsAppLog.count({
        where: { 
          createdAt: { gte: todayStart }, 
          direction: "OUTBOUND",
          waId: { not: "WEBHOOK_RAW" },
        },
      }),
      prisma.whatsAppLog.count({
        where: { waId: { not: "WEBHOOK_RAW" } },
      }),
    ]);

    return NextResponse.json({
      conversations: paginated,
      total,
      page,
      limit,
      stats: {
        totalConversations: uniqueWaIds.length,
        totalMessages,
        messagesToday,
        inboundToday,
        outboundToday,
        activeToday: conversations.filter((c) => {
          const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return c.lastMessageAt && new Date(c.lastMessageAt) >= dayAgo;
        }).length,
      },
    });
  } catch (err) {
    console.error("[Conversations API] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
