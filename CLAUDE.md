# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**.

```bash
pnpm dev          # next dev
pnpm build        # next build
pnpm start        # next start (needs a prior build)
pnpm lint         # eslint .
pnpm typecheck    # tsc --noEmit
```

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
