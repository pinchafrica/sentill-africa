"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function getDashboardData() {
  try {
    const session = await getSession();
    const userId = session?.id || "pilot-jd-001"; // Fallback to pilot for demo if no session

    const user = await prisma.user.findFirst({
      where: { id: userId },
      include: {
        goals: true,
        achievements: true,
        watchlists: true,
      }
    });

    const portfolio = await prisma.portfolioAsset.findMany({
      where: { userId: userId },
      include: { provider: true },
      orderBy: { loggedAt: "desc" },
    });

    const totalWorth = portfolio.reduce((acc, asset) => acc + asset.principal, 0);
    const avgYield = portfolio.length > 0 
      ? portfolio.reduce((acc, asset) => acc + asset.provider.currentYield, 0) / portfolio.length 
      : 0;
    
    // Calculate category distribution
    const categories: Record<string, number> = {};
    portfolio.forEach(asset => {
      const type = asset.provider.type;
      categories[type] = (categories[type] || 0) + asset.principal;
    });

    const distribution = Object.entries(categories).map(([label, value]) => ({
      label,
      value: totalWorth > 0 ? (value / totalWorth) * 100 : 0,
    }));

    const u = user as any;
    const totalXP = u?.totalXP || 0;
    const level = Math.floor(totalXP / 500) + 1;
    const xpProgress = Math.round((totalXP % 500) / 500 * 100);

    // Map UserGoal fields to what GoalTracker expects
    const goals = (u?.goals || []).map((g: any) => ({
      title: g.name,
      targetAmount: g.target,
      currentAmount: 0, // No current tracking in schema yet
    }));

    return {
      portfolio,
      totalWorth,
      avgYield,
      distribution,
      gamification: {
        totalXP,
        level,
        xpProgress,
        currentStreak: u?.currentStreak || 0,
        achievements: u?.achievements || [],
      },
      goals,
    };
  } catch (error) {
    console.error("Dashboard data fetch failed:", error);
    return null;
  }
}

export async function getProviders() {
  try {
    return await prisma.provider.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch providers:", error);
    return [];
  }
}

export async function logAsset(providerId: string, principal: number) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");
    const userId = session.id;

    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
    });

    if (!provider) throw new Error("Provider not found");

    await prisma.portfolioAsset.create({
      data: {
        userId: userId,
        providerId,
        principal,
        projectedYield: (principal * provider.currentYield) / 100,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Asset logging failed:", error);
    return { success: false, error: error.message };
  }
}
