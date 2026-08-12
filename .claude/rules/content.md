---
paths:
  - "content/posts/**"
  - "src/app/blog/**"
  - "src/mdx-components.tsx"
  - "src/data/posts.ts"
---

## Two markdown renderers, on purpose

There are two paths and they cannot be merged. `@next/mdx` is a build-time
loader for files on disk; it cannot compile a string that arrives from D1.

| content | renderer | when |
|---|---|---|
| `content/posts/*.mdx` | `@next/mdx` + `rehype-pretty-code` | build |
| `projects.body_md` | `react-markdown` + `remark-gfm` | request |

`src/ui/primitives/markdown-components.tsx` is the shared element map, so both produce
identical markup. Style markdown there, not in either caller.

The runtime path has no Shiki deliberately: highlighting per request needs a
WASM or JS regex engine in the worker, and project write-ups are prose. Fenced
code still gets the styled panel, just uncoloured.

## Blog: files, and the two traps that come with them

Posts are `content/posts/*.mdx`. `src/data/posts.ts` is the read seam, mirroring
`src/data/projects/index.ts`. Frontmatter needs `title` and `date`; `draft: true` keeps
a post out of the build.

**Nothing may read the filesystem at runtime.** A worker has no filesystem, and
marking a route static is *not* enough — OpenNext still invokes the server
function for App Router pages, so `readdirSync` fails with
`no such file or directory, readdir '/bundle/content/posts'`. The post list is
therefore generated into `src/data/posts.generated.ts` (gitignored) by
`scripts/generate-posts-manifest.mjs`, which `pnpm build` and `pnpm dev` both
run. `gray-matter` is a devDependency for the same reason.

**Prerendered pages need an incremental cache.** They are written to
`.open-next/cache`, not the assets directory, so without one every SSG route
404s with `Internal: NoFallbackError`. `open-next.config.ts` uses
`staticAssetsIncrementalCache` — correct while content only changes on deploy;
switch to `r2IncrementalCache` if on-demand revalidation is ever wanted.

MDX plugins in `next.config.mjs` are named as **strings**, not imported.
Turbopack serialises loader options and rejects function references
(`does not have serializable options`).

`rehype-pretty-code` emits `--shiki-light`/`--shiki-dark` on every token; the
rules in `globals.css` are what paint them. Remove those and code renders
correctly but entirely unstyled.
