import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function mapEdwinToAdmin() {
  const email = "edwinmule@gmail.com";
  const defaultPassword = "Admin@2024"; // Same as the other admin for consistency

  try {
    const hashed = await bcrypt.hash(defaultPassword, 10);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: "ADMIN",
        isPremium: true,
        premiumActivatedAt: now,
        premiumExpiresAt: expiresAt,
        password: hashed // Ensure we have a known password to log in
      },
      create: {
        name: "Edwin Mule",
        email,
        password: hashed,
        role: "ADMIN",
        isPremium: true,
        premiumActivatedAt: now,
        premiumExpiresAt: expiresAt
      }
    });

    console.log("✅ successfully mapped edwinmule@gmail.com to ADMIN");
    console.log("   Email: " + user.email);
    console.log("   Password: " + defaultPassword);
    console.log("   Role: " + user.role);

  } catch (e) {
    console.error("Error mapping user:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

mapEdwinToAdmin();
