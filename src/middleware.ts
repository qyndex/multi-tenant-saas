import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Middleware that protects /dashboard and /settings routes.
 * Unauthenticated users are redirected to /auth/login.
 * Also refreshes the Supabase auth token on every request.
 */
export async function middleware(request: NextRequest) {
  const { response, user } = await createMiddlewareClient(request);

  // Protected routes — redirect to login if no session
  const protectedPaths = ["/dashboard", "/settings"];
  const isProtected = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and visits login page, redirect to dashboard
  if (user && request.nextUrl.pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/auth/:path*"],
};
