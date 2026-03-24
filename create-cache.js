const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "MarketRateCache" (
          "id" TEXT NOT NULL,
          "symbol" TEXT NOT NULL,
          "price" DOUBLE PRECISION NOT NULL,
          "source" TEXT NOT NULL DEFAULT 'gemini-cron',
          "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "MarketRateCache_pkey" PRIMARY KEY ("id")
      )
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "MarketRateCache_symbol_key" ON "MarketRateCache"("symbol");
    `);
    
    console.log("SUCCESS: MarketRateCache table created.");
  } catch(e) {
    console.error("ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
