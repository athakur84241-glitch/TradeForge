import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-middleware";

const PROTECTED_PATHS = [
  "/",
  "/accounts",
  "/challenges",
  "/payouts",
  "/leaderboard",
  "/profile",
  "/settings",
  "/notifications",
  "/search",
];

const AUTH_PATHS = ["/sign-in", "/sign-up"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  });
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const response = NextResponse.next({
    request,
  });

  const supabase = createSupabaseMiddlewareClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect all workspace routes.
  if (isProtected(pathname) && !user) {
    const signInUrl = request.nextUrl.clone();

    signInUrl.pathname = "/sign-in";
    signInUrl.search = "";
    signInUrl.searchParams.set("next", pathname);

    return NextResponse.redirect(signInUrl);
  }

  // Authenticated users should not see sign-in/sign-up.
  if (isAuthRoute(pathname) && user) {
    const homeUrl = request.nextUrl.clone();

    homeUrl.pathname = "/";
    homeUrl.search = "";

    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/accounts/:path*",
    "/challenges/:path*",
    "/payouts/:path*",
    "/leaderboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/notifications/:path*",
    "/search/:path*",
    "/sign-in",
    "/sign-up",
  ],
};