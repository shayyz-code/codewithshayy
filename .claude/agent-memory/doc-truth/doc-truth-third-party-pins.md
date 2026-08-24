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

## Older, due for re-verification

Cloudflare Containers pricing is still pinned only to 2026-08-12 in
[[doc-truth-verified-2026-08-12]].

`workers-rs` was **re-derived 2026-08-24**: `grep -c 'fn images('` over
`worker/src/env.rs` returns 0, and the 16 bindings it does expose were checked
one at a time — `ai, analytics_engine, assets, bucket, d1, durable_object,
dynamic_dispatcher, hyperdrive, kv, queue, rate_limiter, secret_store, secret,
send_email, service, var`. That research now lives in
`.claude/rules/runtimes.md`, not `AGENTS.md`. See [[doc-truth-rot-hotspots]] for
why the *citation* needs the grep rather than the issue state.
