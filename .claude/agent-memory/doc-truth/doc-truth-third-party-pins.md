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

## Older, due for re-verification

Pinned only to 2026-08-12 in [[doc-truth-verified-2026-08-12]]: Cloudflare
Containers pricing, and `workers-rs` exposing no Images binding. See
[[doc-truth-rot-hotspots]] for why the `workers-rs` *citation* needs the grep
rather than the issue state.
