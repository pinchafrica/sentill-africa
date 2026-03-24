import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { currentYield: 'desc' },
    });
    return NextResponse.json(providers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch providers" }, { status: 500 });
  }
}
