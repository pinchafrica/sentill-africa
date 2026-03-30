/**
 * app/api/whatsapp/me/route.ts
 * Authenticated user WhatsApp settings CRUD.
 * GET    → Return user's current WhatsApp status
 * POST   → Save phone number + notification preferences
 * DELETE → Unlink WhatsApp from account
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/whatsapp";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [user, pref] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: { whatsappId: true, whatsappVerified: true },
    }),
    prisma.alertPreference.findUnique({ where: { userId: session.id } }),
  ]);

  return NextResponse.json({
    linked: !!user?.whatsappId,
    verified: user?.whatsappVerified ?? false,
    phoneNumber: user?.whatsappId ?? null,
    notificationsEnabled: pref?.whatsappEnabled ?? false,
    frequency: pref?.frequency ?? "DAILY",
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { phone, notificationsEnabled, frequency } = await req.json();

  if (!phone) {
    return NextResponse.json({ error: "Phone number required" }, { status: 400 });
  }

  const normalized = normalizePhone(phone.toString());

  // Check if this number is already used by another user
  const conflict = await prisma.user.findFirst({
    where: { whatsappId: normalized, NOT: { id: session.id } },
  });
  if (conflict) {
    return NextResponse.json(
      { error: "This WhatsApp number is already linked to another account" },
      { status: 409 }
    );
  }

  // Update user WhatsApp fields
  await prisma.user.update({
    where: { id: session.id },
    data: {
      whatsappId: normalized,
      // Mark unverified — verification happens via OTP flow in bot
      whatsappVerified: false,
    },
  });

  // Upsert alert preferences
  await prisma.alertPreference.upsert({
    where: { userId: session.id },
    create: {
      userId: session.id,
      whatsappEnabled: notificationsEnabled ?? false,
      whatsappNumber: normalized,
      frequency: frequency ?? "DAILY",
    },
    update: {
      whatsappEnabled: notificationsEnabled ?? false,
      whatsappNumber: normalized,
      frequency: frequency ?? "DAILY",
    },
  });

  return NextResponse.json({ success: true, message: "Settings saved. Send 'Hi' to the bot to verify!" });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.user.update({
    where: { id: session.id },
    data: { whatsappId: null, whatsappVerified: false, otpCode: null, otpExpiry: null },
  });

  await prisma.alertPreference.upsert({
    where: { userId: session.id },
    create: { userId: session.id, whatsappEnabled: false },
    update: { whatsappEnabled: false, whatsappNumber: null },
  });

  // Clear any sessions for this user
  await prisma.whatsAppSession.updateMany({
    where: { userId: session.id },
    data: { userId: null, state: "IDLE" },
  });

  return NextResponse.json({ success: true });
}
