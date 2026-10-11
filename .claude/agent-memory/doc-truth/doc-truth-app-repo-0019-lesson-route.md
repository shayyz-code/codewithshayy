---
name: doc-truth-app-repo-0019-lesson-route
description: APP repo (codewithshayy-app) record 0019, checked 2026-10-11 at 59860ad — what was wrong or stale, the read-only instruments that worked (scratch worker copy, fault-pattern counter, static smoke count), and production's state that day
metadata:
  type: project
---

Run of 2026-10-11 against **`/Users/yahs/Documents/projects/codewithshayy-app`**
(not the portfolio repo), branch `feat/m4-lesson-route` @ `59860ad`, stacked on
the unmerged `feat/m4-lesson-storage` (PR #70). Scope was the diff
`feat/m4-lesson-storage...feat/m4-lesson-route`: record
`docs/decisions/0019-lesson-route.md` and the comments around it.

**Why:** these are leads for the next pass over the same record, not facts.
Re-derive each; the branch was unmerged and may have been rewritten since.

**How to apply:** start with "Found", then re-run the instruments below.

## Found at 59860ad (check these first next time)

- **Wrong:** `0019:153` "(the cache test fails on its header)" in the "route is
  not mounted" row. It fails on a *status*: `test/lessons.test.ts:282`,
  `/api/lessons/preview: expected 404 to be 200`, the first answer in the loop.
  The header assertion is never reached. The row's count (15) is right.
- **Stale, made so by the diff — test counts in OLDER records' Evidence lines.**
  A new test added to an existing file or directory silently outdates the
  record that counted it: `0018:4` "(23 tests)" for `admin-lessons.test.ts`
  became 24; `0017:4` "`packages/lesson/test/` (38 tests…)" became 40 when
  `fixtures.test.ts` landed there. Same hotspot as record 0008's "(22 tests)"
  in [[doc-truth-app-repo-2026-09-18]]. Re-derive, pipe-free:
  `grep -c "^\s*it(" apps/worker/test/admin-lessons.test.ts` and
  `pnpm --filter @cws/lesson test` (read the `Tests` line).
- **Stale "Not covered" lines in older records:** `0011:120` "Nothing issues a
  signed URL yet", `0011:58` signatures carry "the user id" (now `u` can be the
  word `anyone`), `0018:336` "Learners cannot read a lesson yet". A record's
  denial dates the record; report which is the stale one.
- **Imprecise:** `.claude/agents/invariant-audit.md` item 6, "neither may gain a
  second caller outside tests". Non-test callers were `mediaSigner` ← two
  (`lessons.ts`, and `signedMediaPath` in `media.ts`), `signedMediaPath` ← none.
  `git grep -n -E "signedMediaPath|mediaSigner" -- apps`.
- **Uncheckable from the repo:** anything of the form "the plan lists/says…".
  The plan of record lives outside the repository (0010, 0018 say so). Say
  "could not check", do not infer it from a code comment.
- **True only vacuously:** "none has a version" in production. Production D1
  had no `lesson_versions` table that day (migrations 0000–0006 applied; 0007
  comes with PR #70). `deploy.yml` migrates before deploying, so the route does
  not meet a missing table.

The first four, and "none has a version", were corrected at 4cb2e6f (app
branch `feat/m4-lesson-route`): the row no longer explains the cache test's
failure, the older records point at record 0019, the audit checklist says
which function calls which, and record 0019 names the missing table. The plan
line is now quoted in the record, which still cannot be checked from the
repo. Re-check them on the next pass rather than trusting this line.

## Instruments that worked, tree left clean

- **Fault patterns match once, without running the controls script.** Extract
  only the `R=` and `fault …` lines with `sed -n`, define a `fault()` that
  counts `old` in `git show <commit>:<file>` (python `str.count`), and `source`
  the extract. Bash does the `$'…'` quoting, so the parse is the script's own.
  All 19 + 4 patterns matched exactly once.
- **Reproducing one control:** `git archive <commit> apps/worker tsconfig.base.json`
  into the scratchpad, symlink `node_modules` to the repo's
  `apps/worker/node_modules`, edit the scratch copy, then
  `./node_modules/.bin/vitest run <files>` in its own process group
  (`python3 -c 'import os,sys; os.setsid(); os.execvp(…)'`) under a watchdog —
  this runner can stall without tripping vitest's timeout. A missing
  `../web/dist` does not matter; the vitest config supplies its own assets.
- **The smoke "N ok" figure can be counted statically.** `expect`,
  `expect_body`, `expect_header`, `expect_post`, `admin_guard`,
  `provider_start` = 1 each, `shared_headers` = 5, `error_log_check` = 2, plus
  each hand-written `printf '  ok'` branch; skip the `MODE = remote` block. It
  came to 142, matching `lesson-route-smoke-controls.txt`.
- **Local R2 etag = MD5:** a scratch test putting the fixture bytes to
  `env.MEDIA` and comparing `stored.etag`. Holds under miniflare. Cloudflare's
  R2 docs (multipart-objects and workers-api-reference pages, fetched
  2026-10-11) say each multipart *part's* ETag is its MD5 and that an MD5
  checksum is kept for non-multipart objects, but do not say in so many words
  that a single put's etag is the MD5.
- **Production, read-only:** `WRANGLER_HIDE_BANNER=true pnpm exec wrangler d1
  execute codewithshayy-app --remote --json --command "<SELECT>"` from
  `apps/worker` (without the variable wrangler stalls on its version check,
  issue #68). `sqlite_master` and `d1_migrations` are worth reading before
  believing a claim about a table.

## Held on 2026-10-11

- The answers table and check order in `lessons.ts`; viewer `anyone`; six
  hours; one key import; user ids minted by `ulid()` in exactly two places
  (`auth/routes.ts:136`, `auth/oidc.ts:190`); no CHECK on `users.id`.
- Both controls tables row for row against their `.txt`; 16 + 24 = 40 tests;
  every `lessons.test.ts` test failed by a fault other than "not mounted".
- Fixtures: 353 and 253 bytes, MD5s as in `seeds/lesson.sql`; rows match what
  `admin-lessons.ts` publish writes.
- Production at 15:40 UTC: `/media/s/<ulid>` with a well-formed wrong signature
  → 403 (key present; the key check precedes the signature check, so no key
  would be 503). `/api/lessons/nothing` → 404 `{"error":"not_found"}` with no
  `Cache-Control`, the route not being deployed yet. D1: two media rows, both
  public `image/png`; one lesson, not a preview, in the draft course; courses
  `python-basics` (published, not free) and `draft`.
- `AGENTS.md` 199 lines.
