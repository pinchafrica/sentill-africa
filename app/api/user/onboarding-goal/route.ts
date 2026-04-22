import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { goal } = await req.json();
    const validGoals = ["SAVINGS", "EQUITIES", "BONDS", "CHAMA"];
    if (!goal || !validGoals.includes(goal)) {
      return NextResponse.json({ error: "Invalid goal" }, { status: 400 });
    }

    // Dev bypass uses email as session.id; production uses the cuid
    const isEmail = session.id.includes("@");
    await prisma.user.update({
      where: isEmail ? { email: session.id } : { id: session.id },
      data: { onboardingGoal: goal },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[onboarding-goal]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
