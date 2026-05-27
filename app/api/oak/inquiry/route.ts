import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, idNo, kraPin, fundClass, amount, sourceOfFunds, horizon, hearAbout, message } = body;

    if (!name || !phone || !email || !idNo || !kraPin || !fundClass || !amount || !sourceOfFunds || !horizon) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inquiry = await prisma.oakInquiry.create({
      data: {
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email).trim().toLowerCase(),
        idNo: String(idNo).trim(),
        kraPin: String(kraPin).trim().toUpperCase(),
        fundClass: String(fundClass),
        amount: Number(amount),
        sourceOfFunds: String(sourceOfFunds),
        horizon: String(horizon),
        hearAbout: String(hearAbout || ""),
        message: String(message || ""),
      },
    });

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (err) {
    console.error("[OAK Inquiry POST]", err);
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const inquiries = await prisma.oakInquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ inquiries });
  } catch (err) {
    console.error("[OAK Inquiry GET]", err);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status, notes } = await req.json();
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const updated = await prisma.oakInquiry.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });
    return NextResponse.json({ success: true, inquiry: updated });
  } catch (err) {
    console.error("[OAK Inquiry PATCH]", err);
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 });
  }
}
