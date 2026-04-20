import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
const JWT_SECRET = new TextEncoder().encode(secret);

// ── DEV BYPASS ────────────────────────────────────────────────────────────────
// On localhost (NODE_ENV=development) skip JWT verification entirely.
// Looks up the admin user from DB by email so session route can find them.
// In production this block is completely ignored.
const DEV_EMAIL = "edwinmule@gmail.com";

export async function getSession() {
  // Auto-login in development — no cookie required
  if (process.env.NODE_ENV === "development") {
    // Return a static session — the session route will look up the real user from DB
    return { id: DEV_EMAIL, email: DEV_EMAIL, role: "ADMIN" };
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
