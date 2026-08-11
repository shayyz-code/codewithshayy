import generated from "./posts.generated"

// Posts are .mdx files in the repo, not database rows. This module is the seam
// that keeps that a detail: it mirrors src/data/projects.ts, so posts could move
// into D1 later without the UI changing.
//
// The list comes from a generated module rather than a filesystem read. The
// worker has no filesystem, and marking a route static is not enough to avoid
// the problem — OpenNext still invokes the server function for App Router
// pages, so a readdirSync at request time fails with
//   Error: no such file or directory, readdir '/bundle/content/posts'
//
// scripts/generate-posts-manifest.mjs writes posts.generated.ts at build time.

export type Post = {
  slug: string
  title: string
  date: string
  summary: string
  tags: string[]
  /** R2 key or /public path. Optional — the list renders fine without it. */
  cover: string | null
  draft: boolean
}

/** Published posts, newest first. Drafts never reach the build. */
export function listPosts(): Post[] {
  return generated.filter((post) => !post.draft)
}

export function getPost(slug: string): Post | null {
  return listPosts().find((post) => post.slug === slug) ?? null
}
