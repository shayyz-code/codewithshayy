import { NextResponse, type NextRequest } from "next/server"

// Defence in depth for /admin. The real gate is a Cloudflare Access policy in
// front of the route; this only ensures that if that policy is missing or
// misconfigured, the request fails closed rather than open.
//
// Access terminates its own auth and forwards a signed JWT in this header.
// A request arriving without one never passed through Access.
const ACCESS_JWT_HEADER = "cf-access-jwt-assertion"

export function middleware(request: NextRequest) {
  if (!request.headers.get(ACCESS_JWT_HEADER)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  // Covers server action POSTs too: they target the page URL they originate
  // from, so anything under /admin is matched.
  matcher: "/admin/:path*",
}
