---
name: doc-truth-third-party-pins
description: Upstream facts the instruction docs depend on, each pinned to the package version it was verified against, with the command to re-derive it
metadata:
  type: project
---

Third-party claims in `AGENTS.md` / `.claude/rules/` rot fastest, and
`node_modules` is not in git — so a `git show <ref>:<path>` check cannot settle
them. Record the **version** and the **re-derive command**, never a line number.

**Why:** the point of writing an upstream fact down is to avoid re-researching
it, and a fact verified against an unnamed version is not reusable. **How to
apply:** on each run, re-read the installed version first; if it moved, re-run
the command before trusting the doc claim that rests on it.

```bash
node -e "console.log(require('./node_modules/next/package.json').version, \
require('./node_modules/@opennextjs/cloudflare/package.json').version)"
```

## `next` — server action body size limit

Verified **2026-08-13** against **next 16.3.0**. Supports the block in
`.claude/rules/media.md` and the comment in `next.config.mjs`.

- The default is `'1 MB'`, hardcoded as `defaultBodySizeLimit` and parsed to
  `1024 * 1024`.
- It is enforced inside `handleAction` **while the request body stream is
  read**, before `decodeAction` — so before any user action code runs. Both the
  edge branch (`edgeBodySize`) and the node branch (`sizeLimitTransform`,
  busboy `limits.fieldSize`) enforce it, so which runtime workerd takes does not
  change the answer.
- It throws `ApiError(413, "Body exceeded <limit> limit.…")`, but the response
  is **500**, not 413: the fetch-action catch sets `res.statusCode = 500` and
  carries Next's own TODO saying they should return 413. A no-JS MPA action
  rethrows into app-render, which renders the error boundary.
- It measures the **whole multipart body**, not the file — boundaries plus the
  hidden `$ACTION` fields — so the largest file that fits is under the limit by
  a small margin.

```bash
grep -n "defaultBodySizeLimit\|bodySizeLimitBytes\|statusCode = 500" \
  node_modules/next/dist/esm/server/app-render/action-handler.js
```

## `@opennextjs/cloudflare` — `preview` does not build

Verified **2026-08-13** against **1.20.2**. Supports the header of
`scripts/smoke.sh`.

`previewCommand` is `retrieveCompiledConfig()` → `populateCache()` →
`runWrangler(["dev", …])`. There is no build step, and because it *reads* a
compiled config it fails outright with no prior build rather than silently
building one. `pnpm preview` is `opennextjs-cloudflare build && … preview`, so
the build there comes from the first half of the script, not the second.

```bash
cat node_modules/@opennextjs/cloudflare/dist/cli/commands/preview.js
```

## `framer-motion` — reduced motion

Verified **2026-08-24** against **framer-motion 13.1.1** / **motion-dom 13.1.1**.
Supports the reduced-motion block in `.claude/rules/ui.md` and the comment in
`src/ui/layout/motion-provider.tsx`.

- `MotionConfig reducedMotion="user"` is read in `VisualElement.mount()`
  (`motion-dom/dist/es/render/VisualElement.mjs`, branch at the
  `reducedMotionConfig === "never" / "always"` lines). **Client-side only**, so
  server output cannot depend on it — which is the whole reason it is safe in a
  root layout.
- What it suppresses: `animation/interfaces/visual-element-target.mjs` does
  `shouldReduceMotion && positionalKeys.has(key) ? { type: false } : transition`.
  `positionalKeys` is `width, height, top, left, right, bottom` plus
  `transformPropOrder`. **Opacity is not positional, so fades still run** and
  only the travel becomes instant.
- **`useReducedMotion()` is not a substitute and will cause a hydration
  mismatch.** It is literally `useState(prefersReducedMotion.current)`, captured
  at first render; `initPrefersReducedMotion()` returns early with no `window`,
  so the server sees `null` and a client with the preference set sees `true`.
  Worth pinning because framer-motion's own JSDoc two lines above claims the
  hook "actively responds to changes" — the implementation does not, and there
  is a `TODO` in the source saying so.

```bash
node -e "console.log(require('./node_modules/framer-motion/package.json').version)"
grep -rn 'reducedMotionConfig ===' node_modules/.pnpm/motion-dom@*/node_modules/motion-dom/dist/es/render/VisualElement.mjs
```

## `sqlite3` CLI — exit code on a failed script

Verified **2026-08-25** against sqlite3 **3.45.3** (`/opt/anaconda3/bin`) and
**3.54.0** (`/usr/bin`, macOS). Supports the sqlite3 warning in
`.claude/rules/data.md` and the header of `scripts/backup.sh` — and contradicts
half of it.

- `foreign_keys` defaults to **OFF**. The pragma is per-connection, so it has to
  be passed on the same invocation as the `.read`.
- Without `-bail`, sqlite3 continues past a runtime error but **exits 1**. It
  does not exit 0. So a replay that loses rows to FK failures is loud.
- `PRAGMA defer_foreign_keys` "delays enforcement of all foreign key constraints
  until the outermost transaction is committed" and "is automatically switched
  off at each COMMIT or ROLLBACK" — sqlite.org/pragma.html. It defers *checks*;
  it does not defer table resolution, which is why the single-file D1 dump still
  dies with `no such table: main.tags` despite carrying the pragma.

See the conjunction hotspot in [[doc-truth-rot-hotspots]].

## `wrangler` — R2 subcommands and `--persist-to`

Re-derived **2026-08-25** against **4.125.0**, unchanged from 2026-08-24.
`r2 object` is get/put/delete only; `r2 bucket` has create, update, list, info,
delete, sippy, catalog, notification, domain, dev-url, local-uploads, lifecycle,
cors, lock. Separately: `d1 execute` accepts `--persist-to`, **`d1 export` does
not** — see [[doc-truth-verified-2026-08-25]] for the `--cwd` workaround.

## Older, due for re-verification

Cloudflare Containers pricing is still pinned only to 2026-08-12 in
[[doc-truth-verified-2026-08-12]].

`workers-rs` was **re-derived again 2026-08-25** and still holds.
`worker/src/env.rs` on `main` is 246 lines; `grep -c 'fn images('` returns 0 and
so does `grep -ic image` — there is no Images binding under any spelling, which
is the stronger check, since the narrow grep would miss a rename.
`gh issue view 717 --repo cloudflare/workers-rs` → CLOSED / COMPLETED /
`2025-08-04T20:41:31Z`, title "[Feature] Support for Images binding". Closed,
completed, still absent: the issue state remains the wrong instrument.

The doc's 16-name binding list is accurate but reads as exhaustive and is not —
`env.rs` also has `get_binding` (the generic accessor) and `object_var`.
Re-derive with `grep -oE 'pub fn [a-z_0-9]+' worker/src/env.rs | sort -u` rather
than counting the prose. That research lives in `.claude/rules/runtimes.md`, not
`AGENTS.md`. See [[doc-truth-rot-hotspots]] for why the *citation* needs the
grep rather than the issue state.
