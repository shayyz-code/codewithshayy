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
./scripts/smoke.sh  # 23 assertions against every route
```

`pnpm build` passing does not mean the app works. Production runs on `workerd`,
which forbids things Node allows — every serious bug in this project's history
compiled cleanly and failed only under the real runtime. `pnpm preview` is the
honest check, and CI runs both on every push.

Errors in the worker do not print to stdout. They go to a local observability
store; `CLAUDE.md` has the query.

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
pnpm db:migrate:remote   # apply to the real database
```

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
