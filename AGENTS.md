# AGENTS.md

Instructions for coding agents working in this repository. `CLAUDE.md` is a
one-line import of this file, which is the documented way to serve Claude Code
and other agents from one source without duplicating it.

## Invariants

Each has been violated once already. They live here rather than in a path-scoped
rule because you need them *before* opening the file they concern, not after.

- **`pnpm build` passing proves almost nothing.** Production is `workerd`.
  Finish with `pnpm preview` and `./scripts/smoke.sh`.
- **Routes reading D1 must set `export const dynamic = "force-dynamic"`.**
  Otherwise the build bakes the build machine's database into the deploy and
  nothing surfaces it until production serves empty data.
- **Nothing may read the filesystem at runtime.** A worker has none, and marking
  a route static is not enough — OpenNext still invokes the server function.
- **Prerendered pages need an incremental cache**, or every SSG route 404s with
  `NoFallbackError`.
- **`deleteMediaIfUnreferenced` must check every table holding a media key.**
  Keys are content-addressed, so two rows can share one object; checking one
  table deletes an image another row still uses.
- **Anything creating the `settings` row must seed `DEFAULTS`.** The read
  fallback is row-level, so a row with one column set is authoritative and blank
  everywhere else. A partial row once emptied the live site while every route
  returned 200.
- **Every exit in `src/middleware.ts` must go through `secured()`.** A bare
  return ships that path without a CSP.
- **`public/` must hold nothing git does not track.** The build copies the
  directory, so a local stray file gets deployed. `pnpm build` enforces this via
  `scripts/check-public.sh`; a bare `next build` does not.
- **Drizzle's `with` clause must be written inline** at each call site; hoisting
  it widens the literal `true` to `boolean` and the relational types reject it.

## Verification agents

Delegate to these without being asked — the triggers are the point, since the
failures they catch are ones I did not know to doubt at the time.

| trigger | agent |
|---|---|
| after a deploy, or any D1/R2 migration | `release-verify` |
| before opening a PR | `invariant-audit` |
| before reporting a measured number as fact | `measurement-check` |
| after editing `AGENTS.md` or `.claude/rules/` | `doc-truth` |

`release-verify` exists because status codes are not verification: a migration
once blanked every page's copy while all of them returned 200.
`measurement-check` exists because seven conclusions in one session came from
instruments answering a different question than the one asked.

All four have since caught the failure they were written for, with the evidence
in `.claude/agents/README.md`. Two rules came out of running them:

- **One at a time.** They share a checkout. A run whose tree changes underneath
  it does not report the contradiction — it invents a theory that dissolves it,
  and `doc-truth` wrote one into its memory arguing against a live invariant.
- **`.claude/agent-memory/` is a lead, not a fact.** Tracked and shared, but
  written without review, and it has already held a confident falsehood.

**Moving documentation counts as editing it.** The 499-line `CLAUDE.md` split
carried across nine false claims, one of which had already been used to justify a
code decision. The header-set diff that guarded it proves nothing was *lost*, not
that what moved is still *true*.

## Where instructions live

- **`AGENTS.md`** — needed on every task regardless of which files are open.
  Target under 200 lines; longer files measurably reduce adherence.
- **`.claude/rules/*.md`** — scoped with `paths:` frontmatter, so they load only
  when a matching file is read. This is the only mechanism that actually defers
  context. `@path` imports do **not**: they expand at launch.
- **Skills** — multi-step procedures invoked on demand.

Do not consolidate the rules back into one file to "tidy up". The split is
load-bearing, not cosmetic.

Seven rules today: `content`, `data`, `media`, `routes`, `security`, `ui`, and
`runtimes` — which holds the "can we write this in Rust / Bun / Go" research and
is scoped to `wrangler.jsonc`, `open-next.config.ts` and `package.json`. It
lived here until this file ran out of room at 199 lines against its own
under-200 target — headroom, not a breach; the committed maximum has never
exceeded 199. That move traded reach for budget: it no longer loads on every task, so if the Rust question gets
re-researched anyway, move it back and cut something else.

```bash
ls .claude/rules/          # do not trust the list above; derive it
```

## Commands

Package manager is **pnpm**.

```bash
pnpm dev          # posts manifest, then next dev
pnpm build        # check-public + manifest + next build (Node, NOT production)
pnpm start        # next start (needs a prior build)
pnpm lint         # eslint .
pnpm typecheck    # posts manifest, then tsc --noEmit
pnpm test         # vitest run — pure functions only, no bindings
pnpm preview      # build the worker + run it under local workerd  <-- the real check
pnpm deploy       # build + deploy to Cloudflare (needs auth)
pnpm cf-typegen   # regenerate cloudflare-env.d.ts from wrangler.jsonc
pnpm db:backup    # dump production D1 + the R2 it references into backups/
```

`db:migrate:remote` runs `scripts/backup.sh` first: content lives only in D1, and a
migration here once blanked every page while all routes returned 200. Restore
order and the nightly job are in `.claude/rules/data.md`.

**`pnpm build` passing does not mean the app works.** Production runs on Cloudflare Workers via `@opennextjs/cloudflare`, and `workerd` forbids things Node allows. Always finish with `pnpm preview`. Errors there do **not** appear on stdout — query them:

```bash
# $PORT is whatever `preview --port` was given
curl -s -X POST localhost:$PORT/cdn-cgi/local/explorer/api/local/observability/query \
  -H 'Content-Type: application/json' \
  -d '{"sql":"SELECT substr(message,1,300) FROM logs WHERE level=\"error\" ORDER BY ts_ms DESC LIMIT 5"}'
```

The store lives in `.wrangler/` and **persists across restarts**, so filter by `ts_ms` or you will debug a previous run's errors.

Run `pnpm cf-typegen` after every `wrangler.jsonc` binding change, or `env.X` will typecheck against a binding that doesn't exist at runtime.

CI runs on every push and PR (`.github/workflows/ci.yml`): lint, typecheck,
`pnpm test`, `next build` and `check-dynamic-routes` in one job, then a second
that bundles for workerd, sets up a local D1 from `seeds/ci.sql`, and runs
`scripts/smoke.sh` — the same assertions a local run makes, since it no longer
branches on the environment. Neither job needs secrets: workerd, miniflare and
local D1 all run unauthenticated. `backup.yml` is the one workflow that does,
and it is scheduled rather than on push.

Two assertions there are load-bearing. `scripts/check-dynamic-routes.mjs` fails
if a D1-backed route was prerendered, or if a new one is not guarded — how, and
the two instruments that look right and are not, is in `.claude/rules/routes.md`.
And the smoke test catches what `next build` cannot: a filesystem read on a
dynamic route compiles cleanly and 500s under workerd. `pnpm test` is pure
functions only; anything needing a binding goes in `smoke.sh`. Both jobs pass
clean on `main`; keep them that way.

The `pnpm test` and `check-dynamic-routes` steps are newer than the last `main`
run, so confirm rather than assuming that sentence still holds:
`gh run list --branch main --limit 1`.

ESLint uses flat config in `eslint.config.mjs`. `eslint-config-next` ships a native flat-config array as of Next 15, so **no `@eslint/eslintrc` / `FlatCompat` shim is needed** — importing `eslint-config-next/core-web-vitals` pulls in the base `next` config and `next/typescript` too.

Node and pnpm are pinned — `.nvmrc`, plus `packageManager` and `engines` in
`package.json`. A locally upgraded pnpm will warn about the mismatch with
`packageManager`; that is the pin doing its job, not a problem.

## Deployment

Four hostnames, all the same worker:

```
codewithshayy.com          apex, the live site and the only indexed one
www.codewithshayy.com      301 to the apex
admin.codewithshayy.com    behind Cloudflare Access; / goes to /admin, the
                           rest 302 to the apex
codewithshayy.<sub>.workers.dev
```

All are `custom_domain: true` routes, so wrangler owns the DNS records — there
is no other host and no separate DNS to keep in sync. Cloudflare's certificate
covers `*.codewithshayy.com`.

`workers_dev: true` is set explicitly. Declaring `routes` otherwise disables
the workers.dev subdomain, which 404s every route on it.

`next build` warns that the `middleware` convention is deprecated in favour of
`proxy`. **Do not migrate**: OpenNext rejects a Node-runtime proxy, and Next
rejects `runtime: "edge"` in a proxy config, so there is no working
combination. `src/middleware.ts` stays until OpenNext supports it.

## Conventions

**Commits** are Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`,
`refactor:`, `ci:`, with `!` for breaking changes. One small PR per change,
rebase-merged onto `main`. File an issue before starting work; the PR closes it.

**Issues and PRs are records of the change, not messages to a reviewer.** No
second person, no narration of how the work felt, no conversational asides.

```
no    "You asked for…"  "Your photo was missing"  "Say the word and…"
no    "I nearly shipped…"  "my assumption was wrong"
yes   "public/ held developer.PNG while git tracked developer.png;
       the request 400d."
```

Keep every measurement, error string and verification result — that is the part
worth having in the history. Recommendations and open questions belong in
conversation with the author instead. `.github/PULL_REQUEST_TEMPLATE.md` and
`.github/ISSUE_TEMPLATE/` carry the format.

### Firebase cannot run on the server. This is not a preference.

Still true, and worth keeping in mind before adding any Firebase back: `firebase/firestore` pulls in `protobufjs`, which calls `new Function` **at import time**. Workers forbids it — `EvalError: Code generation from strings disallowed for this context`. Because OpenNext bundles every route into one worker, module-scope `initializeApp()` took down `/privacy` and `/terms` too, and merely *importing* the module server-side was enough to break it.
