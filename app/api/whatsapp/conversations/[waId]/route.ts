/**
 * app/api/whatsapp/conversations/[waId]/route.ts
 * Returns the full message thread for a specific WhatsApp conversation.
 * GET → Fetch messages for a specific waId
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ waId: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { waId } = await params;

  if (!waId) {
    return NextResponse.json({ error: "waId required" }, { status: 400 });
  }

  try {
    // Get all messages for this conversation
    const messages = await prisma.whatsAppLog.findMany({
      where: { waId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        direction: true,
        message: true,
        msgType: true,
        status: true,
        createdAt: true,
      },
    });

    // Get user info
    const user = await prisma.user.findFirst({
      where: { whatsappId: waId },
      select: {
        id: true,
        name: true,
        email: true,
        whatsappVerified: true,
        isPremium: true,
        premiumActivatedAt: true,
        premiumExpiresAt: true,
        createdAt: true,
        _count: {
          select: {
            portfolioAssets: true,
            payments: true,
          },
        },
      },
    });

    // Get session state
    const sessionState = await prisma.whatsAppSession.findUnique({
      where: { waId },
      select: { state: true, context: true, lastSeen: true },
    });

    // Compute analytics
    const inboundCount = messages.filter((m) => m.direction === "INBOUND").length;
    const outboundCount = messages.filter((m) => m.direction === "OUTBOUND").length;
    
    // Average response time calculation
    let totalResponseTime = 0;
    let responseCount = 0;
    for (let i = 1; i < messages.length; i++) {
      if (
        messages[i].direction === "OUTBOUND" &&
        messages[i - 1].direction === "INBOUND"
      ) {
        const diff =
          new Date(messages[i].createdAt).getTime() -
          new Date(messages[i - 1].createdAt).getTime();
        if (diff > 0 && diff < 300000) {
          // Only count responses within 5 min
          totalResponseTime += diff;
          responseCount++;
        }
      }
    }
    const avgResponseMs = responseCount > 0 ? totalResponseTime / responseCount : null;

    // First and last message dates
    const firstMessage = messages.length > 0 ? messages[0].createdAt : null;
    const lastMessage = messages.length > 0 ? messages[messages.length - 1].createdAt : null;

    // Topics analysis — extract unique keywords from inbound messages
    const inboundTexts = messages
      .filter((m) => m.direction === "INBOUND")
      .map((m) => m.message.toLowerCase());
    
    const topicKeywords = [
      "portfolio", "subscribe", "markets", "menu", "goals", "watchlist",
      "status", "renew", "help", "hi", "hello", "invest", "mmf", "t-bill",
      "bond", "sacco", "yield", "rate", "price", "nse", "stock",
    ];
    
    const topicCounts: Record<string, number> = {};
    topicKeywords.forEach((kw) => {
      const count = inboundTexts.filter((t) => t.includes(kw)).length;
      if (count > 0) topicCounts[kw] = count;
    });

    // Sort topics by frequency
    const topTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // ── AI Intelligence Score (0-100) ────────────────────────────────
    // Scores the AI's performance across 5 dimensions
    const outboundTexts = messages
      .filter((m) => m.direction === "OUTBOUND")
      .map((m) => m.message.toLowerCase());

    // 1. Response Coverage (0-20): Did the bot answer every user message?
    const coverageRatio = inboundCount > 0 ? Math.min(outboundCount / inboundCount, 1) : 0;
    const coverageScore = Math.round(coverageRatio * 20);

    // 2. Speed Score (0-20): How fast were responses?
    let speedScore = 10; // default
    if (avgResponseMs !== null) {
      if (avgResponseMs < 2000) speedScore = 20;
      else if (avgResponseMs < 5000) speedScore = 16;
      else if (avgResponseMs < 10000) speedScore = 12;
      else if (avgResponseMs < 30000) speedScore = 8;
      else speedScore = 4;
    }

    // 3. Content Depth (0-25): Does the response contain rates, data, numbers?
    const dataSignals = ["kes", "%", "yield", "rate", "return", "ksh", "invest",
      "portfolio", "mmf", "t-bill", "bond", "sacco", "nse", "dividend",
      "safaricom", "equity", "kcb", "compare", "chart", "analysis"];
    let dataHits = 0;
    outboundTexts.forEach((t) => {
      dataSignals.forEach((sig) => { if (t.includes(sig)) dataHits++; });
    });
    const depthRatio = outboundTexts.length > 0
      ? Math.min(dataHits / (outboundTexts.length * 3), 1)
      : 0;
    const depthScore = Math.round(depthRatio * 25);

    // 4. Engagement (0-20): Multi-turn conversations = better
    let engagementScore = 4;
    const totalMsgs = messages.length;
    if (totalMsgs >= 20) engagementScore = 20;
    else if (totalMsgs >= 12) engagementScore = 16;
    else if (totalMsgs >= 6) engagementScore = 12;
    else if (totalMsgs >= 3) engagementScore = 8;

    // 5. Topic Diversity (0-15): More topics covered = smarter
    const topicsCovered = Object.keys(topicCounts).length;
    let diversityScore = 3;
    if (topicsCovered >= 6) diversityScore = 15;
    else if (topicsCovered >= 4) diversityScore = 12;
    else if (topicsCovered >= 2) diversityScore = 8;

    const aiScore = Math.min(100, coverageScore + speedScore + depthScore + engagementScore + diversityScore);

    const aiScoreBreakdown = {
      total: aiScore,
      coverage: coverageScore,
      speed: speedScore,
      depth: depthScore,
      engagement: engagementScore,
      diversity: diversityScore,
      grade: aiScore >= 85 ? "A+" : aiScore >= 70 ? "A" : aiScore >= 55 ? "B" : aiScore >= 40 ? "C" : "D",
    };

    return NextResponse.json({
      waId,
      messages,
      user,
      sessionState,
      analytics: {
        totalMessages: messages.length,
        inboundCount,
        outboundCount,
        avgResponseMs,
        avgResponseFormatted: avgResponseMs
          ? avgResponseMs < 1000
            ? `${Math.round(avgResponseMs)}ms`
            : `${(avgResponseMs / 1000).toFixed(1)}s`
          : "N/A",
        firstMessage,
        lastMessage,
        topTopics,
        aiScore: aiScoreBreakdown,
      },
    });
  } catch (err) {
    console.error("[Conversation Thread API] Error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
