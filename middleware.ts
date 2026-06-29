import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "odense_auth";

function isAuthed(request: NextRequest): boolean {
  return request.cookies.get(AUTH_COOKIE)?.value === "1";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/odense")) {
    if (!isAuthed(request)) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname === "/login" && isAuthed(request)) {
    return NextResponse.redirect(new URL("/odense", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/odense/:path*", "/login"],
};
