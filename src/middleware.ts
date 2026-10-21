import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { isRole, ROLE_HOME } from "@/lib/roles";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    if (!isRole(role)) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const allowed =
      (path.startsWith("/admin") && role === "ADMIN") ||
      (path.startsWith("/instructor") && (role === "INSTRUCTOR" || role === "ADMIN")) ||
      (path.startsWith("/student") && role === "STUDENT");

    if (!allowed) {
      return NextResponse.redirect(new URL(ROLE_HOME[role], req.url));
    }

    return NextResponse.next();
  },
  {
    pages: { signIn: "/login" },
    callbacks: { authorized: ({ token }) => !!token },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/instructor/:path*", "/student/:path*"],
};
