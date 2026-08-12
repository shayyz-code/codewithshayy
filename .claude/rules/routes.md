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
| `/privacy`, `/terms` | `○` static | nothing |
| `/robots.txt` | `○` static | nothing |
| `/sitemap.xml` | `ƒ` dynamic | D1 projects + the post manifest |
| `/blogs`, `/blogs/:slug` | 308 | redirect to `/blog…` |

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
