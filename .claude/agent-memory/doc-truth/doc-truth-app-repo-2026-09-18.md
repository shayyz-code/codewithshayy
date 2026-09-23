---
name: doc-truth-app-repo-2026-09-18
description: doc-truth against the SEPARATE codewithshayy-app repo — its hotspots and their re-derive commands, the corrected lesson about a record that denies its own prose, and the 0017 lesson-engine probes (é is precomposed; eslint --format json; tsx and scratch-copy instruments)
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

## Record 0017 / packages/lesson (checked 2026-09-23, branch `feat/m4-lesson-engine` @ 1fcbb87)

Found **wrong** (never true, present since cb67405): "a combining accent" in
the generator's text pieces. The `é` in `PIECES` is precomposed U+00E9, one
code unit, so it cannot catch code-unit slicing. A terminal or an editor
shows the two forms identically, so check the code points:
`python3 -c "print([hex(ord(c)) for c in 'é'])"` on the literal from the file,
or `xxd` (`c3 a9` = precomposed; `65 cc 81` = e + U+0301). Test for
generator-coverage claims ("not ASCII", "combining") the same way.

Instruments that worked here, with the tree left clean:
- lint claims: `eslint --stdin --stdin-filename <path> --format json` and read
  `ruleId`s. The exit code is not enough, because an unused probe binding
  also trips `no-unused-vars`.
- semantics: a scratch `.ts` importing `src/*.ts` by absolute path, run with
  `packages/lesson/node_modules/.bin/tsx`. Bare node cannot resolve the
  extensionless imports.
- entry walk and timing controls: copy `packages/lesson/{src,test,package.json,tsconfig.json}`
  plus `tsconfig.base.json` into the scratchpad, and symlink `node_modules` to
  the repo's absolute path. Never run `m4-data/lesson-controls.sh`, which
  edits tracked files.

Held on 2026-09-23: 38 tests / 9 properties; the controls table matches
`lesson-controls.txt` row for row; the Burmese table (Node 24.15.0, ICU 78.2);
all lint forms; the fixture numbers (2,000 units, 1,260 graphemes, 10.7%
mid-reveal, up to 7 typing at once); a 41.7 ns timer step on the M3 Pro.

Soft spots to re-check: "by about 150 times" (the p95 rows in the same table
give about 65×); contract 6's "lint keeps segmentation out of stateAt" (lint
covers only `state.ts`); and the speed and generator-history figures, which
have no evidence file under `m4-data/`.

### Re-check 2026-09-23 at 9c37467 (PR #64), after "name the source of every speed figure"

Held: every table number, slowest-call, 108/72,000, 41/452, 16 ms GC, 428,
~41 ns, 0.0004 ms figure against `m4-data/lesson-speed.txt`; the lint scope
(eslint probes, compile.ts free, any other src file incl. new/nested refused);
the history file's counts; AGENTS.md 199 lines.

Found at 9c37467 (check first next time):
- **Wrong, added by that diff:** "its tracks hold at most 4 entries" (Speed).
  Only *per-element* tracks do; `cameraSegs:100` and 300 captions/lang are
  binary-searched every call (`state.ts` camera/caption lines). The replaced
  text ("no list longer than 300") was right. An edit turned true into false.
- "Mostly multi-code-unit" generator text (0017, arbitraries.ts comment, PR):
  measure with `fc.sample(text(), { numRuns: 20000, seed: 42 })` under tsx and
  segment. Pieces 5/14; drawn pieces 36%; graphemes 41%; code units 74%. Only
  the code-unit reading makes "mostly" true. A `Math.random` sim of the
  generator is the wrong instrument (fast-check biases draws).
- Unsourced figure after a "name every source" commit: the ~8 ms median of the
  segment-every-element control. `lesson-controls.sh` strips `NNms` from its
  output, so no evidence file can hold it.
- `lesson-speed.txt` header shows load 7.42 at the start of the "quiet" run;
  this machine idles at load 4–7. "Quiet" means "no added busy loops".
- A "(doc-truth, again: 0.59–0.61)" lazy-segmentation p95 is attributed to
  this agent; nothing in memory records it. Record what you measure here.

All five were corrected in record 0017 at 2f1fff7 (app PR #64): per-element
tracks vs the camera and caption lists, "5 of 14 pieces", "no added load",
exact ratios, and scratch sources named for the 8 ms and lazy figures. The
0.59–0.61 ms p95 came from the first 2026-09-23 run's report, which did not
write it here. Re-check them on the next pass rather than trusting this line.

See [[doc-truth-rot-hotspots]] (portfolio repo) and
[[doc-truth-third-party-pins]] for the version-pin pattern used above.
