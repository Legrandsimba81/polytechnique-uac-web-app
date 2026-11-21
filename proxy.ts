import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);
const ADMIN_PATH = /^\/admin(\/|$)/;

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (ADMIN_PATH.test(pathname)) {
    const role = (req.auth?.user as any)?.role;

    if (!req.auth) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (!["ADMIN", "SUPER_ADMIN", "FINANCE"].includes(role)) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    if (role === "FINANCE" && !pathname.startsWith("/admin/finance")) {
      return NextResponse.redirect(new URL("/admin/finance", req.url));
    }
  }

  return NextResponse.next();
});

export const config = { matcher: ["/admin/:path*"] };