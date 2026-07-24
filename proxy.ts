import { NextResponse, type NextRequest } from "next/server";

import { isStoreLocale, type StoreLocale } from "@/lib/storefront-i18n";

const PUBLIC_FILE = /\.[^/]+$/;

function getPreferredLocale(request: NextRequest): StoreLocale {
  const cookieLocale = request.cookies.get("tow-locale")?.value;
  if (cookieLocale && isStoreLocale(cookieLocale)) {
    return cookieLocale;
  }

  return request.headers.get("accept-language")?.toLowerCase().startsWith("en")
    ? "en"
    : "sr";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/logos") ||
    pathname.startsWith("/draco") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (firstSegment && isStoreLocale(firstSegment)) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-tow-locale", firstSegment);
    requestHeaders.set("x-tow-pathname", pathname);
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.cookies.set("tow-locale", firstSegment, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
