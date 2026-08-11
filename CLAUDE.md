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
# $PORT is whatever `preview --port` was given
curl -s -X POST localhost:$PORT/cdn-cgi/local/explorer/api/local/observability/query \
  -H 'Content-Type: application/json' \
  -d '{"sql":"SELECT substr(message,1,300) FROM logs WHERE level=\"error\" ORDER BY ts_ms DESC LIMIT 5"}'
```

The store lives in `.wrangler/` and **persists across restarts**, so filter by `ts_ms` or you will debug a previous run's errors.

Run `pnpm cf-typegen` after every `wrangler.jsonc` binding change, or `env.X` will typecheck against a binding that doesn't exist at runtime.

CI runs on every push and PR (`.github/workflows/ci.yml`): lint, typecheck and
`next build` in one job, then a second that bundles for workerd, sets up a local
D1 from `seeds/ci.sql`, and runs `scripts/smoke.sh` against every route. No
secrets needed — workerd, miniflare and local D1 all run unauthenticated.

Two assertions there are load-bearing. The build output must mark `/`, `/me` and
`/projects` as `ƒ (Dynamic)`; a regression to `○ (Static)` bakes the build
machine's database into the deploy and nothing surfaces it until production
serves empty data. And the smoke test catches what `next build` cannot — a
filesystem read on a dynamic route compiles cleanly and 500s under workerd.

There are no unit tests. Both jobs pass clean on `main`; keep them that way.

ESLint uses flat config in `eslint.config.mjs`. `eslint-config-next` ships a native flat-config array as of Next 15, so **no `@eslint/eslintrc` / `FlatCompat` shim is needed** — importing `eslint-config-next/core-web-vitals` pulls in the base `next` config and `next/typescript` too.

Node and pnpm are pinned — `.nvmrc`, plus `packageManager` and `engines` in
`package.json`. A locally upgraded pnpm will warn about the mismatch with
`packageManager`; that is the pin doing its job, not a problem.

<details>
<summary>Troubleshooting: pnpm refuses to run any script</summary>

`ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY` means `node_modules/` is owned by
`root` from an earlier `sudo pnpm install`, so pnpm's dependency-status check
cannot reinstall. Fix with `sudo rm -rf node_modules && pnpm install`. Until
then, `npx eslint .` and `npx tsc --noEmit` run the same checks directly.
</details>

## Deployment

Four hostnames, all the same worker:

```
codewithshayy.com          apex, the live site
www.codewithshayy.com      same content
admin.codewithshayy.com    behind Cloudflare Access
codewithshayy.<sub>.workers.dev
```

All are `custom_domain: true` routes, so wrangler owns the DNS records — there
is no other host and no separate DNS to keep in sync. Cloudflare's certificate
covers `*.codewithshayy.com`.

`workers_dev: true` is set explicitly. Declaring `routes` otherwise disables
the workers.dev subdomain, which 404s every route on it.

`next build` warns that the `middleware` convention is deprecated in favour of
`proxy`. **Do not migrate**: OpenNext rejects a Node-runtime proxy, and Next
rejects `runtime: "edge"` in a proxy config, so there is no working
combination. `src/middleware.ts` stays until OpenNext supports it.

## Conventions

**Commits** are Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`,
`refactor:`, `ci:`, with `!` for breaking changes. One small PR per change,
rebase-merged onto `main`. File an issue before starting work; the PR closes it.

**Issues and PRs are records of the change, not messages to a reviewer.** No
second person, no narration of how the work felt, no conversational asides.

```
no    "You asked for…"  "Your photo was missing"  "Say the word and…"
no    "I nearly shipped…"  "my assumption was wrong"
yes   "public/ held developer.PNG while git tracked developer.png;
       the request 400d."
```

Keep every measurement, error string and verification result — that is the part
worth having in the history. Recommendations and open questions belong in
conversation with the author instead. `.github/PULL_REQUEST_TEMPLATE.md` and
`.github/ISSUE_TEMPLATE/` carry the format.

## Layout conventions

**Routes are thin wrappers.** A `src/app/<route>/page.tsx` does nothing but render one component from `src/ui/`:

```tsx
// src/app/me/page.tsx
export default function PageMe() {
  return <main className="min-h-screen"><Me /></main>
}
```

All real markup lives in `src/ui/<Feature>/<Feature>.tsx`. When changing what a page looks like, edit the `src/ui/` component, not the route file.

No `Canvas<N>` files remain — the last three were renamed when they moved into
`src/ui/sections/`. Use descriptive names.

**Sections shared by more than one page live in `src/ui/sections/`**, not inside
whichever feature happened to introduce them. `Developer`, `FeaturedProjects`,
`SectionLabel`, `Bio`, `ProjectGrid` and `ProjectCard` are rendered by two or
three of `/`, `/me` and `/projects`. `src/ui/<Feature>/` keeps only what that one
page renders — `Home/Hero`, `Home/StayTuned`, `Me/Contact`.

`sections/Band` is the full-bleed rule-topped strip every section sits in, with
the shared `whileInView` fade; `SlideIn` is its inner slide-from-left. Three
copies of both existed before.

These are all `"use client"` for framer-motion. A section that stops being a
client component renders permanently at `opacity: 0`, because the animations are
`whileInView`.

**Path aliases:** `@/*` → `./src/*`, `$/*` → `./public/*`.

### Routes

| route | rendering | reads |
|---|---|---|
| `/` | `ƒ` dynamic | D1 projects |
| `/me` | `ƒ` dynamic | D1 projects |
| `/projects` | `ƒ` dynamic | D1 projects |
| `/projects/[slug]` | `ƒ` dynamic | D1 project + `body_md` |
| `/blog` | `○` static | the generated post manifest |
| `/blog/[slug]` | `●` SSG | `content/posts/*.mdx` |
| `/rss.xml` | `○` static | the generated post manifest |
| `/media/[...key]` | `ƒ` dynamic | R2, resized via `IMAGES` |
| `/privacy`, `/terms` | `○` static | nothing |
| `/blogs`, `/blogs/:slug` | 308 | redirect to `/blog…` |

The split is the point: **anything reading D1 must be dynamic**, and anything
prerendered must not touch the database or the filesystem at request time. CI
asserts the first three stay `ƒ`.

`/admin` has no route yet. `src/middleware.ts` confines it to
`admin.codewithshayy.com` and 404s it everywhere else.

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

Six columns are nullable because the data needs them to be — **render every one
conditionally**:

| column | why it is null |
|---|---|
| `siteUrl` | not every project has a live site |
| `repoUrl` | two repos are private, one does not exist; a private repo 404s for visitors |
| `mediaKey` | one project has no image, and renders a titled placeholder |
| `bodyMd` | the long-form write-up, absent until authored — falls back to a short line |
| `role` | shown as `role · year` when either is present |
| `year` | as above |

`repoUrl` replaced a hardcoded `github.com/shayyz-code/<slug>` template that
produced dead links for 3 of 6 projects.

`mediaKey` stores an R2 object key, never an absolute URL.

### Firebase cannot run on the server. This is not a preference.

Still true, and worth keeping in mind before adding any Firebase back: `firebase/firestore` pulls in `protobufjs`, which calls `new Function` **at import time**. Workers forbids it — `EvalError: Code generation from strings disallowed for this context`. Because OpenNext bundles every route into one worker, module-scope `initializeApp()` took down `/privacy` and `/terms` too, and merely *importing* the module server-side was enough to break it.

### Two markdown renderers, on purpose

There are two paths and they cannot be merged. `@next/mdx` is a build-time
loader for files on disk; it cannot compile a string that arrives from D1.

| content | renderer | when |
|---|---|---|
| `content/posts/*.mdx` | `@next/mdx` + `rehype-pretty-code` | build |
| `projects.body_md` | `react-markdown` + `remark-gfm` | request |

`src/ui/markdownComponents.tsx` is the shared element map, so both produce
identical markup. Style markdown there, not in either caller.

The runtime path has no Shiki deliberately: highlighting per request needs a
WASM or JS regex engine in the worker, and project write-ups are prose. Fenced
code still gets the styled panel, just uncoloured.

### Blog: files, and the two traps that come with them

Posts are `content/posts/*.mdx`. `src/data/posts.ts` is the read seam, mirroring
`src/data/projects.ts`. Frontmatter needs `title` and `date`; `draft: true` keeps
a post out of the build.

**Nothing may read the filesystem at runtime.** A worker has no filesystem, and
marking a route static is *not* enough — OpenNext still invokes the server
function for App Router pages, so `readdirSync` fails with
`no such file or directory, readdir '/bundle/content/posts'`. The post list is
therefore generated into `src/data/posts.generated.ts` (gitignored) by
`scripts/generate-posts-manifest.mjs`, which `pnpm build` and `pnpm dev` both
run. `gray-matter` is a devDependency for the same reason.

**Prerendered pages need an incremental cache.** They are written to
`.open-next/cache`, not the assets directory, so without one every SSG route
404s with `Internal: NoFallbackError`. `open-next.config.ts` uses
`staticAssetsIncrementalCache` — correct while content only changes on deploy;
switch to `r2IncrementalCache` if on-demand revalidation is ever wanted.

MDX plugins in `next.config.mjs` are named as **strings**, not imported.
Turbopack serialises loader options and rejects function references
(`does not have serializable options`).

`rehype-pretty-code` emits `--shiki-light`/`--shiki-dark` on every token; the
rules in `globals.css` are what paint them. Remove those and code renders
correctly but entirely unstyled.

### Admin is behind Cloudflare Access

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

### Images

The default `next/image` optimizer does not run on Workers. Two paths replace it:

- **R2 media** is resized inside `src/app/media/[...key]/route.ts` via the
  `IMAGES` binding, and `image-loader.ts` points `next/image` at
  `/media/<key>?w=N`. Optimizing through `/_next/image` does not work here —
  the optimizer fetches the source URL, and `global_fetch_strictly_public`
  sends that self-fetch out to the public internet, where it fails with
  `"url" parameter is valid but upstream response is invalid`.
- **Files in `public/`** pass through the loader untouched, so they are served
  at their committed size. Keep them small; a 4 MB PNG here is 4 MB on the
  wire. They are webp at sane dimensions for that reason.

Cloudflare Images returns **403 `Blocked`** for `rangoon-academy.gif` — 1 MB and
190 frames, so it cannot be flattened without losing the animation. GIF and SVG
skip the transform and stream through unchanged.

Admin uploads go through `src/data/admin-media.ts`. The key embeds a hash of
the content — `projects/<slug>-<hash8>.<ext>` — because `/media` serves objects
as `immutable, max-age=31536000`. Reusing a key for new bytes would leave the
old image cached for a year. Replacing deletes the previous object, but only
when no other row still points at it, since identical bytes dedupe to one key.

`GET /media/<key>?w=N` **500s under `next dev`** with `DevalueError: Cannot
stringify arbitrary non-POJOs` at `writeHttpMetadata`. That is the miniflare R2
shim, not the route — the same request is fine under `pnpm preview` and in
production. Do not chase it.

When uploading to R2 by hand, always pass `--content-type`. Without it R2 stores no
`httpMetadata`, `writeHttpMetadata()` emits nothing, and the object is served
with no `Content-Type` at all.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
