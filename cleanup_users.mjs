import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning up fake/demo users...");
  
  // Keep admin and pinch, delete others
  await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ["admin@sentill.africa", "pinch@sentill.africa", "edwinmule@gmail.com"]
      }
    }
  });

  console.log("Adding realistic users...");
  const hashedPassword = await bcrypt.hash("Password@123", 10);

  const realisticUsers = [
    { email: "sarah.mk@gmail.com", name: "Sarah Macharia", role: "USER", cashBalance: 125000, isPremium: true },
    { email: "j.ochieng88@yahoo.com", name: "James Ochieng", role: "USER", cashBalance: 45000, isPremium: false },
    { email: "mwangi.investments@outlook.com", name: "Peter Mwangi", role: "USER", cashBalance: 3200000, isPremium: true },
    { email: "a.mutua@corporate.co.ke", name: "Alice Mutua", role: "USER", cashBalance: 15600, isPremium: false },
    { email: "finance.chama@gmail.com", name: "Nairobi Tech Chama", role: "USER", cashBalance: 8500000, isPremium: true }
  ];

  for (const u of realisticUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, cashBalance: u.cashBalance, isPremium: u.isPremium },
      create: { 
        email: u.email, 
        name: u.name, 
        password: hashedPassword, 
        role: u.role, 
        cashBalance: u.cashBalance, 
        isPremium: u.isPremium 
      }
    });
  }

  console.log("Done updating users.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
