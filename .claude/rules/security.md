---
paths:
  - "src/middleware.ts"
  - "src/app/admin/**"
  - "src/data/settings-admin.ts"
---

## Security posture

**Headers are set in `src/middleware.ts`, on every response it returns.** There
are ten exits — the dev bypass, the 404 rewrite, the admin-host root redirect,
the admin-host apex redirect, the `www` redirect, the public branch, three 401s
(no token, identity rejected, verification failed) and the admin success path —
and all ten go through `secured()`. Adding a return without it silently drops the
CSP from that path; the admin success path is the one that matters, since
`frame-ancestors` is what stops the admin being framed.

Count them rather than trusting this sentence — it said "seven" for three commits
after the number changed:

```bash
awk '/^export async function middleware/,/^}$/' src/middleware.ts \
  | grep -cE '^\s+return '            # every exit
awk '/^export async function middleware/,/^}$/' src/middleware.ts \
  | grep -cE '^\s+return secured\('   # must equal it
```

**`/media` is outside the matcher** (along with `_next/static` and
`_next/image`), so middleware cannot reach it and the route sets `nosniff` and
`default-src 'none'; sandbox` itself. It needs them most: `writeHttpMetadata`
replays the content type recorded at upload, and that came from the browser's
`file.type`.

**Uploads and serving both distrust the declared type.** `putMedia` allowlists
`file.type`, which a client can lie about, so the media route independently
downgrades anything outside its serve list to `application/octet-stream`. SVG is
excluded from both — it is the only image format that executes script. Do not
add it back without a plan for that.

**The CSP allows inline script**, which is not ideal and is deliberate.
`/blog/[slug]`, `/privacy`, `/terms`, `/rss.xml` and `/robots.txt` are
prerendered, and a nonce baked into a cached page is worse than none — every
visitor receives the same one. Going strict means generating a nonce per request
and giving up prerendering on those five routes. What the current policy still
buys: no external script, no framing, no `<base>` hijack, no off-origin form
posts.

**The Access JWT is verified and the identity is enforced.** Signature, issuer
and audience are checked, then the `email` claim is matched against the
`ADMIN_EMAILS` secret — comma separated, trimmed, case-insensitive — and a
non-match returns 401. Without that last step any token Access mints for this
application is accepted, so widening the Access policy would silently widen the
worker with it.

The claim name was read from a real token rather than assumed. **An unset
`ADMIN_EMAILS` deliberately fails open**, logging loudly, because a silent
lockout from the only write path is worse than a logged gap on the second of two
controls.

**`public/` ships what is on disk, not what git tracks**, which is how
`.DS_Store` ended up served at 200. `scripts/check-public.sh` fails the build on
anything untracked; it checks `--ignored` too, because `.DS_Store` is ignored
rather than untracked and a `??`-only check would miss it.

**`pnpm audit` findings are build-time only.** Nothing it reports executes inside
the worker — they are eslint, postcss, glob and drizzle-kit transitives. The two
that remain (`esbuild` via drizzle-kit's deprecated `@esbuild-kit` chain,
`@babel/core` via `next > styled-jsx`) have no fix available upstream. Overrides
live in `pnpm-workspace.yaml`, scoped per major; pnpm 11 ignores
`pnpm.overrides` in `package.json`.

## Admin is behind Cloudflare Access

`/admin/*` is protected by a Cloudflare Access application on
`admin.codewithshayy.com`, configured in the Zero Trust dashboard. Access
blocks at the edge, so a request without a valid session never reaches the
worker.

`src/middleware.ts` also confines the admin to that one hostname: `/admin*` on any
other host rewrites to the 404 page (not 401 — a 401 confirms an admin exists),
and non-admin paths on the admin host **302** to the apex so there is no
auth-walled duplicate of the public site. `localhost` and `*.workers.dev` count
as admin-capable so local preview exercises the same path.

**The admin host's `/` is the exception, and it is load-bearing.** Access returns
you to the path you started at, so typing the bare hostname lands on `/`, which
is not an admin path — it was being sent to the public site before the admin was
ever reached, making the admin unreachable from its own hostname unless you typed
`/admin` yourself. It now redirects to `/admin`. Both admin-host redirects are
302 rather than 301: the host is noindex and behind Access, so permanence buys
nothing and costs a great deal, since a browser caches a 301 indefinitely.

The middleware verifies the JWT that Access issues — signature against
Cloudflare's rotating public keys, plus issuer and audience — rather than merely
checking that the header is present, which anyone can forge with `curl -H`. The
team domain and AUD tag are inline because both are genuinely public: they appear
in Access's own login redirect URL, which anyone can see by requesting the admin
host unauthenticated.

**`process.env` works in middleware**, which is why `ADMIN_EMAILS` is a secret
rather than a constant. An earlier version of this file claimed the opposite —
"middleware runs before bindings resolve so they cannot come from
`wrangler.jsonc` vars" — and that false claim was used to justify hardcoding the
admin allowlist, while `bypassForLocalDev()` twenty lines away had been reading
`process.env` all along. Anything that is configuration goes in a secret.

**Host cannot be spoofed in local preview.** Wrangler pins the request host to
the first configured route, so `curl -H "Host: admin.…"` still arrives as
`codewithshayy.com`. The admin-host branch is only verifiable against the
deployed hostname — `localhost` and `*.workers.dev` are treated as
admin-capable so local preview exercises the token path at all.

Rejections log to the observability store with a reason. `signature
verification failed` means a forged token; anything mentioning fetch means the
certs endpoint is unreachable, which would lock out real users too.
