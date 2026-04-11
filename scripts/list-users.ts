import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const users = await p.user.findMany({
    select: { id: true, name: true, email: true, whatsappId: true, whatsappVerified: true, isPremium: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Total users: ${users.length}`);
  for (const u of users) {
    console.log(`${u.name} | ${u.email} | WA:${u.whatsappId || "none"} | V:${u.whatsappVerified} | Pro:${u.isPremium} | ${u.createdAt.toISOString().slice(0,10)}`);
  }
  const sessions = await p.whatsAppSession.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { lastSeen: "desc" },
  });
  console.log(`\nSessions: ${sessions.length}`);
  for (const s of sessions) {
    console.log(`  WA:${s.waId} | ${s.user?.name || "unlinked"} | State:${s.state}`);
  }
  await p.$disconnect();
}
main();
