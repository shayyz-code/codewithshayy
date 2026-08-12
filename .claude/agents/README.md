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

- [x] **`invariant-audit` — passed 2026-08-12.** Given a branch with
      `force-dynamic` removed from `src/app/projects/page.tsx`, described as
      dropping "an export that wasn't doing anything". Returned
      `violations found`.

      It measured rather than reasoned: ran `pnpm build` on the branch and
      reported the route table showing `○ /projects` where `ƒ` is required, then
      ran the CI assertion from `ci.yml:51` against that log and showed it
      failing. It traced the transitive reach — `listProjects` → `getDb()` →
      `getCloudflareContext` + `drizzle(env.DB)` — and ruled out the page being
      dynamic by other means by checking that `next.config.ts` enables neither
      `cacheComponents` nor `dynamicIO`.

      It also found something this repo had not written down: the CI build job
      has **no seeded D1**, since `seeds/ci.sql` runs in the second job, so what
      a prerendered `/projects` bakes in is an *empty* list — 30,979 bytes of
      HTML with no cards. And because `/projects/[slug]` stays dynamic,
      individual project URLs keep working while only the index that links to
      them is blank. Nothing 404s, nothing errors.

      A first run was cut off by an API limit and reported nothing. The seed for
      that attempt was committed as `test: seed a force-dynamic violation`, which
      would have handed the agent the answer through `git log` — it has `Bash`.
      The passing run used `refactor: drop a redundant export from the projects
      listing`. **Seed commit messages must not name the seeded fault.**

- [x] **`release-verify` — passed 2026-08-12.** Given a local `pnpm preview` with
      the outage reproduced exactly: a settings row holding one media key and
      twelve NULL content columns. Returned `fail`.

      It reported 12 of 14 columns NULL and **0 of 12 `DEFAULTS` strings
      rendering** on either `/` or `/me`, while every route returned 200. It
      caught that three apparent copy hits were the footer and `<title>` rather
      than settings — independently confirming the hardcoded footer. It found the
      seeded media key dangling, `/media/site/developer-abc12345.webp` → 404,
      against the `site/developer-f48be3de.webp` actually in R2.

      Two things beyond the brief. It dated the row as written outside the
      application: `updated_at` is `"1"` where all four write paths in
      `settings-admin.ts` use `strftime`, so this was not an author clearing
      fields through the admin — and it said plainly that this was observation,
      not causation. And it checked the local admin bypass against the *built
      artifact* rather than inferring, reading
      `.open-next/middleware/handler.mjs:5034` to confirm
      `ADMIN_LOCAL_BYPASS` is a runtime env read with no value inlined.

      **It also corrected its caller.** The prompt asserted the local D1 had no
      project rows; it has 3. That claim was made without checking, in a prompt to
      a verification agent, which is the one place a false premise does the most
      damage. The agent flagged it and correctly noted it did not soften the
      verdict.

      Not exercised, and it said so: the `www` and admin-host branches, since
      wrangler pins the request host locally.

- [x] **`doc-truth` — passed 2026-08-12, with one caveat that matters.** Run
      against the docs at `6f6d1c5`, which hold five known-false claims. It found
      all five, correctly classified four as stale and one as never-true, and
      dated each against the commit that falsified it — establishing that
      `8903810`, `4d18eea` and `3549ae3` all landed *before* the docs were
      written, so the text moved verbatim and nothing re-checked it.

      It then found **four more that #44 had missed**, the worst being a
      contradiction: `media.md:24` says "GIF and SVG skip the transform and stream
      through unchanged" while `security.md:26` says SVG is excluded. Both files
      are `paths:`-scoped onto media code, so a session opening
      `src/app/media/**` loads opposite instructions — and the permissive half is
      wrong, since `NO_TRANSFORM` is `new Set(["gif"])`. It also caught that the
      `workers-rs#717` citation has been CLOSED since 2025-08-04 while the
      capability never arrived, so the doc's "that issue closing is the green
      light" instruction returns the wrong answer. Tracked in #41.

      **The caveat: it also recorded a confident falsehood**, and the cause was
      the caller's. It ran concurrently with the `invariant-audit` negative test,
      read `src/app/projects/page.tsx` while `force-dynamic` was seeded out, built
      after the revert, and reconciled the two by concluding the export was
      redundant — writing into its memory an argument *against* the check that
      defends that invariant. Corrected in
      `.claude/agent-memory/doc-truth/`, with the mechanism recorded.

      **Do not run these agents concurrently.** They share a checkout, and a doc
      checker cannot tell a mutating tree from a contradictory one.

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
