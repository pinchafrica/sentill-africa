import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const STRATEGY_MAP: Record<string, any> = {
  "Sovereign Shield": [
    { slug: "ifb1_2024", weight: 0.7, type: "BOND", name: "IFB1/2024/6.5", yield: 18.5 },
    { slug: "etica", weight: 0.3, type: "MONEY_MARKET", name: "Etica MMF", yield: 17.5 }
  ],
  "Equity Growth": [
    { slug: "SCOM", weight: 0.4, type: "STOCK", name: "Safaricom PLC", yield: 12.4 },
    { slug: "EQTY", weight: 0.4, type: "STOCK", name: "Equity Group", yield: 14.1 },
    { slug: "lofty", weight: 0.2, type: "MONEY_MARKET", name: "Lofty Corban MMF", yield: 16.8 }
  ],
  "Balanced Wealth": [
    { slug: "fxd1_2024", weight: 0.4, type: "BOND", name: "FXD1/2024/10", yield: 16.4 },
    { slug: "sanlam", weight: 0.3, type: "MONEY_MARKET", name: "Sanlam Pesa MMF", yield: 16.2 },
    { slug: "KCB", weight: 0.3, type: "STOCK", name: "KCB Group", yield: 13.8 }
  ],
  "Dividend Income": [
    { slug: "EABL", weight: 0.5, type: "STOCK", name: "EABL", yield: 11.5 },
    { slug: "cic", weight: 0.5, type: "MONEY_MARKET", name: "CIC Wealth MMF", yield: 14.2 }
  ],
  "Global Diaspora": [
    { slug: "oldmutual", weight: 0.6, type: "MONEY_MARKET", name: "Old Mutual MMF", yield: 14.9 },
    { slug: "ncba", weight: 0.4, type: "MONEY_MARKET", name: "NCBA MMF", yield: 15.5 }
  ]
};

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { strategyName, principal } = await req.json();

    if (!strategyName || !principal) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const strategy = STRATEGY_MAP[strategyName];
    if (!strategy) {
      return NextResponse.json({ error: "Invalid strategy name" }, { status: 400 });
    }

    const principalAmount = parseFloat(principal);
    const results = [];

    for (const allocation of strategy) {
      const amount = principalAmount * allocation.weight;
      
      // Find or create provider
      let provider = await prisma.provider.findFirst({
        where: {
          OR: [
            { slug: allocation.slug },
            { name: allocation.name }
          ]
        }
      });

      if (!provider) {
        provider = await prisma.provider.create({
          data: {
            name: allocation.name,
            slug: allocation.slug,
            type: allocation.type,
            currentYield: allocation.yield,
            riskLevel: strategyName.includes("Equity") ? "HIGH" : "LOW",
            description: `Auto-generated for ${strategyName} strategy.`,
            aum: "1000000000"
          }
        });
      }

      const yieldRate = provider.currentYield / 100;
      const projectedYield = amount * yieldRate;

      const newAsset = await prisma.portfolioAsset.create({
        data: {
          userId: session.id,
          providerId: provider.id,
          principal: amount,
          projectedYield: projectedYield,
        },
        include: { provider: true }
      });
      
      results.push(newAsset);
    }

    return NextResponse.json({ 
      message: `Successfully cloned ${strategyName} strategy.`,
      assets: results 
    });

  } catch (error: any) {
    console.error("[API/Portfolio/Clone] POST Error:", error?.message);
    return NextResponse.json({ error: "Failed to clone strategy" }, { status: 500 });
  }
}
