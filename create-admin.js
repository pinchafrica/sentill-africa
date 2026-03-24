const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt'); // Standard Next.js server component library

const prisma = new PrismaClient();

async function createPremiumUser() {
  const email = "bestwebkenya@gmail.com";
  const rawPassword = "Kakall@85";
  
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
       console.log("User already exists!");
       return;
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    // Set premium expiration to 30 days from now
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

    const user = await prisma.user.create({
      data: {
        name: "Robison Mwaniki",
        email: email,
        password: hashedPassword,
        isPremium: true,
        premiumActivatedAt: now,
        premiumExpiresAt: expiresAt,
        role: "USER"
      }
    });

    console.log("✅ Successfully created premium user:", user.email);
    console.log("Target Premium Expiry:", expiresAt.toISOString());

  } catch(e) {
    console.error("Error creating user:", e);
  } finally {
    await prisma.$disconnect();
  }
}

createPremiumUser();
