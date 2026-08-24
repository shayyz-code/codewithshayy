![Next.js](https://img.shields.io/badge/Next.js%2016-000000?logo=next.js&logoColor=white&style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Cloudflare](https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

# Code w/ Shayy

My portfolio — projects I have built, and notes on things I am learning.
Live at **[codewithshayy.com](https://codewithshayy.com)**.

## Stack

- **Next.js 16** (App Router) on **Cloudflare Workers** via
  [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
- **Tailwind v4** — theme in CSS via `@theme`, no `tailwind.config.ts`
- **D1** + **Drizzle** for projects, **R2** for images
- **MDX** for blog posts, highlighted at build with `rehype-pretty-code`
- **Cloudflare Access** in front of `/admin`

## Running locally

Node and pnpm versions are pinned in `.nvmrc` and `package.json`.

```bash
pnpm install
pnpm db:migrate     # apply the schema to a local D1
pnpm db:seed        # optional — needs a local .archive/ export
pnpm dev
```

`pnpm dev` runs Next with Cloudflare bindings attached, so D1 and R2 work
locally without touching the real database.

### The check that matters

```bash
pnpm preview        # bundle for workerd and serve it
./scripts/smoke.sh  # every route, and both admin phases
```

`pnpm build` passing does not mean the app works. Production runs on `workerd`,
which forbids things Node allows — every serious bug in this project's history
compiled cleanly and failed only under the real runtime. `pnpm preview` is the
honest check, and CI runs both on every push.

`smoke.sh` boots the worker twice: once with the admin bypass off, where
`/admin` has to 404 because the admin belongs to one hostname, and once with it
on, where the upload actions are reachable at all. Deciding that from whether
`.dev.vars` existed meant CI ran the first half and never the second, and a
local run the reverse — the two were never measured together.

`pnpm test` (vitest) covers the pure functions only — the admin form helpers
and the media-key mapping. Anything needing a D1 or R2 binding is covered by
`smoke.sh` against a real worker instead of a mock.

Errors in the worker do not print to stdout. They go to a local observability
store; `AGENTS.md` has the query — `CLAUDE.md` is a one-line import of it.

## Content

| what | where | how it is edited |
|---|---|---|
| Projects | D1 (`projects`, `tags`, `project_tags`) | `/admin`, or SQL until that is built |
| Project write-ups | `projects.body_md`, markdown | as above |
| Images | R2, keyed by `media_key` | uploaded, then served via `/media/<key>` |
| Blog posts | `content/posts/*.mdx` | an editor, then a commit |

Posts are files rather than rows on purpose: a draft is an unmerged branch,
history is `git log`, and there is no write endpoint to secure. The trade is that
publishing needs a deploy.

## Schema changes

```bash
# edit src/data/schema.ts, then
pnpm db:generate         # writes migrations/*.sql — never hand-edit those
pnpm db:migrate          # apply locally
pnpm db:migrate:remote   # backs up, then applies to the real database
```

## Backups

Content lives only in production D1 — the projects, the write-ups, and every
line of copy on the home page. `pnpm db:backup` dumps it along with the R2
objects it references; `db:migrate:remote` runs that first, and a nightly
workflow writes the same dump to a separate bucket. Restoring is two commands
in a fixed order, for a reason `.claude/rules/data.md` records.

## Deploy

```bash
pnpm deploy
```

Deploys are manual and so are remote migrations — a schema change should not
land without someone watching. One worker serves the apex, `www`, the
Access-gated admin hostname, and a `workers.dev` subdomain; wrangler owns their
DNS records.

## Notes

Architecture, runtime constraints, and the traps that are easy to re-discover
are in [`CLAUDE.md`](./CLAUDE.md). It is written for Claude Code but reads fine
for anyone.

## License

[PolyForm Noncommercial 1.0.0](./LICENSE.md) — read, run, fork, modify and share
it for **any noncommercial purpose**, which includes learning from it. Commercial
use needs my permission.

This is **source-available, not open source**. The OSI definition requires
allowing commercial use, so a licence that excludes it does not qualify, and
GitHub labels the repository accordingly. The code is public because reading real
code that ships is more useful than reading a tutorial, not because it is free to
build a business on.

The licence covers the code. It does not cover the writing in `content/posts/`,
the images, or the "Code w/ Shayy" name — those stay mine.

## Contact

[aungminkhant.shay@gmail.com](mailto:aungminkhant.shay@gmail.com)
