import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = new TextEncoder().encode(secret);

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Check password
    // In seeding we will hash it. For legacy plain text, we handle it gracefully if possible, 
    // but better to just hash everything in seed.
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch && user.password !== password) { // Fallback for plain text during dev transition
       return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Generate JWT
    const token = await new SignJWT({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;

  } catch (error: any) {
    console.error("[Auth/Login] Error:", error?.message);
    return NextResponse.json({ error: "Authentication service error." }, { status: 500 });
  }
}
