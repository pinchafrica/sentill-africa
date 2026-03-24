import SystemAdminDashboard from "@/components/SystemAdminDashboard";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Fetch Live Global Stats
  const totalUsers = await prisma.user.count();
  const premiumUsers = await prisma.user.count({ where: { isPremium: true } });
  
  // Aggregate AUM (Sum of all Portfolios)
  const allAssets = await prisma.portfolioAsset.aggregate({
    _sum: { principal: true },
  });
  const totalAUM = allAssets._sum.principal || 0;

  return (
    <SystemAdminDashboard 
      totalUsers={totalUsers} 
      premiumUsers={premiumUsers} 
      totalAUM={totalAUM} 
    />
  );
}