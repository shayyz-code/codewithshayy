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
| `src/ui/*` directory listings | `.claude/rules/ui.md` | `e8a09c1` added `settings-form.tsx` | `ls -R src/ui` and diff against the doc's tree block |
| workers-rs Images binding + issue #717 | `AGENTS.md` | issue closed 2025-08-04 while the gap remained | `gh issue view 717 --repo cloudflare/workers-rs` **and** grep `worker/src/env.rs` for an `images()` method — the issue state alone is not the fact |

See [[doc-truth-verified-2026-08-12]] for what was checked clean.
