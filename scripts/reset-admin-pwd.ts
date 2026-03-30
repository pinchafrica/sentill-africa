import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const newPassword = "Admin@2025!";
  const hashed = await bcrypt.hash(newPassword, 10);

  // Reset admin@sentill.africa
  const admin = await prisma.user.upsert({
    where: { email: "admin@sentill.africa" },
    update: { password: hashed, role: "ADMIN", isPremium: true },
    create: {
      email: "admin@sentill.africa",
      name: "System Admin",
      password: hashed,
      role: "ADMIN",
      isPremium: true,
    },
  });

  // Reset edwinmule@gmail.com
  const edwin = await prisma.user.upsert({
    where: { email: "edwinmule@gmail.com" },
    update: { password: hashed, role: "ADMIN", isPremium: true },
    create: {
      email: "edwinmule@gmail.com",
      name: "Edwin Mule",
      password: hashed,
      role: "ADMIN",
      isPremium: true,
    },
  });

  console.log("\n✅ Passwords reset successfully!");
  console.log("─────────────────────────────────");
  console.log(`  admin@sentill.africa  → Admin@2025!  [${admin.role}]`);
  console.log(`  edwinmule@gmail.com   → Admin@2025!  [${edwin.role}]`);
  console.log("─────────────────────────────────\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
