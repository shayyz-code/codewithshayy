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

`favicon.ico` is the one output with no row: it is served as an asset rather
than compiled to a route, so it appears in no `Route (app)` table.

The split is the point: **anything reading D1 must be dynamic**, and anything
prerendered must not touch the database or the filesystem at request time. CI
asserts the first three stay `ƒ`.

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
