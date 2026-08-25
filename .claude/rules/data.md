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

## Backups

`db:migrate:remote` runs `scripts/backup.sh` before it applies anything, and
`.github/workflows/backup.yml` runs it nightly into the `codewithshayy-backups`
bucket. Content lives only in D1 — every project, every write-up, and the whole
of the site's copy — and a migration here once blanked every page while all
routes returned 200.

The bucket exists and carries one lifecycle rule, `expire-after-90-days`, read
back on 2026-08-24 — without it the bucket grows without bound. The scheduled
run additionally needs two repo secrets: `CLOUDFLARE_API_TOKEN`, scoped to D1
read, R2 read on `codewithshayy-media` and R2 write on `codewithshayy-backups`,
and `CLOUDFLARE_ACCOUNT_ID`. Wrangler cannot mint a scoped token, so that is a
dashboard step; the workflow fails until both are set. `pnpm db:backup` and
`db:migrate:remote` use the local wrangler session and need neither.

**Restore is two commands, and the order is load-bearing:**

```bash
wrangler d1 execute codewithshayy --local --file <dir>/d1-schema.sql -y
wrangler d1 execute codewithshayy --local --file <dir>/d1-data.sql   -y
```

The single-file dump `wrangler d1 export` produces by default **does not
restore**. It writes `project_tags` before `tags`, so replaying it fails at the
first row with `no such table: main.tags: SQLITE_ERROR`.

The measured statement order is `d1_migrations, project_tags, projects, tags,
settings, sqlite_sequence` — **not** alphabetical, which an earlier version of
this paragraph claimed: `settings` sorts before `tags` and comes after it. The
order the dump actually uses is not documented, so derive it rather than
predicting it:

```bash
grep -oE '^(CREATE TABLE|INSERT INTO) .?[a-z_]+' <dir>/d1-schema.sql | uniq
```

The `PRAGMA defer_foreign_keys=TRUE` at the head of that file does not save it,
because that pragma is cleared at the end of every transaction and the replay
autocommits per statement. Measured in a single `sqlite3` session with the
pragma present and `foreign_keys=ON`; whether `d1 execute --file` *additionally*
batches was never tested, and the failure needs no such explanation.

Hence `--no-data` and `--no-schema` into two files. Round-tripped **against
local D1** on 2026-08-24: 3 projects / 2 tags / 2 project_tags out, the same
counts and slugs back into a fresh database.

Then against **production** the same day: 7 projects / 21 tags / 29
project_tags / 1 settings row out, and 8 of 8 referenced media keys fetched
with no dangling key. Restored into a fresh local database at identical counts,
with the settings row's `hero`, `bio`, `email` and both media keys non-null —
row counts alone would not have caught the partial-row failure this backup
exists to survive.

The media set is derived from D1 rather than listed from the bucket, because
**`wrangler r2 object` has no listing command — only `get`, `put` and
`delete`.** Note the word `object`: `wrangler r2 bucket` does have `list`, and
also `info`, `lifecycle` and `cors`, which is why `backup.sh` can call
`wrangler r2 bucket info` as its credentials preflight. What is missing is a
way to enumerate the objects *inside* a bucket. Re-derive rather than trusting
this — it has been wrong once (wrangler 4.125.0 today):

```bash
pnpm exec wrangler r2 object --help   # get, put, delete
pnpm exec wrangler r2 bucket --help   # list, info, lifecycle, cors, …
```

That is also
the better set: keys are content-addressed and referenced from the same two
tables `deleteMediaIfUnreferenced` checks, so anything not named there is
already unreferenced. A key with no object is reported as dangling and does
**not** fail the backup — that is a property of the data, and failing on it
would wedge `db:migrate:remote` behind a bad row that predates it.

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

**The footer is not settings-driven, and cannot be** while it lives in the root
layout — see `.claude/rules/ui.md`, which loads when you open the file itself.
Social links stay in code for that reason, and the contact email was removed from
the footer rather than wired up.

`public/` now holds only `logo.webp` and the two manifest icons. The developer
and background photos live in R2 and are set from the admin — there is no file
fallback, so with no settings row those elements simply do not render.

Site images go through the same `putMedia` as projects, with a `site/` prefix.
`deleteMediaIfUnreferenced` therefore checks **both** `projects` and `settings`:
keys are content-addressed, so the same image uploaded in both places is one
object, and checking only one table would delete something the other still uses.
