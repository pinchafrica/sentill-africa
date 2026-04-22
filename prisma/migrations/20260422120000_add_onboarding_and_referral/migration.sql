-- AlterTable: add onboarding goal + referral tracking to User
ALTER TABLE "User" ADD COLUMN     "onboardingGoal" TEXT,
ADD COLUMN     "referredBy" TEXT;
