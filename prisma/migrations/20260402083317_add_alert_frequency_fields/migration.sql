/*
  Warnings:

  - A unique constraint covering the columns `[whatsappId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AlertPreference" ADD COLUMN     "lastWeeklySent" TIMESTAMP(3),
ADD COLUMN     "marketMoversAlerts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "watchlistAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "weeklyDay" TEXT NOT NULL DEFAULT 'MONDAY',
ADD COLUMN     "yieldThreshold" DOUBLE PRECISION,
ALTER COLUMN "frequency" SET DEFAULT 'DAILY';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "otpCode" TEXT,
ADD COLUMN     "otpExpiry" TIMESTAMP(3),
ADD COLUMN     "whatsappId" TEXT,
ADD COLUMN     "whatsappVerified" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MarketRateCache" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'gemini-cron',
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketRateCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppSession" (
    "id" TEXT NOT NULL,
    "waId" TEXT NOT NULL,
    "userId" TEXT,
    "state" TEXT NOT NULL DEFAULT 'IDLE',
    "context" TEXT NOT NULL DEFAULT '{}',
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppLog" (
    "id" TEXT NOT NULL,
    "waId" TEXT NOT NULL,
    "userId" TEXT,
    "direction" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "msgType" TEXT NOT NULL DEFAULT 'text',
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "encryptedKey" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "authTag" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastRotated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketRateCache_symbol_key" ON "MarketRateCache"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppSession_waId_key" ON "WhatsAppSession"("waId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_service_key" ON "ApiKey"("service");

-- CreateIndex
CREATE UNIQUE INDEX "User_whatsappId_key" ON "User"("whatsappId");

-- AddForeignKey
ALTER TABLE "WhatsAppSession" ADD CONSTRAINT "WhatsAppSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppLog" ADD CONSTRAINT "WhatsAppLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
