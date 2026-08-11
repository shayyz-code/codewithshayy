# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**.

```bash
pnpm dev          # next dev
pnpm build        # next build (Node — NOT what production runs)
pnpm start        # next start (needs a prior build)
pnpm lint         # eslint .
pnpm typecheck    # tsc --noEmit
pnpm preview      # build the worker + run it under local workerd  <-- the real check
pnpm deploy       # build + deploy to Cloudflare (needs auth)
pnpm cf-typegen   # regenerate cloudflare-env.d.ts from wrangler.jsonc
```

**`pnpm build` passing does not mean the app works.** Production runs on Cloudflare Workers via `@opennextjs/cloudflare`, and `workerd` forbids things Node allows. Always finish with `pnpm preview`. Errors there do **not** appear on stdout — query them:

```bash
curl -s -X POST localhost:8771/cdn-cgi/local/explorer/api/local/observability/query \
  -H 'Content-Type: application/json' \
  -d '{"sql":"SELECT substr(message,1,300) FROM logs WHERE level=\"error\" ORDER BY ts_ms DESC LIMIT 5"}'
```

The store lives in `.wrangler/` and **persists across restarts**, so filter by `ts_ms` or you will debug a previous run's errors.

Run `pnpm cf-typegen` after every `wrangler.jsonc` binding change, or `env.X` will typecheck against a binding that doesn't exist at runtime.

`lint` + `typecheck` are the only automated checks — there are no tests and no CI. Both pass clean on `main`; keep them that way.

ESLint uses flat config in `eslint.config.mjs`. `eslint-config-next` ships a native flat-config array as of Next 15, so **no `@eslint/eslintrc` / `FlatCompat` shim is needed** — importing `eslint-config-next/core-web-vitals` pulls in the base `next` config and `next/typescript` too.

**If pnpm refuses to run any script** with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`: `node_modules/` is owned by `root` from an earlier `sudo pnpm install`, so pnpm's dependency-status check can't reinstall. Fix with `sudo rm -rf node_modules && pnpm install`. Until then, `npx eslint .` and `npx tsc --noEmit` run the same checks directly.

## Layout conventions

**Routes are thin wrappers.** A `src/app/<route>/page.tsx` does nothing but render one component from `src/ui/`:

```tsx
// src/app/me/page.tsx
export default function PageMe() {
  return <main className="min-h-screen"><Me /></main>
}
```

All real markup lives in `src/ui/<Feature>/<Feature>.tsx`. When changing what a page looks like, edit the `src/ui/` component, not the route file.

Sections within a feature are named `Canvas<N>` (`Canvas3`, `Canvas5`, `Canvas8`…). The numbers are historical and carry no meaning — they're not ordered and there are gaps.

**Path aliases:** `@/*` → `./src/*`, `$/*` → `./public/*`.

## Data access — mid-migration

The repo is being migrated from Firebase to Cloudflare D1 + R2, deployed on Workers via `@opennextjs/cloudflare`. Both shapes coexist until that lands, so check which one a given feature uses before extending it.

**Current (pre-migration) shape:** every fetch is client-side. Providers in `src/context/*.tsx` call `src/backend/*.ts` from a `useEffect` on mount, and `src/backend/*` uses the **Firebase client SDK directly from the browser**. There is no server-side data access anywhere in the app.

**Target shape:** server components reading D1 through a `src/data/*` module via `getCloudflareContext().env.DB`, with media served from R2. Prefer adding to `src/data/` over extending `src/context/` + `src/backend/`.

### Firebase cannot run on the server. This is not a preference.

`firebase/firestore` pulls in `protobufjs`, which calls `new Function` **at import time**. Workers forbids that, and the failure is `EvalError: Code generation from strings disallowed for this context`.

OpenNext bundles every route into one worker, so this is contagious in two ways:

1. Module-scope `initializeApp()` broke *every* route, including `/privacy` and `/terms`, which touch no Firebase. Hence the lazy `getDb()` in `src/backend/firebase.ts` — never reintroduce module-scope Firebase calls.
2. Merely *importing* the module server-side is enough. So the projects subtree is isolated in `src/ui/Me/ProjectsSection.tsx` and pulled in with `next/dynamic(..., { ssr: false })` from both `Home.tsx` and `Me.tsx`. Importing `@/context/projectsContext` from anything server-rendered will break the build's runtime again.

Both workarounds disappear when projects move to D1 — that's the point of moving.

### Images

The default `next/image` optimizer does not run on Workers; optimization goes through the `IMAGES` binding in `wrangler.jsonc`. Cloudflare Images returns **403 `Blocked`** for the 1 MB animated `rangoon-academy.gif`, so `ProjectCard` sets `unoptimized` for `.gif` sources. Match the extension *before* the query string — Firebase Storage URLs end in `?alt=media&token=...`, so `endsWith(".gif")` is always false.

**Known-broken images, baseline 2 on `/me`** — use this as a regression check:
- `/developer.png` 400s; `public/` actually holds `developer.PNG` (fails on macOS too).
- The `dreamyfancies-pvs` card has an empty `photo_url` in Firestore.
