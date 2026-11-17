import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const GUEST_ONLY = ["/login", "/register", "/forgot-password", "/reset-password"];

function isGuestOnly(pathname: string): boolean {
  return GUEST_ONLY.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

/**
 * Port of Laravel's `guest` middleware: a signed-in visitor has no business on
 * the login or register screen and goes to their dashboard instead. Role checks
 * stay in the pages and actions, where the user row is already loaded.
 */
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isGuestOnly(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: (process.env.AUTH_URL ?? "").startsWith("https"),
  });

  if (token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
