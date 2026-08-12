---
paths:
  - "src/middleware.ts"
  - "src/app/admin/**"
  - "src/data/settings-admin.ts"
---

## Security posture

**Headers are set in `src/middleware.ts`, on every response it returns.** There
are seven exits — the dev bypass, the 404 rewrite, the apex redirect, the public
branch, two 401s and the admin success path — and they all go through
`secured()`. Adding a return without it silently drops the CSP from that path;
the admin success path is the one that matters, since `frame-ancestors` is what
stops the admin being framed.

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

**The Access JWT is verified but identity is only logged, not enforced.**
Signature, issuer and audience are checked; the restriction to one person lives
in the Access policy. The claim is logged so the name and value can be read from
the observability store after a real login — Access answers before the worker on
the admin host, so a token cannot be obtained locally, and enforcing an unseen
claim name risks a lockout from the only write path.

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
and non-admin paths on the admin host 301 to the apex so there is no auth-walled
duplicate of the public site. `localhost` and `*.workers.dev` count as
admin-capable so local preview exercises the same path.

The middleware verifies the JWT that Access issues — signature against
Cloudflare's rotating public keys, plus issuer and audience — rather than merely
checking that the header is present, which anyone can forge with `curl -H`. The
team domain and AUD tag are hard-coded there; neither is a secret, and
middleware runs before bindings resolve so they cannot come from
`wrangler.jsonc` vars.

**Host cannot be spoofed in local preview.** Wrangler pins the request host to
the first configured route, so `curl -H "Host: admin.…"` still arrives as
`codewithshayy.com`. The admin-host branch is only verifiable against the
deployed hostname — `localhost` and `*.workers.dev` are treated as
admin-capable so local preview exercises the token path at all.

Rejections log to the observability store with a reason. `signature
verification failed` means a forged token; anything mentioning fetch means the
certs endpoint is unreachable, which would lock out real users too.
