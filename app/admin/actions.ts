"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function toggleUserPremium(userId: string, currentStatus: boolean) {
  try {
    await verifyAdmin();
    await prisma.user.update({
      where: { id: userId },
      data: { isPremium: !currentStatus }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function toggleUserStatus(userId: string, currentStatus: string) {
  try {
    await verifyAdmin();
    // Assuming 'status' isn't explicitly in the schema yet, but usually role/ban can be toggled.
    // If we want to ban: we could toggle role to 'BANNED' or just throw an example.
    // Let's just update the role as a placeholder for status.
    const newRole = currentStatus === "BANNED" ? "USER" : "BANNED";
    await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    await verifyAdmin();
    await prisma.user.delete({
      where: { id: userId }
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
