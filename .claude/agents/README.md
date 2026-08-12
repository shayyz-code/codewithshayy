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

- [ ] `doc-truth`: no longer needs a seeded claim. `.claude/rules/` currently
      holds four real ones, found by reading the files rather than by the agent —
      see the "Known-false claims" list below. It must find at least these four.

## Known-false claims, standing at the time of writing

Left in place deliberately until `doc-truth` has been run against them. Fixing
them first would remove the only honest test material there is.

| file | claim | truth |
|---|---|---|
| `rules/security.md` | "middleware runs before bindings resolve so they cannot come from `wrangler.jsonc` vars" | **wrong, never true.** `src/middleware.ts:15-19` refutes it explicitly, and `allowedEmails()` reads `process.env` twenty lines below |
| `rules/security.md` | "the Access JWT is verified but identity is only logged, not enforced" | **stale.** `4d18eea` returns 401 on a non-allowlisted email |
| `rules/security.md` | "non-admin paths on the admin host 301 to the apex" | **stale.** 302 since `8903810` |
| `rules/routes.md` | "there is deliberately no `www` → apex redirect" | **stale.** `src/middleware.ts:186-197` ships one, at 301 |

These came across verbatim in the 499-line CLAUDE.md split, three of them already
falsified by commits made earlier the same session. The header-set diff that
guarded the split could not have caught any of it: it proves nothing was *lost*,
not that what moved is still *true*. That gap is the reason `doc-truth` exists,
and it was sitting in the repo unnoticed while its agent went unrun.
