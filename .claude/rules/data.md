---
paths:
  - "src/data/**"
---

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

## Site content lives in a settings table

Everything that used to be hardcoded copy — hero, the name band, bio, contact —
is one row in `settings`, edited at `/admin/settings`.

```
src/data/settings.ts        getSettings()  reads + the built-in defaults
src/data/settings-admin.ts  saveSettings() and the media-key writers
```

**The fallback is row-level, never per-column.** No row means the defaults in
`settings.ts`, which are what the hardcoded markup used to say. A row that
exists is authoritative, and a NULL column means *empty*. Falling back column by
column would make a cleared field indistinguishable from an unset one — blanking
the phone number would put the old one straight back, and clearing the contact
details is the main thing the table is for.

**Markdown renders in the route, not the section.** The sections are
`"use client"` for framer-motion, so rendering there pulls `react-markdown` into
the bundle for every visitor. `src/app/page.tsx` and `me/page.tsx` render it and
pass elements down as props.

The `.bio-prose` and `.hero-prose` rules in `globals.css` restore the styling the
hardcoded markup carried — Rust-orange emphasis, the larger blue lead-in — and
reset the element map's document spacing, since these panels are single
paragraphs rather than articles. They are scoped so they cannot reach blog posts
or project write-ups, which share that element map. When adding one, match
Tailwind's size *and* line-height pairing: `text-xl` is `1.25rem/1.75rem`, and
setting only the size shifts the band by 2px.

**Social links are deliberately still in code.** The footer is a server
component in the root layout, so it renders on every route including the
prerendered ones — a D1 read there runs during static generation and `/blog`
fails to prerender outright. Moving them into the table needs the footer out of
the root layout first.

`public/` now holds only `logo.webp` and the two manifest icons. The developer
and background photos live in R2 and are set from the admin — there is no file
fallback, so with no settings row those elements simply do not render.

Site images go through the same `putMedia` as projects, with a `site/` prefix.
`deleteMediaIfUnreferenced` therefore checks **both** `projects` and `settings`:
keys are content-addressed, so the same image uploaded in both places is one
object, and checking only one table would delete something the other still uses.
