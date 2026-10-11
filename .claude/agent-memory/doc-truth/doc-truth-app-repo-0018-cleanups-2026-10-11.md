---
name: doc-truth-app-repo-0018-cleanups-2026-10-11
description: APP repo (codewithshayy-app), record 0018 at f14b531 — the two cleanups, the vitest stall, the worker test rule; probes that settle I/O-context, storage-persistence and foreign-key claims, a watchdog that kills only its own group, and the soft spots to re-check first
metadata:
  type: project
---

App repo `/Users/yahs/Documents/projects/codewithshayy-app`, branch
`feat/m4-lesson-storage` @ f14b531, checked 2026-10-11. Continues
[[doc-truth-app-repo-2026-09-18]]. Everything below was measured in a scratch
mirror (`git archive f14b531 apps/worker packages tsconfig.base.json
package.json pnpm-workspace.yaml`, node_modules symlinked with a `[ ! -e ]`
guard), never in the repo.

**Why:** the claims here are about failure paths and a test runner that stalls,
so reading the code settles little; each needed an instrument.

**How to apply:** re-check the soft spots first, and reuse the probes rather
than classifying a claim as "asserted" when ten minutes would settle it.

## Measured (versions: @cloudflare/vitest-plugin 1.1.8, vitest 4.1.11, wrangler 4.131.1)

- **The stall reproduces.** The first-form test quoted in
  `m4-data/lesson-test-hang.txt` pasted over the nested one: 6 of 6 runs
  stalled under a 45 s watchdog, no summary, no "Test timed out". Pristine
  file before and after: 6 of 6 passed in 2.5–4.5 s.
- **Each `exports.default.fetch` request has its own I/O context.** An R2 body
  opened in request 1 and read in request 2 throws "Cannot perform I/O on
  behalf of a different request"; read from the test body it throws "…a
  different Durable Object". Cloudflare's test-APIs page does not say this.
- **Storage persists between the tests of a file, D1 as well as R2.** A row
  and an object written in one test are there in the next. So
  `.claude/rules/worker.md` "each test's D1" and `vitest.config.ts` "each
  test's isolated D1" are wrong (the package has been 1.1.8 since 04c3412).
- **Foreign keys.** Local `PRAGMA foreign_keys = OFF` returns success and
  changes nothing (still 1; a violation is refused, same batch too). Production
  answered 1 on 2026-10-11. D1's foreign-keys page (last updated 2026-04-21):
  enforced by default, "user queries cannot change this". Removing the
  `lesson_versions.media_id` key in the mirror's migration fails exactly one
  test.
- D1's retry-queries page (last updated 2026-08-10) does **not** say whether a
  write that returned an error may have committed. "D1 can commit and still
  fail the call" is asserted, and simulated only by a mock.
- The kj "read end of pipe was aborted" line: 5 of 6 passing whole-file runs,
  0 of 23 single-test runs.
- Controls: 19 faults, every pattern once in `admin-lessons.ts`; both tables
  match the `.txt` row for row.

## Soft spots found at f14b531 (check first next time)

- 0018 "Not covered", the row-first bullet: "either … or …" omits a third
  path — the row delete commits but reports failure, and the re-insert fails.
- `lesson-test-hang.txt` says 52 controls runs; that was 14 faults (386fe45).
  The script now makes 19×3+10 = 67.
- "Two older tests held each request on a promise the other request settled":
  at e1cbfce only the first-arriving request waited; the second resolved the
  shared promise itself.
- `removeUnused()` comment "as record 0011 orders it": 0011 orders the row
  first for an upload and says "No delete"; object-first removal is inferred.
- `admin-media.ts` still deletes only the row on a failed put, the pattern 0018
  now calls a defect for publish.

The first four were corrected at bf44f4a (app PR #70), which also fixed the
"each test's D1" wording above; the fifth is app issue #69. Re-check them on
the next pass rather than trusting this line.

## Instruments

- Watchdog: `subprocess.Popen(..., start_new_session=True)`, then
  `os.killpg(p.pid, SIGTERM)` on timeout. That stops only the group it made.
  macOS answers **EPERM, not ESRCH**, when the group's remaining members are
  zombies, so catch `PermissionError` too or the script dies mid-loop.
- One test alone: `vitest run test/file.test.ts:<line of its it(>`.
- `console.log` from a passing test is not shown. Collect findings and
  `throw new Error(...)` at the end of the probe test.
- Parse a controls script without running it: cut the `fault …` lines into a
  scratch file, source them under a stub `fault()` that dumps its arguments
  NUL-separated, then count each pattern in `git show <sha>:<file>`.
- zsh: `"$c:apps/…"` applies the `:a` modifier to `$c`. Write `"${c}:apps/…"`.
- If every wrangler command stalls at startup, set `WRANGLER_HIDE_BANNER=true`
  (its version check hung on the network that day).
