---
name: doc-truth-rot-hotspots
description: Doc claims in AGENTS.md/.claude/rules that have already gone stale once — check these first on every doc-truth run
metadata:
  type: project
---

Claims in this repo's instruction docs that have rotted before. A claim that
rotted once will rot again; start each `doc-truth` run here.

**Why:** the whole point of writing a fact down is to avoid re-researching it,
which only works if it is right. `96d6053` corrected five false claims that were
carried verbatim through the 499-line `CLAUDE.md` split, one of which had already
been used to justify hardcoding an admin allowlist.

**How to apply:** on each run, re-derive these specific facts from source before
reading anything else.

| claim | where | rotted at | how to re-derive |
|---|---|---|---|
| middleware exit count (was "seven", then ten) | `.claude/rules/security.md` | `8903810`, `4d18eea` | `awk '/^export async function middleware/,/^}$/' src/middleware.ts \| grep -cE '^\s+return '` — must equal the `return secured(` count |
| Access identity logged vs. enforced | `security.md` | `3549ae3` logged it, `4d18eea` enforced it | grep `allowedEmails`/`ADMIN_EMAILS` in `src/middleware.ts` |
| "middleware runs before bindings resolve" | `security.md` | never true | `bypassForLocalDev()` has always read `process.env` |
| admin-host redirect status (301 → 302) | `security.md` | `8903810` | read the `NextResponse.redirect(..., N)` args |
| whether `www` redirects to apex | `.claude/rules/routes.md` | `8903810` | `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' https://www.codewithshayy.com/` |
| SVG behaviour in `/media` (transform-skip → refused) | `.claude/rules/media.md` | `3549ae3` | `NO_TRANSFORM` set + `SERVEABLE` downgrade in `src/app/media/[...key]/route.ts` |
| `src/ui/*` directory listings | `.claude/rules/ui.md` | `e8a09c1` `settings-form.tsx`, `c623305` `json-ld.tsx`, `9f5e672` `field-error.tsx` | `ls -R src/ui` and diff against the doc's tree block |
| the route table | `.claude/rules/routes.md` | `43bbd83` added `/docs`, `/openapi.json`, four `/api/v1/*` and listed none of them | `git ls-tree -r HEAD --name-only \| grep -E '^src/app/.*(page\|route\|sitemap\|robots)\.'` and diff against the table |
| the list of prerendered routes | `ui.md`, `security.md`, `src/ui/layout/footer.tsx`, `src/middleware.ts`, `open-next.config.ts` | `43bbd83` added `/docs`; five copies, corrected in none until `59eda44`..`89147a7` | `find .next/server/app -name '*.html' \| xargs grep -lF 'Helpful Links'` — six files, and that string is the footer's. **Not** `grep -rn 'force-static' src/app`, which this row used to say: it returns `/rss.xml`, `/docs` and `/openapi.json`, two of them route handlers, and is neither the prerendered set nor the layout set |
| any hand-maintained count | `README.md`, `.github/PULL_REQUEST_TEMPLATE.md`, `AGENTS.md`, `security.md` | `b991579` wrote "23 assertions" and it stayed through every change since; the PR template held a second copy nobody knew about; middleware exits said "seven" for three commits | there should be no integer to check. A count with no command beside it has rotted every time. If one has been added back, either delete it or put the command that produces it on the next line |
| `.claude/agents/*.md` describing how a script behaves | `measurement-check.md` | entry 8 said `smoke.sh` kills `workerd` from its `EXIT` trap; `shutdown` began killing it mid-run too, so `$PORT` is dead for the whole second phase | read the script, not the agent file. These are the least-read docs in the repo and nothing loads them on a trigger |
| workers-rs Images binding + issue #717 | `AGENTS.md` | issue closed 2025-08-04 while the gap remained | `gh issue view 717 --repo cloudflare/workers-rs` **and** grep `worker/src/env.rs` for an `images()` method — the issue state alone is not the fact |

Two rows above were wrong as written, found by running them on `89147a7`: the
`force-static` recipe answered a different question than the one it was filed
under, and `3a6334a` is on no branch — it was rebased away when #56 merged, and
`9f5e672` is the commit that exists. A recipe recorded here has to be executed
before it is written down, or this file rots the way the docs it guards do.

Beware `grep -c "Aung Min Khant"` as a footer probe. It returns 2 on every page
whether or not `Footer` renders, because the string is `keywords` metadata in
`src/app/layout.tsx` and metadata resolves through the layout hierarchy
independently of any component. It was used to settle the prerendered-set
question and happened to agree.

The `src/ui/*` row had rotted on **every** branch that added a component, three
times running. On 2026-08-24 a branch added `src/ui/layout/motion-provider.tsx`
and the block was correct — the first time it survived. One data point against
three; keep checking it, but "guaranteed stale" is no longer the right prior.

Two rows fired on that same run:

- **any hand-maintained count** — `ui.md` carried `terms/page.tsx (79)` and the
  file was 83, rotted at `5c92284`. Both integers there have since been deleted
  rather than corrected a second time.
- **a new one, below.**

## New hotspot: "this CLI has no X command"

`.claude/rules/data.md` and `scripts/backup.sh` both said *"`wrangler r2` has no
listing command — only get, put and delete"*. `wrangler r2 bucket list` exists,
and `backup.sh` **called `wrangler r2 bucket info` 138 lines below its own
claim** — the file contradicted itself and neither copy noticed. The true
statement is one word narrower: `wrangler r2 **object**` has no listing command.

A capability claim about a third-party CLI is a version-pinned fact, so record
the version and the command that derives it, never the prose alone:

```bash
pnpm exec wrangler r2 object --help    # get, put, delete           (4.125.0)
pnpm exec wrangler r2 bucket --help    # list, info, lifecycle, …   (4.125.0)
```

Same shape as the `workers-rs` row: the answer is what the tool exposes today,
not what you remember it exposing. See [[doc-truth-third-party-pins]].

See [[doc-truth-verified-2026-08-12]] for what was checked clean, and
[[doc-truth-third-party-pins]] for upstream facts with their version pins.
