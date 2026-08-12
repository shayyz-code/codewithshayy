---
name: doc-truth-verified-2026-08-12
description: Ledger of instruction-doc claims verified accurate on 2026-08-12, with the method used, so later runs can skip or re-check cheaply
metadata:
  type: project
---

Claims checked clean on **2026-08-12** (docs at `6f6d1c5`, source at `e08a67a`).

> **`e08a67a` was not a real commit and this run read a contaminated tree.** It
> was a deliberately seeded invariant violation on a scratch branch, created to
> negative-test `invariant-audit`, and it was reverted and the branch deleted
> partway through this run. Any claim below that was settled against
> `src/app/projects/page.tsx` is void. See the corrected entry immediately below
> and [[doc-truth-tree-contamination]] before trusting this ledger's method
> notes.

**Why:** a fact check is only reusable if it records *how* each claim was
settled. **How to apply:** re-run only the cheap checks unless the named source
file has changed since; third-party rows expire fastest.

**Settled against source, still true**
- Route rendering table in `routes.md` — every row. Method: `pnpm build` (~40s) and reading its `Route (app)` block, plus `curl` for the `/blogs` 308.

  **Corrected 2026-08-12.** This run recorded the opposite: that `/projects` has
  no `export const dynamic` yet still builds `ƒ`, so grepping for it "gives a
  false alarm". That is false and it is the most dangerous kind of false, because
  it argues *against* the check that protects the invariant. `/projects` does
  carry the export (`src/app/projects/page.tsx:6`). Removing it makes the route
  build `○`, measured directly by `invariant-audit` in the same session:

  ```
  ├ ○ /projects        <-- with the export removed
  ├ ƒ /projects        <-- with it present
  ```

  The build output is still the better instrument than the grep — a route can be
  dynamic for reasons other than the export — but the two do not disagree here,
  and a missing export is a real finding rather than a false alarm.
- `deleteMediaIfUnreferenced` checks both `projects` and `settings` — `src/data/projects/media.ts`.
- Six nullable `projects` columns — `src/data/schema.ts`. Note the *code comment* there still says "Three columns", so the doc is right and the comment is stale.
- `DEFAULTS` seeded on every settings-row insert — `src/data/settings-admin.ts`.
- `staticAssetsIncrementalCache`; MDX plugins named as strings; `$/*`→`./public/*` and `moduleResolution: bundler`; `gray-matter` a devDependency; `draft: true` filtered in `listPosts`.
- Both CI assertions in `.github/workflows/ci.yml`; every `pnpm <script>` named in the docs exists.
- `pnpm audit` reports exactly two, and exactly the two named (esbuild via `drizzle-kit>@esbuild-kit`, `@babel/core` via `next>styled-jsx`).
- Live site: apex CSP/`x-robots-tag`/HSTS headers, `robots.txt` composition after `# END Cloudflare Managed Content`, apex `/admin` 404, admin host 302 to the Access login.

**Third-party, verified 2026-08-12 — expect rot**
- Cloudflare Containers: Workers Paid, billed per 10ms active, scale-to-zero. Source: `developers.cloudflare.com/containers/pricing/`.
- `workers-rs` still exposes no Images binding: `worker/src/env.rs` has `d1`, `bucket`, `kv`, `ai`, `hyperdrive`, `secret_store`… and no `images()`. The *substance* holds; the *citation* does not — see [[doc-truth-rot-hotspots]].

**Deliberately not verified** (cost or credentials, not doubt): `pnpm preview` /
`pnpm deploy` behaviour, the `next dev` `DevalueError` at `writeHttpMetadata`,
and the Cloudflare Images `403 Blocked` on `rangoon-academy.gif`.
