import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET || "";
if (!secret) {
  console.warn("WARNING: JWT_SECRET is not defined in environment variables. Authentication may fail.");
}
const JWT_SECRET = new TextEncoder().encode(secret || "fallback_secret_for_builds");

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Paths that require authentication
  const protectedPaths = ["/dashboard", "/admin", "/api/portfolio"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      await jwtVerify(session, JWT_SECRET);
      return NextResponse.next();
    } catch (error) {
      console.error("Proxy Auth Error:", error);
      // If token is invalid, clear cookie and redirect
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (allowed public apis)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth/login|auth/register|$).*)",
  ],
};
