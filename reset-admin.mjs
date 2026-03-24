import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
  const email = "admin@sentill.africa";
  const rawPassword = "Admin@2024";

  try {
    const hashed = await bcrypt.hash(rawPassword, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashed,
        isPremium: true,
        premiumActivatedAt: now,
        premiumExpiresAt: expiresAt,
        role: "ADMIN"
      },
      create: {
        name: "System Admin",
        email,
        password: hashed,
        isPremium: true,
        premiumActivatedAt: now,
        premiumExpiresAt: expiresAt,
        role: "ADMIN"
      }
    });

    console.log("✅ Admin account ready:", user.email);
    console.log("   Password: Admin@2024");
    console.log("   Role:", user.role);
    console.log("   Premium until:", expiresAt.toISOString());

    // Also ensure bestwebkenya@gmail.com has correct password
    const bwk = await prisma.user.findUnique({ where: { email: "bestwebkenya@gmail.com" } });
    if (bwk) {
      const bwkHash = await bcrypt.hash("Kakall@85", 10);
      await prisma.user.update({
        where: { email: "bestwebkenya@gmail.com" },
        data: { password: bwkHash, isPremium: true, premiumActivatedAt: now, premiumExpiresAt: expiresAt }
      });
      console.log("✅ bestwebkenya@gmail.com password verified — Kakall@85");
    }

  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdmin();
