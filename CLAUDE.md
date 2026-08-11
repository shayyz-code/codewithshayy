# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**.

```bash
pnpm dev          # next dev
pnpm build        # next build (Node — NOT what production runs)
pnpm start        # next start (needs a prior build)
pnpm lint         # eslint .
pnpm typecheck    # tsc --noEmit
pnpm preview      # build the worker + run it under local workerd  <-- the real check
pnpm deploy       # build + deploy to Cloudflare (needs auth)
pnpm cf-typegen   # regenerate cloudflare-env.d.ts from wrangler.jsonc
```

**`pnpm build` passing does not mean the app works.** Production runs on Cloudflare Workers via `@opennextjs/cloudflare`, and `workerd` forbids things Node allows. Always finish with `pnpm preview`. Errors there do **not** appear on stdout — query them:

```bash
curl -s -X POST localhost:8771/cdn-cgi/local/explorer/api/local/observability/query \
  -H 'Content-Type: application/json' \
  -d '{"sql":"SELECT substr(message,1,300) FROM logs WHERE level=\"error\" ORDER BY ts_ms DESC LIMIT 5"}'
```

The store lives in `.wrangler/` and **persists across restarts**, so filter by `ts_ms` or you will debug a previous run's errors.

Run `pnpm cf-typegen` after every `wrangler.jsonc` binding change, or `env.X` will typecheck against a binding that doesn't exist at runtime.

`lint` + `typecheck` are the only automated checks — there are no tests and no CI. Both pass clean on `main`; keep them that way.

ESLint uses flat config in `eslint.config.mjs`. `eslint-config-next` ships a native flat-config array as of Next 15, so **no `@eslint/eslintrc` / `FlatCompat` shim is needed** — importing `eslint-config-next/core-web-vitals` pulls in the base `next` config and `next/typescript` too.

**If pnpm refuses to run any script** with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`: `node_modules/` is owned by `root` from an earlier `sudo pnpm install`, so pnpm's dependency-status check can't reinstall. Fix with `sudo rm -rf node_modules && pnpm install`. Until then, `npx eslint .` and `npx tsc --noEmit` run the same checks directly.

## Layout conventions

**Routes are thin wrappers.** A `src/app/<route>/page.tsx` does nothing but render one component from `src/ui/`:

```tsx
// src/app/me/page.tsx
export default function PageMe() {
  return <main className="min-h-screen"><Me /></main>
}
```

All real markup lives in `src/ui/<Feature>/<Feature>.tsx`. When changing what a page looks like, edit the `src/ui/` component, not the route file.

Sections within a feature are named `Canvas<N>` (`Canvas3`, `Canvas5`, `Canvas8`…). The numbers are historical and carry no meaning — they're not ordered and there are gaps.

**Path aliases:** `@/*` → `./src/*`, `$/*` → `./public/*`.

## Data access

Projects live in **Cloudflare D1, read through Drizzle in server components**. Firebase is gone from this path entirely — no client-side fetching, no context provider, no loading skeleton.

```
src/data/schema.ts    Drizzle table definitions — the source of truth
src/data/db.ts        getDb(): Drizzle client bound to env.DB
src/data/projects.ts  listProjects() / getProject(slug)
```

```bash
pnpm db:generate       # schema.ts -> migrations/*.sql (never hand-edit those)
pnpm db:migrate        # apply to local D1
pnpm db:migrate:remote # apply to the real database
pnpm db:seed           # regenerate + load seeds/seed.sql into local D1
pnpm db:studio         # browse the data
```

`seeds/` is deliberately **outside** `migrations/` — `wrangler d1 migrations apply` runs every `.sql` in that directory, and the seed opens with `DELETE FROM projects`.

**Routes that read D1 must set `export const dynamic = "force-dynamic"`.** `getCloudflareContext({ async: true })` resolves to *local* bindings during static generation, so a prerendered route bakes your local database into the deployed output. Check the build output: data routes should be `ƒ (Dynamic)`, not `○ (Static)`.

**Drizzle's `with` clause must be written inline** at each call site. Hoisting it into a shared const or helper widens the literal `true` to `boolean`, and the relational types reject it.

Three columns are nullable because the data needs them to be — **render them conditionally**: `siteUrl` (not every project has a site), `repoUrl` (two repos are private and one doesn't exist; a private repo 404s for visitors), `mediaKey` (one project has no image, and shows a titled placeholder). This replaced a hardcoded `github.com/shayyz-code/<slug>` template that produced dead links for 3 of 6 projects.

`mediaKey` stores an R2 object key, never an absolute URL.

### Firebase cannot run on the server. This is not a preference.

Still true, and worth keeping in mind before adding any Firebase back: `firebase/firestore` pulls in `protobufjs`, which calls `new Function` **at import time**. Workers forbids it — `EvalError: Code generation from strings disallowed for this context`. Because OpenNext bundles every route into one worker, module-scope `initializeApp()` took down `/privacy` and `/terms` too, and merely *importing* the module server-side was enough to break it.

### Admin is behind Cloudflare Access

`/admin/*` is protected by a Cloudflare Access application on
`admin.codewithshayy.com`, configured in the Zero Trust dashboard. Access
blocks at the edge, so a request without a valid session never reaches the
worker.

`src/middleware.ts` verifies the JWT Access issues — signature against
Cloudflare's rotating public keys, plus issuer and audience — rather than just
checking the header exists, which anyone can forge with `curl -H`. The team
domain and AUD tag are hard-coded there; neither is a secret, and middleware
runs before bindings resolve so they cannot come from `wrangler.jsonc` vars.

Rejections log to the observability store with a reason. `signature
verification failed` means a forged token; anything mentioning fetch means the
certs endpoint is unreachable, which would lock out real users too.

### Images

The default `next/image` optimizer does not run on Workers; optimization goes through the `IMAGES` binding in `wrangler.jsonc`. Cloudflare Images returns **403 `Blocked`** for the 1 MB animated `rangoon-academy.gif` — keep that in mind when the migration copies images into R2; it should be re-encoded as a static image.

**Known-broken image:** `/developer.png` 400s because `public/` actually holds `developer.PNG` (fails on macOS too). Not yet fixed.
