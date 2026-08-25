---
paths:
  - "src/app/**"
---

## Routes

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
| `/api/v1/projects`, `/api/v1/projects/[slug]` | `ƒ` dynamic | D1 projects |
| `/api/v1/posts`, `/api/v1/posts/[slug]` | `ƒ` dynamic | the post manifest |
| `/openapi.json` | `○` static | the spec object in `spec.ts` |
| `/docs` | `○` static | the same spec object |
| `/privacy`, `/terms` | `○` static | nothing |
| `/robots.txt` | `○` static | nothing |
| `/sitemap.xml` | `ƒ` dynamic | D1 projects + the post manifest |
| `/manifest.webmanifest` | `○` static | nothing |
| `/icon.png`, `/apple-icon.png` | `○` static | the files beside them in `src/app/` |
| `/_not-found` | `○` static | nothing |
| `/admin`, `/admin/new`, `/admin/[id]`, `/admin/settings` | `ƒ` dynamic | D1 projects + settings |
| `/blogs`, `/blogs/:slug` | 308 | redirect to `/blog…` |

`43bbd83` added the six API and docs routes without adding a row here, and two
later doc commits went over this file without noticing. Re-derive rather than
adding one by hand:

```bash
git ls-files 'src/app/**page.tsx' 'src/app/**route.ts' 'src/app/**not-found.tsx' \
             src/app/{robots,sitemap,manifest}.ts src/app/*icon*
```

No slash after `**`, or the root `src/app/page.tsx` — the `/` route — drops out
of the list and the table loses the busiest page on the site.

The metadata files have to be named individually, and the first version of this
command named only `robots.ts` and `sitemap.ts`. `/manifest.webmanifest` is a
live 200 and an `○` row in the build, and it had no row here because the command
that was supposed to catch that omission shared the omission.

`favicon.ico` is one of two outputs with no row in the `Route (app)` table —
`/_global-error` is the other — but **not** because it is "served as an asset
rather than compiled to a route",
which this file claimed until 2026-08-24 and which is false. It *is* compiled:
`.next/server/app/favicon.ico/route.js` exists, `app-path-routes-manifest.json`
maps `/favicon.ico/route` → `/favicon.ico`, and it is a key in
`prerender-manifest.json`. Only its absence from the printed table is real, and
that is a property of Next's output formatting, not of how the file is served.

`/_global-error` is compiled the same way — `.next/server/app/_global-error.html`,
`.rsc`, `.meta` and `.segments`, `/_global-error/page` in the app manifest, a key
in the prerender manifest — and Next synthesises it, so `src/app/global-error.tsx`
does not exist. The file-listing derive command above therefore cannot find it by
construction, which is the failure this section objects to, appearing inside the
section that objects to it.

Note `ui.md`'s "twelve `○`/`●` rows" arithmetic only balances while *both* of
those have no row. The two files corroborate each other, which is not the same
as either being checked — re-derive both together:

```bash
node -e "const m=require('./.next/app-path-routes-manifest.json');console.log(Object.entries(m).filter(([k])=>k.includes('favicon')))"
```

The split is the point: **anything reading D1 must be dynamic**, and anything
prerendered must not touch the database or the filesystem at request time.

CI asserts this for **every** D1-backed route, not a hand-picked few, via
`scripts/check-dynamic-routes.mjs`. It reads `.next/app-path-routes-manifest.json`
and `.next/prerender-manifest.json` and requires each guarded route to be
present in the first and absent from both keys of the second — absence alone
proves nothing, since a renamed or deleted route is absent too. It also asserts
that `/blog` and `/privacy` *are* prerendered: if a Next release renames those
manifest keys the set reads empty, every "is it prerendered" test comes back
false, and the whole check would otherwise pass while the site went static.

Coverage is computed, not listed. It walks the import graph from
`src/data/db.ts` — the one module that resolves the D1 binding — and requires
every `src/app` route reaching it to be guarded. Both quote styles and
`import()` / `require()` are matched — the repo writes double quotes and
nothing enforces that, so a single-quoted import would otherwise be invisible
to the walk. Type-only imports are excluded: they are erased at compile time,
and counting them marked `/docs`, `/openapi.json`, `/blog/[slug]` and both
`/api/v1/posts` routes as D1 readers because they reach `@/data/projects` for
its `Project` type alone.

Two things make "reaches `db.ts`" the same question as "reads D1", and the
script asserts both rather than assuming them:

- **`src/data/db.ts` is the only module that may touch `env.DB`.** Otherwise a
  route could call `getCloudflareContext` itself and the walk would never see
  it. Comments are stripped before that test, so prose naming `env.DB` does not
  fail the build — which is the mistake this file objects to in the
  `grep -rl force-dynamic src/app` instrument below.
- **The source enumeration has to have found something.** If it comes back
  empty the coverage loop iterates zero times and the script prints its success
  line having checked nothing. It requires `db.ts` and at least one route module
  in the result, the same job `MUST_BE_PRERENDERED` does for the manifest half.

Measured on a throwaway copy of `src` plus the two manifests, repo untouched:
a single-quoted import of a D1 module, an `await import()` of one, a direct
`env.DB` read, and the enumeration pointed at a non-existent directory each
exit 1. A commented-out `env.DB` and a block comment naming it exit 0.

Two narrower versions were tried first and both were wrong. A blanket
`from "@/data/` demanded that `/blog`, `/blog/[slug]`, `/rss.xml` and both
`/api/v1/posts` routes become dynamic — they import `@/data/posts`, which reads
the generated manifest and no database — and marking them dynamic would have
broken the prerendering this file protects. And a
`from "@/data/(projects|settings)"` match is not a boundary at all: **every
importer of `db.ts` uses a relative specifier** — `./db` from
`src/data/settings.ts` and `settings-admin.ts`, `../db` from the three
`src/data/projects/*` modules — so any new reader module under `src/data/`
escapes a specifier match no matter how the alias is spelled. Walking to
`src/data/db.ts` is what closes that.

```bash
grep -rn 'from "\.\{1,2\}/db"' src/data   # the relative imports a specifier match misses
```

Two instruments that look right and are not, both measured rather than
reasoned about:

- **`grep -rl force-dynamic src/app`** reports `/blog`, which is deliberately
  static — `src/app/blog/page.tsx:6` carries the string inside the comment
  *"Do not add force-dynamic here"*.
- **The old route-table grep**, `^[├└┌│][^/]*ƒ ${route}$`, cannot be extended
  past a literal path: `[slug]` becomes an extended-regex character class, so
  `ƒ /projects/s` satisfies `/projects/[slug]`.

The check measures whether a route is prerendered, not whether it carries the
export, and those differ. Removing `force-dynamic` from
`src/app/projects/page.tsx` flips it to `○` and the check rejects. Removing it
from `src/app/projects/[slug]/page.tsx` does **not** — that route has no
`generateStaticParams`, so there is nothing to prerender and it stays `ƒ`. The
export there is insurance against a later `generateStaticParams`, not what
makes it dynamic today. Both measured on a working tree whose HEAD was
`3cc4d33` — the script itself does not exist at that commit, so there is no ref
to check this against. Re-run them rather than trusting this paragraph:

```bash
# remove the export, rebuild, and the check must reject
node scripts/check-dynamic-routes.mjs
```

**Only the apex is meant to be indexed**, and three mechanisms say so. Every page
sets `alternates.canonical` against `metadataBase`; middleware adds
`x-robots-tag: noindex` on any host that is not `codewithshayy.com`; and `www`
**301s to the apex**, permanently, because it is public and the permanence is the
point. The header still covers what the redirect cannot — the paths the matcher
skips, and anything reached before the redirect lands.

`robots.txt` is served by both. Cloudflare prepends a managed content-signals
block — `Content-Signal: search=yes,ai-train=no` plus `Disallow: /` for a list of
AI crawlers — and the worker's own rules follow after
`# END Cloudflare Managed Content`. They coexist, so `Disallow: /admin` and the
`Sitemap:` line survive. Fetching only the first lines shows Cloudflare's block
and looks like the worker's is being ignored; it is not.

`/admin` lives at `src/app/admin/`. `src/middleware.ts` confines it to
`admin.codewithshayy.com` and 404s it everywhere else.
