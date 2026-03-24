const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upgradeUser() {
  const email = "bestwebkenya@gmail.com";
  
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const user = await prisma.user.update({
      where: { email },
      data: {
        isPremium: true,
        premiumActivatedAt: now,
        premiumExpiresAt: expiresAt
      }
    });

    console.log("✅ Upgraded to Premium:", user.email);
    console.log("Premium Expires At:", user.premiumExpiresAt);

  } catch(e) {
    console.error("Error upgrading user:", e);
  } finally {
    await prisma.$disconnect();
  }
}

upgradeUser();
