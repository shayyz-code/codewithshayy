---
name: doc-truth-verified-2026-08-25
description: Ledger of the audit/tier1-3 doc claims verified on 2026-08-25 (backup/restore, route guard, runtimes move), with the instrument for each so later runs can re-check cheaply
metadata:
  type: project
---

Docs and source both at **`249418c`** (branch `audit/tier1-3`). `git rev-parse HEAD`
re-read at the end and unchanged; `git status` clean throughout — no
[[doc-truth-tree-contamination]] this run.

**Why:** a fact check is only reusable if it records *how* each claim was
settled. **How to apply:** re-run only the cheap checks unless the named source
changed. Rows that *failed* are in [[doc-truth-rot-hotspots]]; third-party rows
are pinned in [[doc-truth-third-party-pins]].

## Backup / restore — settled by executing the restore, not by reading it

The whole `## Backups` section of `.claude/rules/data.md` checks out except the
sqlite3 exit code (see hotspots). Reusable method, since this is expensive to
re-derive:

- Restore into a throwaway database with `--persist-to <empty dir>`; `d1 execute`
  accepts it, **`d1 export` does not**. To export from a restored database, copy
  `<persist>/v3` to `<scratch>/.wrangler/state/v3` and run export with `--cwd`.
- Two-file restore (schema then data) into a never-migrated directory gives
  7 / 21 / 29 / 1 and 14/14 non-null settings content columns. Count the columns
  with `SUM(col IS NOT NULL)`, never `SELECT *` — the dump holds real contact
  details.
- The single-file `wrangler d1 export` really does fail, at the first
  `project_tags` insert, with exactly `no such table: main.tags: SQLITE_ERROR`,
  exit 1. It interleaves CREATE/INSERT per table, so `INSERT INTO project_tags`
  precedes `CREATE TABLE tags`.
- **`wrangler d1 execute --file` replays the whole file as one transaction, and
  this is directly observable rather than inferred.** Feed it a file with
  `PRAGMA defer_foreign_keys=TRUE` and an FK that is *never* satisfied: it fails
  at commit with "Durable Object was reset and rolled back to its last known
  good state because the application left the database in a state where
  constraints were violated". That rules out "miniflare just doesn't enforce
  FKs", which is the alternative explanation for the 29 rows landing.
- Local D1 reports `foreign_keys = 1` and rejects a bad `project_tags` row on
  its own (`SQLITE_CONSTRAINT_FOREIGNKEY`, exit 1).

## Route guard — all six negative tests reproduce

`scripts/check-dynamic-routes.mjs`, on a throwaway copy of `src` plus the two
`.next` manifests, repo untouched. Exit 1: single-quoted import of a D1 module,
`await import()` of one, `require()` of one, a direct `env.DB` read, and the
source enumeration pointed at a non-existent directory. Exit 0: a `//` comment
naming `env.DB`, and a block comment naming it.

**Inject into a route that is not already in `GUARDED`** — `src/app/blog/page.tsx`
is the right target. Injecting into a guarded route exits 0 and the test looks
like it failed.

Also reproduced exactly: dropping the type-only-import filter flags
`/docs`, `/openapi.json`, `/blog/[slug]` and both `/api/v1/posts` routes, and a
blanket `from "@/data/` match would flag `/blog`, `/blog/[slug]`, `/rss.xml` and
both `/api/v1/posts`. `env.DB` occurs at exactly one place in `src`
(`src/data/db.ts:14`), and no module anywhere imports `@/data/db` — all five
importers are relative (`./db`, `../db`), which is why no alias grep can reach
the boundary.

## Settled clean, cheap to re-run

- Live site: `www` 301 → apex; `/blogs` and `/blogs/:slug` 308 → `/blog…`; apex
  `/admin` 404; admin host 302 to the Access login; `x-robots-tag: noindex`
  present on `www` and absent on the apex; `robots.txt` worker rules follow
  `# END Cloudflare Managed Content` at line 60 with `Disallow: /admin` and the
  `Sitemap:` line intact.
- Every rendering in the `routes.md` table matches the printed `Route (app)`
  block, and `ui.md`'s "twelve `○`/`●` rows" counts exactly twelve.
- `favicon.ico` *is* compiled — `.next/server/app/favicon.ico/route.js`, mapped
  in `app-path-routes-manifest.json`, present in `prerender-manifest.json`.
- `3cc4d33` is a real commit on `main` and `scripts/check-dynamic-routes.mjs`
  genuinely does not exist there, so `routes.md`'s "no ref to check this
  against" caveat is honest.
- CI: two workflows only; `ci.yml` references no secrets; `backup.yml` is
  schedule + `workflow_dispatch` and is the only one that uses them. Last `main`
  run `32710636255` — both jobs success. `main`'s `ci.yml` has neither
  `pnpm test` nor `check-dynamic-routes`, so `AGENTS.md`'s own hedge about that
  sentence is correct and still needed.
- `gh api repos/shayyz-code/codewithshayy/actions/secrets` → `total_count: 0`,
  so `backup.yml` cannot authenticate yet. (`gh secret list` prints nothing and
  still exits 0 — use the API form, the exit code proves nothing.)
