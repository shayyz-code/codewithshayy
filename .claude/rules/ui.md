---
paths:
  - "src/ui/**"
---

## Layout conventions

**A route fetches; a component renders.** `src/app/<route>/page.tsx` owns the
data, the metadata and the `dynamic` export, then hands everything to one
component from `src/ui/` as props:

```tsx
// src/app/me/page.tsx, abridged
export const dynamic = "force-dynamic"

export default async function PageMe() {
  const [projects, settings] = await Promise.all([listProjects(), getSettings()])

  return (
    <main className="min-h-screen">
      <Me projects={projects} settings={settings} bio={…} />
    </main>
  )
}
```

That split is what keeps the components free of `getCloudflareContext`, so they
stay renderable without a binding. When changing what a page *looks like*, edit
the component; when changing what it *knows*, edit the route.

**Two routes deliberately break this**: `src/app/privacy/page.tsx` and
`src/app/terms/page.tsx` hold their prose inline. They read no data and are
composed once, so a `src/ui/` component would add a layer without removing one.
Do not "fix" them by extraction — but do not treat them as the pattern either.

Their line counts used to be written here — 69 and 79 — and `terms` was 83 by
2026-08-24, having rotted at `5c92284`. The number was never the point, so it
is gone rather than corrected a second time.

## `src/ui/` is grouped by role, not by page

```
primitives/  reusable and page-agnostic — primary-btn, markdown,
             hover-words, markdown-components, json-ld
layout/      the shell every page shares — navigation, footer, the two link
             lists both render (nav-links, social-links), and motion-provider
sections/    the bands a screen composes — band, hero, bio, developer,
             contact, section-label, stay-tuned, featured-projects,
             project-grid, project-card
screens/     the one component a route renders — home, me, blog-index,
             projects-index, project-detail
admin/       admin-list, project-form, body-editor, media-field,
             settings-form, field-error
icons/       one SVG component each
```

This block has gone stale on every branch that added a component — three so
far. It is here for the *grouping rule*, not as an inventory, so check it
rather than trusting it:

```bash
ls src/ui/*/ | sed 's/\.tsx$//'
```

## `layout/` renders on every page, prerendered ones included

**Nothing in `src/ui/layout/` may read D1.** `Navigation` and `Footer` are
rendered by the root layout, which has no `dynamic` export, so they run during
static generation for `/blog`, `/blog/[slug]`, `/docs`, `/privacy`, `/terms`
and `/_not-found`. A `getSettings()` there either bakes the build machine's
database into those pages or forces `dynamic` on the whole layout, which drops
prerendering for all six — including the file-based blog, which exists to avoid
database reads.

**Only pages are on that list.** An earlier version of it named `/rss.xml` and
`/robots.txt`, which render no layout at all — the first is a `route.ts`, the
second a `robots.ts` metadata route, and the footer has never run for either.
It also predated `/docs`. Derive it rather than editing it by hand: the `○` and
`●` rows of the build's `Route (app)` table, minus anything backed by
`route.ts`, `robots.ts`, `sitemap.ts`, `manifest.ts` or an icon file. That is
six of the twelve `○`/`●` rows removed, leaving exactly the six above.

`manifest.ts` was missing from those exclusions when this recipe was first
written, and `/manifest.webmanifest` is an `○` row, so following it returned
seven.

Or measure it — but grep for something the footer actually emits:

```bash
curl -s https://codewithshayy.com/docs    | grep -c "Helpful Links"  # 1
curl -s https://codewithshayy.com/rss.xml | grep -c "Helpful Links"  # 0
```

This used `"Aung Min Khant"` first, which measures something else entirely: that
string comes from the `keywords` metadata in `src/app/layout.tsx`, and metadata
resolves through the layout hierarchy whether or not a layout *component* ever
renders. Delete `Footer` from the root layout and the grep still returns 2. It
agreed with the right answer, which is how a broken instrument survives being
used. `"Code w/ Shayy"` is no better — `/rss.xml` and `/openapi.json` carry it
as a channel title.

The prerendered HTML on disk is a third instrument, and needs no network:

```bash
find .next/server/app -name '*.html' | xargs grep -lF "Helpful Links"
```

`_global-error.html` is prerendered and is deliberately not in that output: it
replaces the root layout rather than nesting inside it, which is also why it
has no `○` row to subtract.

That is why social links are still in code, and why the footer's contact email
was **removed** rather than wired to the settings row: it duplicated an address
the CMS owns, so the two drifted. Contact details live once, on `/me`, whose
route already reads D1.

This constraint used to be recorded only in `.claude/rules/data.md`, which is
scoped to `src/data/**` — so it never loaded for anyone editing the footer, and
was rediscovered from scratch. A rule belongs with the file it governs.

## Admin actions report failures through the URL, not through state

The admin forms are server components, so there is no `useActionState` to
return a message through, and a server action that throws reaches
`src/app/error.tsx` with the message stripped in production. Every string
`putMedia` raises was therefore unreachable from the browser: an unsupported
type and an oversized file were both a blank 500.

The actions catch instead, and `fail` in `src/app/admin/actions.ts` redirects
back with `?error=`, and usually `&field=` as well. The field says which form
it came from, and has three states rather than two: one of the two image fields
on `/admin/settings`; `form` for a save rejected by the validation in
`@/lib/form` — a bad slug, or a URL that is not http(s); or **absent**, which
is what the image actions on `/admin/[id]` send, since that page has only one
image form. `src/app/admin/[id]/page.tsx` therefore treats absent as the media
case. The route reads both and passes them down as props; `FieldError` renders
it. A
message under the wrong form reads as a different thing having failed, which is
what the field exists to prevent.

A query param rather than component state because these forms work without
JavaScript, and a no-JS submit is a full page load that discards state but
keeps the URL. Success redirects to the clean path, which is what clears a
stale message.

**A section belongs in `sections/` whether one page uses it or three.** Being
single-page is not what decides — `hero` and `stay-tuned` are Home-only,
`contact` is Me-only, and all three live there. Nothing under one role
directory imports from another's internals; use the alias.

`sections/band` is the full-bleed rule-topped strip every section sits in, with
the shared `whileInView` fade; `SlideIn` is its inner slide-from-left.

Sections that animate are `"use client"` for framer-motion, and one that stops
being a client component renders permanently at `opacity: 0`, because the
animations are `whileInView`.

**Not all of them animate.** `project-card.tsx` carries no directive and uses
no framer-motion; it reaches the client bundle transitively through
`project-grid.tsx`, which does. The `opacity: 0` warning does not apply to it.
This file said "Sections are all `"use client"`" until 2026-08-24, which was
false for that one file. Check rather than counting on it:

```bash
# prints the sections that are NOT client components — the exceptions, which
# is the answer. A count would have told you 9 of 10 and not which one.
for f in src/ui/sections/*.tsx; do
  head -1 "$f" | grep -q 'use client' || echo "$f"
done
```

That `initial` state is serialised into the server-rendered HTML, so **with no
JavaScript the page renders blank**. Two things handle it, both in
`src/app/layout.tsx` — neither in the sections themselves:

- `MotionProvider` wraps the tree with `<MotionConfig reducedMotion="user">`.
  framer-motion then makes every `positionalKey` — width, height, top, left,
  right, bottom and all transforms — instant, while opacity still fades. Do
  **not** reach for `useReducedMotion()` in a section instead: it is
  `useState(prefersReducedMotion.current)`, captured at first render, which the
  server and the client disagree about — a hydration mismatch, and that is the
  failure that leaves the tree partially hydrated so server-action forms
  silently stop submitting. `reducedMotionConfig` is read in
  `VisualElement.mount()`, client-side only, so the server output cannot depend
  on it.
- A `<noscript>` block forces `opacity: 1` on anything still carrying the
  inline `opacity:0`. It cannot be a plain stylesheet rule: with JS the inline
  value changes as the animation runs, and the attribute selector would stop
  matching mid-fade.

## Naming

**Every file and directory is kebab-case. Identifiers are not** — JavaScript has
no kebab identifiers, so `code-bracket-square.tsx` exports `CodeBracketSquare`
and is used as `<CodeBracketSquare />`. Name a module's main export after its
file: `social-links.tsx` exports `socialLinks`.

Icons are components, not functions returning JSX. `<Star />`, never `star()`.

**Imports:** `@/…` across directories, relative only within the same directory.

**Path aliases:** `@/*` → `./src/*`, `$/*` → `./public/*`.

<details>
<summary>Renaming files: the filesystem is case-insensitive</summary>

`core.ignorecase` is true and `touch Foo && ls foo` succeeds, so a rename
differing only in case can be dropped silently, or recorded as the old path with
new contents. This is what made `/developer.png` 400 before it was fixed.

Route every rename through a temp path, so no case is special:

```bash
mkdir -p "$(dirname "$new")"          # git mv will not create the target dir
git mv "$old" "$old.__tmp__" && git mv "$old.__tmp__" "$new"
```

That still does not cover a *directory* whose name changes only in case:
`mkdir -p src/ui/admin` resolves to an existing `src/ui/Admin`, so git records
the new path while the working tree keeps the old one. They disagree until the
directory is moved aside and back with plain `mv`. Harmless locally, wrong on
CI's case-sensitive filesystem. Afterwards:

```bash
git status --short                    # expect R, not D + ??
git ls-files | sort -f | uniq -di     # must be empty
```
</details>
