import { NextResponse, type NextRequest } from "next/server"
import { createRemoteJWKSet, jwtVerify } from "jose"

// Cloudflare Access sits in front of /admin and is the primary gate. This
// verifies the token it issues, so that a misconfigured or removed Access
// policy fails closed instead of silently exposing the route.
//
// Neither value is a secret: the AUD tag identifies the Access application and
// the team domain is a public hostname. They are here rather than in wrangler
// vars because middleware runs before bindings are resolved.
const TEAM_DOMAIN = "https://rustraccoon.cloudflareaccess.com"
const AUD = "a6e3c4abc528973c82c6033a681707d6b5575a6c8577fd649df5f71d7710c3c0"

// Fetches and caches Cloudflare's signing keys, keyed by the token's `kid`.
// Created at module scope but does no I/O until the first verification, so it
// is safe to evaluate when the isolate boots. Never hard-code the key itself —
// Cloudflare rotates it.
const JWKS = createRemoteJWKSet(new URL(`${TEAM_DOMAIN}/cdn-cgi/access/certs`))

export async function middleware(request: NextRequest) {
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
    // token was issued by this team for this application. Expiry is enforced
    // by jose. Presence alone proves nothing — the header is trivially forged.
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
  // Covers server action POSTs too: they target the page URL they originate
  // from, so anything under /admin is matched.
  matcher: "/admin/:path*",
}
