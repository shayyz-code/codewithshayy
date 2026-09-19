---
name: doc-truth-app-repo-2026-09-18
description: doc-truth against the SEPARATE codewithshayy-app repo — its hotspots, the commands to re-derive each, and the corrected lesson about a record that denies its own prose (a contradiction means one side is stale, not that the prose is false)
metadata:
  type: project
---

`doc-truth` is also invoked against **`/Users/yahs/Documents/projects/codewithshayy-app`**
(Code w/ Shayy Learn, `app.codewithshayy.com`) — a different repository from
the portfolio one this memory directory lives in. Its docs are `AGENTS.md`,
`docs/decisions/000N-*.md` and `.claude/rules/{worker,data,sandbox}.md`.

**Why:** the two repos share conventions, agent names and this memory
directory, so a claim recorded here may belong to either. Always note which.

**How to apply:** on an app-repo run, start with the rows below.

> **Corrected 2026-09-19.** The first version of this file called the hotspot
> "a doc that inherits a verification that never happened" and asserted the
> owner's real-Safari Google sign-in had not happened, because
> `0006-google-sign-in.md` said so in three places. **The sign-in had happened**
> — the owner did it and reported it on 2026-09-18. The *record* was stale, not
> the prose. The finding was still worth raising (the prose cited a record that
> contradicted it), but the conclusion drawn from it was wrong, and it was
> written into memory as fact.

## Hotspot: a record that contradicts the prose citing it

A record's own **Status** and **Not covered** sections are the cheapest
contradiction detector in either repo. Read them before believing prose that
cites the record.

```bash
grep -n "Not covered" -A 8 docs/decisions/000N-*.md   # the file's own denial list
sed -n '/^- \*\*Status/,/Evidence/p' docs/decisions/000N-*.md
```

**But a contradiction only tells you the two disagree.** Either can be the stale
one, and in the case that produced this memory the *record* was. Before
reporting, establish which:

- a record's denial is evidence about **when the record was written**, not about
  the world;
- something a person did and reported in conversation will not appear in the
  repo at all, and no grep will find it — ask, or check whether a later record
  or commit mentions it;
- the fix for a stale record is to update the record, not to delete the true
  sentence that cites it.

Both records have since been updated: `0006` now carries the owner's Safari
report (dated, marked an owner report rather than an instrument reading), and
`0009-admin-access.md` carries the owner's `/api/admin/whoami` check of
2026-09-19 the same way.

## App-repo rows to re-check each run

Every row below was **found wrong on 2026-09-18 and fixed on 2026-09-18/19**.
They are kept because they are the claims this repo gets wrong, and the command
is what re-derives each. The "expected now" column is what a clean run should
find.

Commands here are deliberately pipe-free: a markdown table escapes `|`, so a
command containing one is broken by the time anyone copies it.

| claim | where | re-derive | expected now |
|---|---|---|---|
| "Both browsers check the link buttons and the flow start" | `0008` Not-covered | `grep -rn "Link Google" apps/web/e2e` | true since a both-browser test was added; it asserts the buttons' hrefs and the `?link=1` start redirect without following it |
| a test count, e.g. "(22 tests)" | `0008` Evidence | `grep -c "^\s*it(" apps/worker/test/account.test.ts` | 22 |
| a route count, e.g. "Six Worker routes" | `0008` | `grep -n "^account\." apps/worker/src/auth/account.ts` | 7 lines: 6 routes plus the `account.use("*")` session guard |
| "N D1 round trips" in a CPU paragraph | `0008` | count `db.prepare(` in the handler, plus `loadSession`'s own read | four before the batch; "three" was the stale figure |
| a findings count ("Eleven findings are fixed here") | `0008` | not derivable from headings | replaced with per-pass counts (seven in pass one, four in pass two) |
| a raced number ("8 parallel starts, 5 accepted") | `0008` | the tree holds only the conditional-insert shape | now stated as one sample with its instrument named and the caveat that a race's burst size is not determined by the code. Do **not** edit `account.ts` to re-measure |
| worker.md cookie list | `.claude/rules/worker.md` | `grep -rn "__Host-" apps/worker/src` | three cookies, all three listed (`__Host-cws_oauth` was missing) |
| "counters … never read-then-write" | `.claude/rules/worker.md` | read the rule, then `apps/worker/src/auth/routes.ts` email/start | the rule now names its one exception in writing: `/api/auth/email/start` counts before inserting because each request costs a Turnstile solve. `/api/account/email/start` was converted to a conditional `INSERT … SELECT … WHERE … RETURNING` |
| "the e2e job reaches challenges.cloudflare.com" | `AGENTS.md` CI paragraph | `grep -rn "challenges.cloudflare" apps/web/e2e` | false since `apps/web/e2e/fixtures.ts` serves the Turnstile script itself; no e2e request leaves the runner |
| CPU figures derived by subtracting a control | `0008`, `m2-data/account-cpu.txt` | — | any "handler work = route minus control" number is gone; `measurement-check` showed the control skipped `loadSession` and that the subtraction varied 1.8× on a constant difference. Raw minima only |

## Renumbering hazard (2026-09-19)

Admin Access became **invariant 11**, pushing payment proofs to 12, `db.batch()`
to 13 and migrations to 14. Every `invariant N` citation in the repo moves with
it, and four were missed on the first pass:

```bash
grep -rn "invariant 1[0-9]" --include="*.ts" --include="*.md" --include="*.sh" --include="*.yml" .
```

They are consistent as of 2026-09-19: 10 auto-linking, 13 batch, 14 migrations.

## Checked clean on 2026-09-18 (branch `feat/m2-account-settings`)

- `AGENTS.md` invariant 10 as rewritten: session-joined linking, `email_verified = 0`
  for Telegram (`autoLinkVerifiedEmail: false` ⇒ `email`/`verifiedEmail` null/false
  in `oidc.ts`), session re-read at the callback before the token exchange.
- Every `pnpm` script named in AGENTS.md's Commands block; every path it names.
- CI/deploy/backup workflow descriptions, including 03:40 UTC and the two secrets.
- `wrangler d1 export` has **no** `--persist-to` — wrangler **4.131.1**, 2026-09-18.
- pnpm `minimumReleaseAge` defaults to **1440 min since pnpm v11** (0 before);
  repo pins `pnpm@11.21.0` and sets nothing, so AGENTS.md's dependency note is
  right by default, not by config. Verified against pnpm.io 2026-09-18.
- The "unknown path under `/api/account` answers 401" claim, by a standalone
  Hono 4.13.8 repro of the real mount shape (`app.route` + sub-app `use("*")`).
  Observably true; "runs before routing" is a simplification of Hono's
  match-then-dispatch, not a falsehood.

See [[doc-truth-rot-hotspots]] (portfolio repo) and
[[doc-truth-third-party-pins]] for the version-pin pattern used above.
