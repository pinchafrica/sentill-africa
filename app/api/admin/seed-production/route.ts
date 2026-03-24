import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Basic security to prevent accidental seeding
  if (secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("🌱 [Remote Seed] Initializing Production Accounts...");

    const hashedPassword = await bcrypt.hash("Admin@2019", 10);

    // Seed Admin
    await prisma.user.upsert({
      where: { email: "admin@sentill.africa" },
      update: { password: hashedPassword },
      create: {
        email: "admin@sentill.africa",
        password: hashedPassword,
        name: "System Admin",
        role: "ADMIN",
      },
    });

    // Seed Sentill
    await prisma.user.upsert({
      where: { email: "intel@sentill.africa" },
      update: { password: hashedPassword },
      create: {
        email: "intel@sentill.africa",
        password: hashedPassword,
        name: "Sentill Intelligence",
        role: "USER",
      },
    });

    return NextResponse.json({ success: true, message: "Production accounts seeded successfully." });
  } catch (error: any) {
    console.error("Seed Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
