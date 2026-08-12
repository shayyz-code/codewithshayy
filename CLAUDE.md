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

All real markup lives in `src/ui/`. When changing what a page looks like, edit
the component, not the route file.

### `src/ui/` is grouped by role, not by page

```
primitives/  reusable and page-agnostic — primary-btn, markdown,
             hover-words, markdown-components
layout/      the shell every page shares — navigation, footer, and the two
             link lists both render (nav-links, social-links)
sections/    the bands a screen composes — band, hero, bio, developer,
             contact, section-label, stay-tuned, featured-projects,
             project-grid, project-card
screens/     the one component a route renders — home, me, blog-index,
             projects-index, project-detail
admin/       admin-list, project-form, body-editor, media-field
icons/       one SVG component each
```

**A section belongs in `sections/` whether one page uses it or three.** Being
single-page is not what decides — `hero` and `stay-tuned` are Home-only,
`contact` is Me-only, and all three live there. Nothing under one role
directory imports from another's internals; use the alias.

`sections/band` is the full-bleed rule-topped strip every section sits in, with
the shared `whileInView` fade; `SlideIn` is its inner slide-from-left.

Sections are all `"use client"` for framer-motion. One that stops being a client
component renders permanently at `opacity: 0`, because the animations are
`whileInView`.

### Naming

**Every file and directory is kebab-case. Identifiers are not** — JavaScript has
no kebab identifiers, so `code-bracket-square.tsx` exports `CodeBracketSquare`
and is used as `<CodeBracketSquare />`. Name a module's main export after its
file: `social-links.tsx` exports `socialLinks`.

Icons are components, not functions returning JSX. `<Star />`, never `star()`.

**Imports:** `@/…` across directories, relative only within the same directory.

**Path aliases:** `@/*` → `./src/*`, `$/*` → `./public/*`.

<details>
<summary>Renaming files: the filesystem is case-insensitive</summary>

`core.ignorecase` is true and `touch Foo && ls foo` succeeds, so a rename
differing only in case can be dropped silently, or recorded as the old path with
new contents. This is what made `/developer.png` 400 before it was fixed.

Route every rename through a temp path, so no case is special:

```bash
mkdir -p "$(dirname "$new")"          # git mv will not create the target dir
git mv "$old" "$old.__tmp__" && git mv "$old.__tmp__" "$new"
```

That still does not cover a *directory* whose name changes only in case:
`mkdir -p src/ui/admin` resolves to an existing `src/ui/Admin`, so git records
the new path while the working tree keeps the old one. They disagree until the
directory is moved aside and back with plain `mv`. Harmless locally, wrong on
CI's case-sensitive filesystem. Afterwards:

```bash
git status --short                    # expect R, not D + ??
git ls-files | sort -f | uniq -di     # must be empty
```
</details>

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
| `/robots.txt` | `○` static | nothing |
| `/sitemap.xml` | `ƒ` dynamic | D1 projects + the post manifest |
| `/blogs`, `/blogs/:slug` | 308 | redirect to `/blog…` |

The split is the point: **anything reading D1 must be dynamic**, and anything
prerendered must not touch the database or the filesystem at request time. CI
asserts the first three stay `ƒ`.

**Only the apex is meant to be indexed.** Every page sets `alternates.canonical`
against `metadataBase`, and middleware adds `x-robots-tag: noindex` on any host
that is not `codewithshayy.com`, so `www` and the workers.dev subdomain do not
become duplicates. There is deliberately no `www` → apex redirect: it is the
stronger signal but breaks existing links.

`robots.txt` is served by both. Cloudflare prepends a managed content-signals
block — `Content-Signal: search=yes,ai-train=no` plus `Disallow: /` for a list of
AI crawlers — and the worker's own rules follow after
`# END Cloudflare Managed Content`. They coexist, so `Disallow: /admin` and the
`Sitemap:` line survive. Fetching only the first lines shows Cloudflare's block
and looks like the worker's is being ignored; it is not.

`/admin` lives at `src/app/admin/`. `src/middleware.ts` confines it to
`admin.codewithshayy.com` and 404s it everywhere else.

## Data access

Projects live in **Cloudflare D1, read through Drizzle in server components**. Firebase is gone from this path entirely — no client-side fetching, no context provider, no loading skeleton.

```
src/data/schema.ts           Drizzle table definitions — the source of truth
src/data/db.ts               getDb(): Drizzle client bound to env.DB
src/data/posts.ts            listPosts() / getPost(slug), from the manifest
src/data/projects/index.ts   reads  — listProjects() / getProject(slug)
src/data/projects/admin.ts   writes — create, update, delete, reorder, publish
src/data/projects/media.ts   R2     — putMedia, deleteMediaIfUnreferenced
```

The read module is `index.ts` so `@/data/projects` keeps resolving to it, which
works because `moduleResolution` is `bundler`. Both `listProjects` and
`getProject` already exclude unpublished rows, so anything built on them — the
public pages, the sitemap — inherits that.

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

`src/ui/primitives/markdown-components.tsx` is the shared element map, so both produce
identical markup. Style markdown there, not in either caller.

The runtime path has no Shiki deliberately: highlighting per request needs a
WASM or JS regex engine in the worker, and project write-ups are prose. Fenced
code still gets the styled panel, just uncoloured.

### Blog: files, and the two traps that come with them

Posts are `content/posts/*.mdx`. `src/data/posts.ts` is the read seam, mirroring
`src/data/projects/index.ts`. Frontmatter needs `title` and `date`; `draft: true` keeps
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

### Security posture

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
  `IMAGES` binding, and `src/lib/image-loader.ts` points `next/image` at
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

Admin uploads go through `src/data/projects/media.ts`. The key embeds a hash of
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
