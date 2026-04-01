import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  // Get all WhatsApp sessions with user names
  const sessions = await p.whatsAppSession.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { lastSeen: "desc" },
  });
  for (const s of sessions) {
    console.log(`WA:${s.waId} | User:${s.user?.name || 'unlinked'} | Email:${s.user?.email || 'n/a'} | State:${s.state} | Last:${s.lastSeen.toISOString().slice(0,10)}`);
  }
  
  // Also get users with whatsapp IDs
  console.log("\n--- Users with WhatsApp ---");
  const users = await p.user.findMany({
    where: { whatsappId: { not: null } },
    select: { name: true, email: true, whatsappId: true, whatsappVerified: true },
  });
  for (const u of users) {
    console.log(`${u.name} | ${u.email} | WA:${u.whatsappId} | Verified:${u.whatsappVerified}`);
  }
  
  await p.$disconnect();
}
main();
