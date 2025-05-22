import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const isLoggedIn = req.cookies.get("is_logged_in")?.value;
  const isManager = req.cookies.get("is_manager")?.value;

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/unauthorised", req.url));
  }

  if (req.nextUrl.pathname.startsWith("/manager") && isManager !== "true") {
    return NextResponse.redirect(new URL("/unauthorised", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/manager"],
};
