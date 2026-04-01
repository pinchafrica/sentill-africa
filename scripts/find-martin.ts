import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({
    where: { name: { contains: "Martin", mode: "insensitive" } },
    select: { id: true, name: true, email: true, whatsappId: true, isPremium: true },
  });
  console.log(JSON.stringify(users, null, 2));
  
  // Also check all users with whatsapp
  const waUsers = await p.user.findMany({
    where: { whatsappId: { not: null } },
    select: { id: true, name: true, whatsappId: true },
  });
  console.log("\nAll WhatsApp users:");
  console.log(JSON.stringify(waUsers, null, 2));
  
  await p.$disconnect();
}
main();
