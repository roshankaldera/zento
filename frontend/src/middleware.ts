import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { TOKEN_COOKIE } from "@/lib/auth-service"

/** Auth screens that must stay reachable without a session. */
const PUBLIC_PATHS = ["/signin", "/signup", "/reset-password"]

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

/**
 * Gate every app route on the presence of the auth cookie. The cookie is only
 * a coarse gate (signature/expiry are enforced by the API on each call); it
 * keeps unauthenticated users out of the dashboard and signed-in users off the
 * auth screens.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasToken = Boolean(request.cookies.get(TOKEN_COOKIE)?.value)
  const publicPath = isPublic(pathname)

  if (!hasToken && !publicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/signin"
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  if (hasToken && publicPath) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Run on everything except Next internals, the API, and static assets
  // (any path containing a dot, e.g. images/fonts).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
