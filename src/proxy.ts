import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "wtk_admin";

/**
 * Optimistic gate for the admin area: visitors without a session cookie are sent to the login page.
 * The real authorization check happens in the API, which validates the JWT on every admin request.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.cookies.has(ADMIN_COOKIE)) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
