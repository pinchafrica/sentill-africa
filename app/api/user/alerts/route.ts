import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let prefs = await prisma.alertPreference.findUnique({
      where: { userId: session.id },
    });

    if (!prefs) {
      prefs = await prisma.alertPreference.create({
        data: { userId: session.id },
      });
    }

    return NextResponse.json(prefs);
  } catch (error: any) {
    console.error("[API/User/Alerts] GET Error:", error?.message);
    return NextResponse.json({ error: "Failed to fetch alert preferences" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const updatedPrefs = await prisma.alertPreference.upsert({
      where: { userId: session.id },
      update: {
        emailEnabled: data.emailEnabled,
        whatsappEnabled: data.whatsappEnabled,
        whatsappNumber: data.whatsappNumber,
        frequency: data.frequency,
        portfolioAlerts: data.portfolioAlerts,
        aiOracleAlerts: data.aiOracleAlerts,
      },
      create: {
        userId: session.id,
        emailEnabled: data.emailEnabled,
        whatsappEnabled: data.whatsappEnabled,
        whatsappNumber: data.whatsappNumber,
        frequency: data.frequency,
        portfolioAlerts: data.portfolioAlerts,
        aiOracleAlerts: data.aiOracleAlerts,
      },
    });

    return NextResponse.json(updatedPrefs);
  } catch (error: any) {
    console.error("[API/User/Alerts] POST Error:", error?.message);
    return NextResponse.json({ error: "Failed to update alert preferences" }, { status: 500 });
  }
}
