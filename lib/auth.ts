import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = new TextEncoder().encode(secret);

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { id: string; email: string; role: string };
  } catch (error) {
    console.error("getSession Error:", error);
    return null;
  }
}
