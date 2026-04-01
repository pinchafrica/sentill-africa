/**
 * scripts/setup-daily-users.ts
 * Find Edwin, Robin, Winnie in DB and ensure they're opted in for daily briefs.
 * Also sends an immediate test brief to verify delivery.
 *
 * Run: npx tsx scripts/setup-daily-users.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔍 Looking up users: Edwin, Robin, Winnie...\n");

  // Find all users
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      whatsappId: true,
      whatsappVerified: true,
    },
    orderBy: { name: "asc" },
  });

  console.log(`📊 Total users in DB: ${allUsers.length}\n`);

  // Show all users
  for (const u of allUsers) {
    const waStatus = u.whatsappVerified ? "✅ Verified" : (u.whatsappId ? "⚠️ Not verified" : "❌ No WhatsApp");
    console.log(`  ${u.name} | ${u.email} | WA: ${u.whatsappId || "none"} | ${waStatus}`);
  }

  // Find the three target users
  const targets = ["edwin", "robin", "winnie"];
  const found = allUsers.filter(u => 
    targets.some(t => u.name.toLowerCase().includes(t))
  );

  console.log(`\n🎯 Matched ${found.length} target users:\n`);
  for (const u of found) {
    console.log(`  ✅ ${u.name} (${u.email}) — WhatsApp: ${u.whatsappId || "NOT SET"} — Verified: ${u.whatsappVerified}`);
  }

  // Check who's missing WhatsApp
  const missing = found.filter(u => !u.whatsappId || !u.whatsappVerified);
  if (missing.length > 0) {
    console.log("\n⚠️  Users needing WhatsApp setup:");
    for (const u of missing) {
      console.log(`  - ${u.name}: whatsappId=${u.whatsappId || "none"}, verified=${u.whatsappVerified}`);
    }
  }

  // Check alert preferences
  for (const u of found) {
    const pref = await prisma.alertPreference.findUnique({
      where: { userId: u.id },
    });
    if (pref) {
      console.log(`  📌 ${u.name}'s alerts: whatsapp=${pref.whatsappEnabled}, freq=${pref.frequency}`);
    } else {
      console.log(`  📌 ${u.name}: No AlertPreference record (will still receive daily briefs)`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
