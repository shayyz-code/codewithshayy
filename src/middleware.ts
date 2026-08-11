import { NextResponse, type NextRequest } from "next/server"
import { createRemoteJWKSet, jwtVerify } from "jose"

// The admin lives on exactly one hostname, and that hostname serves nothing
// else. Both halves of that are enforced here.
//
// Cloudflare Access is the primary gate in front of ADMIN_HOST; the token check
// below is defence in depth, so a removed or misconfigured Access policy fails
// closed rather than silently exposing the route.
//
// Neither constant is a secret: the AUD identifies the Access application and
// appears in Access's own login redirect, and the team domain is a public
// hostname. They are inline because middleware runs before bindings resolve, so
// they cannot come from wrangler vars.
const ADMIN_HOST = "admin.codewithshayy.com"
const PUBLIC_HOST = "codewithshayy.com"
const TEAM_DOMAIN = "https://rustraccoon.cloudflareaccess.com"
const AUD = "a6e3c4abc528973c82c6033a681707d6b5575a6c8577fd649df5f71d7710c3c0"

// Fetches and caches Cloudflare's signing keys, keyed by the token's `kid`.
// Created at module scope but does no I/O until the first verification, so it is
// safe to evaluate when the isolate boots. Never hard-code the key itself —
// Cloudflare rotates it.
const JWKS = createRemoteJWKSet(new URL(`${TEAM_DOMAIN}/cdn-cgi/access/certs`))

// workers.dev and localhost have no Access application in front of them, so the
// admin is unreachable there by design — the token check below rejects every
// request. They are still treated as admin-capable hosts so that local preview
// exercises the same code path instead of silently 404ing.
function isAdminHost(host: string) {
  return (
    host === ADMIN_HOST ||
    host.endsWith(".workers.dev") ||
    host.startsWith("localhost")
  )
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? ""
  const { pathname, search } = request.nextUrl
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/")

  if (isAdminPath) {
    // 404 rather than 401 off the admin host. A 401 confirms to anyone probing
    // that an admin exists here; a 404 says the route does not.
    if (!isAdminHost(host)) {
      return NextResponse.rewrite(new URL("/_not-found", request.url))
    }
  } else if (host === ADMIN_HOST) {
    // The admin hostname serves the admin and nothing else. Without this, every
    // public page has an auth-walled duplicate at a second URL.
    return NextResponse.redirect(
      new URL(`${pathname}${search}`, `https://${PUBLIC_HOST}`),
      301,
    )
  } else {
    // Public request on a public host: nothing to do.
    return NextResponse.next()
  }

  // Access sends the token as a header on every request, and as a cookie on
  // browser navigations. Either is acceptable.
  const token =
    request.headers.get("cf-access-jwt-assertion") ??
    request.cookies.get("CF_Authorization")?.value

  if (!token) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Checks the signature against Cloudflare's published keys, and that the
    // token was issued by this team for this application. Expiry is enforced by
    // jose. Presence alone proves nothing — the header is trivially forged.
    await jwtVerify(token, JWKS, {
      issuer: TEAM_DOMAIN,
      audience: AUD,
    })
  } catch (error) {
    // Goes to the Workers observability store, never to the client. Worth
    // keeping: a failure here is either a forged token or an unreachable certs
    // endpoint, and those need very different responses.
    console.error(
      "access jwt rejected:",
      error instanceof Error ? error.message : error,
    )
    return new NextResponse("Unauthorized", { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  // Wider than /admin now, because redirecting public paths off the admin host
  // requires seeing them. Static assets and images are excluded so middleware
  // is not in the path of every asset fetch. The JWKS request only happens on
  // an /admin path, so the common case here is header reads and comparisons.
  matcher: ["/((?!_next/static|_next/image|media/|favicon.ico).*)"],
}
