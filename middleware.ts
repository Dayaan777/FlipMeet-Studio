import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow admin API routes (login/logout handlers)
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("admin_session")?.value;
  const isAuthenticated = sessionCookie === "authenticated";

  // If already authenticated and visiting /admin/login directly, redirect to /admin
  if (pathname === "/admin/login") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // If session cookie is missing for /admin or /admin/*, show the password input page
  if (!isAuthenticated) {
    return NextResponse.rewrite(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
