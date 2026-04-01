/**
 * app/api/whatsapp/upgrade/route.ts
 * Admin endpoint to manually upgrade/downgrade WhatsApp users to Pro.
 * Also sends a WhatsApp notification to the user.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, action, plan, days } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, whatsappId: true, isPremium: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    if (action === "upgrade") {
      const durationDays = days ?? 7;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumActivatedAt: now,
          premiumExpiresAt: expiresAt,
        },
      });

      // Notify user via WhatsApp
      if (user.whatsappId) {
        const planLabel = plan ?? `${durationDays}-Day Pro`;
        await sendWhatsAppMessage(
          user.whatsappId,
          `🎉 *Congratulations, ${user.name?.split(" ")[0] ?? "Investor"}!*\n\n` +
          `You've been upgraded to *Sentill Pro* (${planLabel})!\n\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `✅ Unlimited AI wealth insights\n` +
          `✅ Portfolio tracker & analytics\n` +
          `✅ KRA Tax AI & goal planning\n` +
          `✅ Priority 24/7 support\n` +
          `✅ Daily AI market briefs\n\n` +
          `Your Pro access is active until *${expiresAt.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}*.\n\n` +
          `Send *HI* to start exploring! 🚀`,
          userId
        );
      }

      return NextResponse.json({
        success: true,
        action: "upgraded",
        userId,
        userName: user.name,
        expiresAt: expiresAt.toISOString(),
        durationDays,
      });

    } else if (action === "downgrade") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          premiumExpiresAt: null,
        },
      });

      if (user.whatsappId) {
        await sendWhatsAppMessage(
          user.whatsappId,
          `ℹ️ *Sentill Pro Status Update*\n\n` +
          `Hi ${user.name?.split(" ")[0] ?? "Investor"},\n\n` +
          `Your Sentill Pro subscription has been adjusted. You're now on the *Free plan*.\n\n` +
          `✅ 3 AI questions per day\n` +
          `✅ Live market rates\n` +
          `✅ Investment browser\n` +
          `❌ Portfolio tracker — locked\n` +
          `❌ Unlimited AI — locked\n\n` +
          `Upgrade anytime: https://sentill.africa/packages`,
          userId
        );
      }

      return NextResponse.json({
        success: true,
        action: "downgraded",
        userId,
        userName: user.name,
      });

    } else if (action === "extend") {
      const extendDays = days ?? 7;
      const currentExpiry = user.isPremium
        ? await prisma.user.findUnique({ where: { id: userId }, select: { premiumExpiresAt: true } })
        : null;
      const baseDate = currentExpiry?.premiumExpiresAt && new Date(currentExpiry.premiumExpiresAt) > new Date()
        ? new Date(currentExpiry.premiumExpiresAt)
        : new Date();
      const newExpiry = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000);

      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumExpiresAt: newExpiry,
        },
      });

      if (user.whatsappId) {
        await sendWhatsAppMessage(
          user.whatsappId,
          `🎁 *Pro Extended!*\n\n` +
          `Hi ${user.name?.split(" ")[0] ?? "Investor"},\n\n` +
          `Your Sentill Pro has been extended by *${extendDays} days*.\n` +
          `New expiry: *${newExpiry.toLocaleDateString("en-KE", { day: "numeric", month: "long", year: "numeric" })}*\n\n` +
          `Enjoy unlimited AI wealth intelligence! 🚀`,
          userId
        );
      }

      return NextResponse.json({
        success: true,
        action: "extended",
        userId,
        userName: user.name,
        newExpiresAt: newExpiry.toISOString(),
        extendedBy: extendDays,
      });

    } else {
      return NextResponse.json({ error: "Invalid action. Use: upgrade, downgrade, extend" }, { status: 400 });
    }
  } catch (err) {
    console.error("[Admin Upgrade] Error:", err);
    return NextResponse.json({ error: "Failed to process upgrade" }, { status: 500 });
  }
}
