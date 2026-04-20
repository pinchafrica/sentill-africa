import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Fetch live premium status + expiry from DB
    // Dev bypass uses email as the session id, so try both lookups
    const isEmail = session.id.includes("@");
    const user = await prisma.user.findUnique({
      where: isEmail ? { email: session.id } : { id: session.id },
      select: { id: true, name: true, email: true, role: true, isPremium: true, premiumExpiresAt: true, createdAt: true }
    });

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Auto-expire premium if past the date
    let isPremium = user.isPremium;
    if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
      isPremium = false;
      // Asynchronously revoke in DB (don't block the response)
      prisma.user.update({ where: { id: user.id }, data: { isPremium: false } }).catch(() => {});
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
