import { NextResponse } from "next/server";

import { auth } from "./auth";

export default auth((request) => {
  if (request.auth?.user?.id) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.nextUrl.origin);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);

  return NextResponse.redirect(loginUrl);
});

export const config = {
  matcher: ["/dashboard/:path*", "/api/dashboard/:path*", "/api/transactions/:path*"],
};
