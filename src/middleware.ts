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
const WWW_HOST = "www.codewithshayy.com"
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

function bypassForLocalDev() {
  // The admin cannot be exercised locally otherwise: Access issues the token,
  // and there is no Access in front of localhost. Two independent signals, both
  // impossible in the deployed worker:
  //
  //   NODE_ENV      is "production" in any next build, including preview
  //   .dev.vars     is read only by local wrangler and never uploaded on deploy
  //
  // Anything reachable in production still requires a verified Access JWT.
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ADMIN_LOCAL_BYPASS === "1"
  )
}

// A nonce-based CSP is not possible here. /blog/[slug], /privacy, /terms,
// /rss.xml and /robots.txt are prerendered, and a nonce baked into a cached page
// is worse than no nonce at all — every visitor would be handed the same one.
//
// So script-src allows inline. That is weaker against injected script, but the
// exposure is small: react-markdown escapes raw HTML, no page renders user
// input, and the only inline script is the theme constant in layout.tsx. What
// the policy does buy is real — no external script, no framing, no <base>
// hijack, no form posting off-origin.
//
// Making this strict would mean generating a nonce per request and giving up
// prerendering on those five routes.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ")

/**
 * Applied to every response this middleware returns, not just the public one.
 *
 * There are several exits — the dev bypass, the 404 rewrite, the apex redirect,
 * the public branch, two 401s and the admin success path. Attaching headers to
 * only the public branch would leave /admin without frame-ancestors, which is
 * the page clickjacking actually matters on.
 *
 * Note this cannot reach /media, _next/static or _next/image: the matcher
 * excludes them. /media sets its own headers in its route handler.
 */
function secured(response: NextResponse, host: string) {
  response.headers.set("content-security-policy", CSP)
  response.headers.set("x-content-type-options", "nosniff")
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  )
  response.headers.set(
    "strict-transport-security",
    "max-age=31536000; includeSubDomains",
  )

  // Belt and braces on the non-apex hosts. Both now redirect, so a crawler
  // should never render a page there — but the header costs nothing and covers
  // the paths the matcher skips, and anything reached before a redirect lands.
  if (host !== PUBLIC_HOST) {
    response.headers.set("x-robots-tag", "noindex")
  }
  return response
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? ""
  const { pathname, search } = request.nextUrl
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/")

  // Local development short-circuits both the host confinement and the token
  // check. Wrangler pins the request host to the first configured route, so
  // even `preview` arrives as codewithshayy.com and would otherwise 404 the
  // admin before any of this is reachable.
  if (isAdminPath && bypassForLocalDev()) {
    return secured(NextResponse.next(), host)
  }

  if (isAdminPath) {
    // 404 rather than 401 off the admin host. A 401 confirms to anyone probing
    // that an admin exists here; a 404 says the route does not.
    if (!isAdminHost(host)) {
      return secured(NextResponse.rewrite(new URL("/_not-found", request.url)), host)
    }
  } else if (host === ADMIN_HOST) {
    // The admin hostname serves the admin and nothing else. Without this, every
    // public page has an auth-walled duplicate at a second URL.
    //
    // The root is the exception, and getting it wrong made the admin
    // unreachable from its own hostname: Access returns you to the path you
    // started at, so typing the bare hostname lands on "/", which is not an
    // admin path and was being sent to the public site before the admin was
    // ever reached. Only /admin worked, and only if you typed it.
    if (pathname === "/") {
      return secured(
        NextResponse.redirect(new URL("/admin", request.url), 302),
        host,
      )
    }

    // 302 rather than 301. This host is noindex and behind Access, so a
    // permanent redirect buys nothing and costs a great deal — the previous
    // 301 is cached by browsers indefinitely, which is why this fix needs a
    // hard reload to take effect.
    return secured(
      NextResponse.redirect(
        new URL(`${pathname}${search}`, `https://${PUBLIC_HOST}`),
        302,
      ),
      host,
    )
  } else if (host === WWW_HOST) {
    // One address for the public site. Canonical tags and x-robots-tag already
    // stop this host being indexed; this is about not having two URLs for
    // everything. 301 here, unlike the admin host: it is public, and the
    // permanence is the point.
    return secured(
      NextResponse.redirect(
        new URL(`${pathname}${search}`, `https://${PUBLIC_HOST}`),
        301,
      ),
      host,
    )
  } else {
    // Public request on a public host.
    return secured(NextResponse.next(), host)
  }

  // Access sends the token as a header on every request, and as a cookie on
  // browser navigations. Either is acceptable.
  const token =
    request.headers.get("cf-access-jwt-assertion") ??
    request.cookies.get("CF_Authorization")?.value

  if (!token) {
    return secured(new NextResponse("Unauthorized", { status: 401 }), host)
  }

  try {
    // Checks the signature against Cloudflare's published keys, and that the
    // token was issued by this team for this application. Expiry is enforced by
    // jose. Presence alone proves nothing — the header is trivially forged.
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: TEAM_DOMAIN,
      audience: AUD,
    })

    // Signature, issuer and audience are checked; *identity* is not. Any token
    // Access mints for this application is accepted, so the restriction to one
    // person lives entirely in the Access policy — widen that policy and this
    // widens with it, silently.
    //
    // Logging rather than enforcing, on purpose. Access answers before the
    // worker on the admin host, so there is no way to obtain a real token from
    // the CLI and no way to test either branch of an allowlist before shipping
    // one. Enforcing a claim whose name came from memory risks locking the
    // owner out of the only write path, recoverable only by redeploy.
    //
    // One real login puts the claim name and value in the observability store;
    // enforcement is a two-line follow-up once it is known.
    console.log(
      "access identity:",
      JSON.stringify({
        email: payload.email ?? null,
        sub: payload.sub ?? null,
        claims: Object.keys(payload),
      }),
    )
  } catch (error) {
    // Goes to the Workers observability store, never to the client. Worth
    // keeping: a failure here is either a forged token or an unreachable certs
    // endpoint, and those need very different responses.
    console.error(
      "access jwt rejected:",
      error instanceof Error ? error.message : error,
    )
    return secured(new NextResponse("Unauthorized", { status: 401 }), host)
  }

  return secured(NextResponse.next(), host)
}

export const config = {
  // Wider than /admin now, because redirecting public paths off the admin host
  // requires seeing them. Static assets and images are excluded so middleware
  // is not in the path of every asset fetch. The JWKS request only happens on
  // an /admin path, so the common case here is header reads and comparisons.
  matcher: ["/((?!_next/static|_next/image|media/|favicon.ico).*)"],
}
