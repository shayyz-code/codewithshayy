---
paths:
  - "src/ui/**"
---

## Layout conventions

**Routes are thin wrappers.** A `src/app/<route>/page.tsx` does nothing but render one component from `src/ui/`:

```tsx
// src/app/me/page.tsx
export default function PageMe() {
  return <main className="min-h-screen"><Me /></main>
}
```

All real markup lives in `src/ui/`. When changing what a page looks like, edit
the component, not the route file.

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
admin/       admin-list, project-form, body-editor, media-field
icons/       one SVG component each
```

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
