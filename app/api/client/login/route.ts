import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-jwt-key-for-sentil-dev-123"
);

// Sub-accounts for Pinch Africa clients
// In production these would be in the DB, but for the presentation we keep them here
export const CLIENT_ACCOUNTS = [
  {
    id: "garrett-africa",
    name: "Garrett Africa",
    email: "client@garrettafrica.com",
    password: "Garrett2026!",
    logo: "GA",
    color: "#0ea5e9",
    accountId: "act_485565603331527",  // Robinson Mwaniki Personal (manages Garrett)
    industry: "NGO / Development",
    contact: "+254 700 000 001",
  },
  {
    id: "sentill-growth",
    name: "Sentill Growth Hub",
    email: "growth@sentill.africa",
    password: "Sentill2026!",
    logo: "SG",
    color: "#3b82f6",
    accountId: "act_sentill_internal",
    industry: "Financial Media",
    contact: "+254 700 000 001",
  },
  {
    id: "qazi-match",
    name: "Qazi Match",
    email: "client@qazimatch.com",
    password: "Qazi2026!",
    logo: "QM",
    color: "#f59e0b",
    accountId: "act_1553005394880504",  // Pinch TNL Ad Account
    industry: "Recruitment / HR Tech",
    contact: "+254 700 000 003",
  },
  {
    id: "s3-education",
    name: "S3 Education",
    email: "client@s3education.co.ke",
    password: "S3Edu2026!",
    logo: "S3",
    color: "#8b5cf6",
    accountId: "act_2452536555495",   // Robinson Personal
    industry: "Education & Training",
    contact: "+254 700 000 004",
  },
  {
    id: "timeless-timber",
    name: "Timeless Timber",
    email: "client@timelesstimber.co.ke",
    password: "Timber2026!",
    logo: "TT",
    color: "#ef4444",
    accountId: "act_485565603331527",  // Robinson Mwaniki (manages Timeless Timber)
    industry: "Construction Materials",
    contact: "+254 700 000 005",
  },
];

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const client = CLIENT_ACCOUNTS.find(
      (c) => c.email.toLowerCase() === email.toLowerCase().trim() && c.password === password
    );

    if (!client) {
      return NextResponse.json({ error: "Invalid credentials. Please contact your account manager." }, { status: 401 });
    }

    const token = await new SignJWT({
      id: client.id,
      email: client.email,
      name: client.name,
      role: "CLIENT",
      accountId: client.accountId,
      color: client.color,
      logo: client.logo,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("48h")
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        industry: client.industry,
        logo: client.logo,
        color: client.color,
      },
    });

    response.cookies.set("client_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 48, // 48 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Client/Login] Error:", error?.message);
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}
