# Verification agents

Four agents, one per failure mode observed in this repository. They are not a
generic reviewer roster — each maps to specific incidents, and the prompts carry
those incidents as checklists.

| agent | trigger | exists because |
|---|---|---|
| `measurement-check` | before reporting a measured number as fact | seven wrong conclusions came from instruments answering a different question |
| `release-verify` | after a deploy or D1/R2 migration | a migration blanked every page's copy while all routes returned 200 |
| `invariant-audit` | before opening a PR | a media delete guard checked one table of two; a partial settings row emptied the site |
| `doc-truth` | after editing `AGENTS.md` or `.claude/rules/` | a false claim in these docs was used to justify a code decision |

## Registration

A new `.claude/agents/` directory is not picked up mid-session. Restart Claude
Code, then confirm with `/agents` that all four appear.

## Verification status

An agent that passes what it should reject is worse than no agent, so each one
is trusted only after it has caught the failure it was written for.

- [x] **`measurement-check` — passed 2026-08-12.** Given "the live `/projects`
      renders only 1 card, five are missing" plus the `grep -c '<article'` that
      produced it, against a saved copy of the live page. Returned `unsupported`
      and named trap class 1: the fixture is 42,181 bytes across **8 lines**, so
      on minified HTML `grep -c` can only ever return 1. Substituted three
      instruments, none line-oriented — `grep -o | wc -l` (6), a Python
      `html.parser` tag-depth stack over a fresh `urllib` fetch (6 top-level
      `<article>`, 6 distinct slugs), and `sitemap.xml` parsed as XML (6). It
      also flagged, unprompted, that a headless-browser check would have
      *confirmed* the false claim through trap class 5, since `project-grid.tsx`
      animates from `opacity: 0` under `whileInView`.

      The trap only exists against **minified** HTML; against a pretty-printed
      fixture both methods agree and it would pass for the wrong reason.

- [ ] `invariant-audit`: **inconclusive — the run was cut off**, not failed. It
      had reached "confirmed the transitive reach" on a branch with
      `force-dynamic` removed from `src/app/projects/page.tsx`, which is the
      right line of enquiry, but it never reported. Retry needs one fix: that
      seed was committed as `test: seed a force-dynamic violation`, and the agent
      has `Bash`, so `git log` hands it the answer. Recommit with a message that
      describes the change as the tidy-up it is disguised as.

- [ ] `release-verify`: reproduce a partial settings row locally — delete the row,
      upload an image as the first action — and confirm it fails rather than
      passing on the 200s.

- [ ] `doc-truth`: does not need a seeded claim. Five real ones were found by
      reading the files — see below — and `git show` reproduces them exactly.
      Run it against that commit's version of the docs; it must find at least
      those five. Finding them in the *fixed* files would be a false positive and
      means the agent is guessing.

## The five false claims, and where to get them back

Fixed in the same commit that records them. They survive in git, which is a
better home for test material than the live docs — every one of these sat in a
`paths:`-scoped file that loads automatically into any session touching
`src/middleware.ts`, so leaving them in place to preserve a test meant
re-serving, to every future session, the exact claim that had already caused one
bad code decision.

```bash
git show 6f6d1c5:.claude/rules/security.md   # all but the last
git show 6f6d1c5:.claude/rules/routes.md     # the www one
```

| file | claim | truth |
|---|---|---|
| `rules/security.md` | "middleware runs before bindings resolve so they cannot come from `wrangler.jsonc` vars" | **wrong, never true.** `src/middleware.ts:15-19` refutes it explicitly, and `allowedEmails()` reads `process.env` twenty lines below |
| `rules/security.md` | "the Access JWT is verified but identity is only logged, not enforced" | **stale.** `4d18eea` returns 401 on a non-allowlisted email |
| `rules/security.md` | "non-admin paths on the admin host 301 to the apex" | **stale.** 302 since `8903810` |
| `rules/security.md` | "there are seven exits" in the middleware | **stale, and it was the enumeration that rotted.** There are ten; the three added were the admin-root redirect, the `www` redirect and the identity 401 |
| `rules/routes.md` | "there is deliberately no `www` → apex redirect" | **stale.** `src/middleware.ts:186-197` ships one, at 301 |

Four of the five are *stale* rather than *wrong* — they were true when written and
the code moved underneath them. That is the failure mode to expect here, and it
argues for claims that carry a way to re-derive themselves: the exit count now
ships with the `awk | grep -c` that checks it, rather than a number to be
believed.
