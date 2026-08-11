# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm**.

```bash
pnpm dev          # next dev
pnpm build        # next build
pnpm start        # next start (needs a prior build)
pnpm lint         # BROKEN — see below
```

`pnpm lint` currently fails. The script still calls `next lint`, which was **removed in Next.js 16**, and there is no `eslint.config.*` or `.eslintrc*` anywhere in the repo despite `eslint` and `eslint-config-next` being installed. Until that's fixed, the only automated check is:

```bash
npx tsc --noEmit  # passes as of this writing
```

There are no tests and no CI.

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
