import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    // Return empty array for unauthenticated users — no crash
    if (!session?.id) {
      return NextResponse.json([]);
    }
    const userId = session.id;

    const assets = await prisma.portfolioAsset.findMany({
      where: { userId },
      include: { provider: true },
      orderBy: { loggedAt: "desc" },
    });

    // ── 1. Fetch AI rates for live valuation ──────────────────────────────────
    let aiRates: Record<string, number> = {};
    try {
      const aiRes = await fetch(`${new URL(req.url).origin}/api/market/ai-rates`);
      if (aiRes.ok) {
        const aiData = await aiRes.json();
        aiRates = aiData.rates || {};
      }
    } catch (e) {
      console.warn("[Portfolio Assets] AI Rate fetch failed.");
    }

    // ── 2. Update assets with live AI rates ────────────────────────────────────
    const liveAssets = assets.map(asset => {
      const symbol = (asset.provider?.slug || "").toUpperCase();
      const liveRate = aiRates[symbol] || aiRates[asset.providerId] || asset.provider?.currentYield || 0;
      
      const updatedProvider = asset.provider ? {
        ...asset.provider,
        currentYield: liveRate,
        isLive: !!(aiRates[symbol] || aiRates[asset.providerId])
      } : { currentYield: liveRate, isLive: false };

      return {
        ...asset,
        provider: updatedProvider,
        // Re-calculate projected yield based on live rate
        projectedYield: (asset.principal * (liveRate / 100))
      };
    });

    return NextResponse.json(liveAssets);
  } catch (error: any) {
    console.error("[API/Portfolio/Assets] GET Error:", error?.message);
    // Return empty array — NEVER return a non-array to prevent .reduce crash in consumers
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assetId, amount } = await req.json();

    if (!assetId || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create provider by slug or ID
    let provider = await prisma.provider.findFirst({
      where: {
        OR: [
          { id: assetId },
          { slug: assetId }
        ]
      }
    });

    if (!provider) {
      // Auto-create the provider if it doesn't exist to prevent 404 errors
      provider = await prisma.provider.create({
        data: {
          name: assetId.toUpperCase(),
          slug: assetId,
          type: "MONEY_MARKET", // Default fallback
          currentYield: 15.0, // Default fallback yield
          riskLevel: "LOW",
          description: "Auto-generated asset provider.",
          aum: "1000000000"
        }
      });
    }

    // Calculate projected yield (simple 17% for now if not in provider)
    const yieldRate = provider.currentYield / 100;
    const projectedYield = amount * yieldRate;

    const newAsset = await prisma.portfolioAsset.create({
      data: {
        userId: session.id,
        providerId: provider.id,
        principal: parseFloat(amount),
        projectedYield: projectedYield,
      },
      include: { provider: true }
    });

    return NextResponse.json(newAsset);

  } catch (error: any) {
    console.error("[API/Portfolio/Assets] POST Error:", error?.message);
    return NextResponse.json({ error: "Failed to log asset" }, { status: 500 });
  }
}
