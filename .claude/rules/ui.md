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

**Two routes deliberately break this**: `src/app/privacy/page.tsx` (69 lines) and
`src/app/terms/page.tsx` (79) hold their prose inline. They read no data and are
composed once, so a `src/ui/` component would add a layer without removing one.
Do not "fix" them by extraction — but do not treat them as the pattern either.

## `src/ui/` is grouped by role, not by page

```
primitives/  reusable and page-agnostic — primary-btn, markdown,
             hover-words, markdown-components
layout/      the shell every page shares — navigation, footer, and the two
             link lists both render (nav-links, social-links)
sections/    the bands a screen composes — band, hero, bio, developer,
             contact, section-label, stay-tuned, featured-projects,
             project-grid, project-card
screens/     the one component a route renders — home, me, blog-index,
             projects-index, project-detail
admin/       admin-list, project-form, body-editor, media-field,
             settings-form, field-error
icons/       one SVG component each
```

## `layout/` renders on every route, including the prerendered ones

**Nothing in `src/ui/layout/` may read D1.** `Navigation` and `Footer` are
rendered by the root layout, which has no `dynamic` export, so they run during
static generation for `/blog`, `/blog/[slug]`, `/privacy`, `/terms`, `/rss.xml`
and `/robots.txt`. A `getSettings()` there either bakes the build machine's
database into those pages or forces `dynamic` on the whole layout, which drops
prerendering for all six — including the file-based blog, which exists to avoid
database reads.

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

The media actions catch instead, and `failMedia` in `src/app/admin/actions.ts`
redirects back with `?error=` — plus `&field=` on `/admin/settings`, which has
two image forms. The route reads it and passes it down as a prop; `FieldError`
renders it. A query param rather than component state because these forms work
without JavaScript, and a no-JS submit is a full page load that discards state
but keeps the URL. Success redirects to the clean path, which is what clears a
stale message.

**A section belongs in `sections/` whether one page uses it or three.** Being
single-page is not what decides — `hero` and `stay-tuned` are Home-only,
`contact` is Me-only, and all three live there. Nothing under one role
directory imports from another's internals; use the alias.

`sections/band` is the full-bleed rule-topped strip every section sits in, with
the shared `whileInView` fade; `SlideIn` is its inner slide-from-left.

Sections are all `"use client"` for framer-motion. One that stops being a client
component renders permanently at `opacity: 0`, because the animations are
`whileInView`.

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
