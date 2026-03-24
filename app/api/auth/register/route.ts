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
    const { firstName, lastName, email, password } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email address is already registered." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    const user = await prisma.user.create({
      data: {
        email: emailLower,
        name: fullName,
        password: hashedPassword,
        role: "USER"
      }
    });

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
    console.error("[Auth/Register] Full Error:", error);
    return NextResponse.json({ error: "Registration service error." }, { status: 500 });
  }
}
