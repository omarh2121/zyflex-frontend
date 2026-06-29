import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const DRIVER_COOKIE = "odense_auth";
const OWNER_COOKIE = "owner_auth";

function isDriverAuthed(request: NextRequest): boolean {
  return request.cookies.get(DRIVER_COOKIE)?.value === "1";
}

function isOwnerAuthed(request: NextRequest): boolean {
  return request.cookies.get(OWNER_COOKIE)?.value === "1";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/owner")) {
    if (!isOwnerAuthed(request)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/odense")) {
    if (!isDriverAuthed(request)) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (isOwnerAuthed(request)) {
      return NextResponse.redirect(new URL("/owner", request.url));
    }
    if (isDriverAuthed(request)) {
      return NextResponse.redirect(new URL("/odense", request.url));
    }
  }

  if (pathname === "/") {
    if (isOwnerAuthed(request)) {
      return NextResponse.redirect(new URL("/owner", request.url));
    }
    if (isDriverAuthed(request)) {
      return NextResponse.redirect(new URL("/odense", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/odense/:path*", "/owner/:path*", "/login"],
};
