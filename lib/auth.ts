import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = new TextEncoder().encode(secret);

// ── DEV BYPASS ────────────────────────────────────────────────────────────────
// On localhost (NODE_ENV=development) skip JWT verification entirely.
// Returns a hardcoded admin session so you can work without logging in.
// In production this block is completely ignored.
const DEV_SESSION = {
  id: "edwinmule-admin",
  email: "edwinmule@gmail.com",
  role: "ADMIN",
};

export async function getSession() {
  // Auto-login in development — no cookie required
  if (process.env.NODE_ENV === "development") {
    return DEV_SESSION;
  }

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
