import { prisma } from "@/lib/prisma";
import AdminUsersTable from "@/components/AdminUsersTable";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return <AdminUsersTable users={users} />;
}
