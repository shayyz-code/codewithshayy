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
for f in d1-schema.sql d1-data.sql; do
  echo "== $f"
  grep -ohE '^(CREATE TABLE( IF NOT EXISTS)?|INSERT INTO) .?[a-z_0-9]+' <dir>/$f | uniq
done
```

One file per invocation, deliberately. `grep` on this machine is `ugrep`, which
searches multiple files concurrently and interleaves their output — passing both
paths at once reported the data file's statements before the schema file's,
which is the reverse of the truth and the exact property being measured.

Check both files, not just the schema. `d1-data.sql` also writes `d1_migrations`
and `sqlite_sequence`; whether the schema half creates them is the difference
between a restore that works on a fresh database and one that only works where
migrations have already run. It creates `d1_migrations` explicitly, and
`sqlite_sequence` appears once an `AUTOINCREMENT` table does.

`PRAGMA defer_foreign_keys=TRUE` at the head of the dump was never going to
rescue it — that pragma defers foreign key checks, not table resolution. It
does not save a `sqlite3` replay either: the pragma is cleared at the end of every transaction and
`.read` autocommits per statement. Measured with the pragma present and
`foreign_keys=ON`.

`wrangler d1 execute --file` is not that, and the difference matters. Local D1
reports `foreign_keys = 1` and rejects a `project_tags` row naming an unknown
`project_id`, yet replaying `d1-data.sql` — which writes `project_tags` before
either table it references — lands all 29 rows. The pragma is still in force at
the last statement, so wrangler replays the file as one transaction rather than
statement by statement.

**Do not restore with `sqlite3`.** It exits 0. It prints one
`FOREIGN KEY constraint failed (19)` per row to stderr and keeps going, and the
database that comes out holds 7 projects, 21 tags and **zero** `project_tags` —
every project renders with no tags, and nothing anywhere returns an error.
Measured 2026-08-25 against the 2026-08-24 production dump.

Hence `--no-data` and `--no-schema` into two files. Round-tripped **against
local D1** on 2026-08-24: 3 projects / 2 tags / 2 project_tags out, the same
counts and slugs back into a fresh database.

Then against **production** the same day: 7 projects / 21 tags / 29
project_tags / 1 settings row out, and 8 of 8 referenced media keys fetched with
no dangling key.

Restored on 2026-08-25 into a database no migration had ever touched — both
files replayed with `wrangler d1 execute --local --persist-to <empty dir>` —
which came back 7 / 21 / 29 / 1, with all fourteen of the settings row's text
and media columns non-null. Check the columns, not just the row: a partial
`settings` row is authoritative and blank everywhere else, and a count of 1
looks the same either way.

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
