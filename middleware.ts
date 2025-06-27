import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";

const publicRoutes = [
  {
    path: "/signin",
    whenAuthenticated: "redirect",
  },
  // Permite acesso público ao docs
  {
    path: "/docs/webgo.html",
    whenAuthenticated: undefined,
  },
];

const REDIRECT_WHEN_NOT_AUTHENTICATED = "/signin";
const REDIRECT_WHEN_AUTHENTICATED = "/home";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);
  const authTokens = request.cookies.get("token");

  if (!publicRoute && !authTokens) {
    const redirectURL = request.nextUrl.clone();
    redirectURL.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED;
    return NextResponse.redirect(redirectURL);
  }

  if (
    publicRoute &&
    authTokens &&
    publicRoute.whenAuthenticated === "redirect"
  ) {
    const redirectURL = request.nextUrl.clone();
    redirectURL.pathname = REDIRECT_WHEN_AUTHENTICATED;
    return NextResponse.redirect(redirectURL);
  }

  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
