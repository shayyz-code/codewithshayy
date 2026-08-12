import type { Project } from "@/data/projects"
import type { Post } from "@/data/posts"
import { SITE, mediaUrl } from "@/data/urls"

// Serialisation for the public API. Kept apart from src/data so the wire shape
// can stay still while the row shape moves — the two are different contracts and
// only one of them is a promise to strangers.

export { SITE }

export type ApiProject = {
  slug: string
  title: string
  description: string
  url: string
  siteUrl: string | null
  repoUrl: string | null
  image: string | null
  role: string | null
  year: string | null
  tags: string[]
  /** Markdown. Present only on the detail endpoint; null when unauthored. */
  body?: string | null
}

/**
 * `id` is deliberately absent. It is the D1 primary key, and the public
 * identifier is `slug` — which every URL already uses. Publishing the row id
 * invites consumers to depend on it and leaks the storage layer for nothing.
 */
export function toApiProject(
  project: Project,
  { body }: { body: boolean },
): ApiProject {
  return {
    slug: project.slug,
    title: project.title,
    description: project.description,
    url: `${SITE}/projects/${project.slug}`,
    siteUrl: project.siteUrl,
    repoUrl: project.repoUrl,
    image: mediaUrl(project.mediaKey),
    role: project.role,
    year: project.year,
    tags: project.tags,
    ...(body ? { body: project.bodyMd } : {}),
  }
}

export type ApiPost = {
  slug: string
  title: string
  date: string
  summary: string
  url: string
  cover: string | null
  tags: string[]
}

/**
 * Metadata only — there is no `body`, and that is a property of the storage
 * rather than an omission. Posts are `.mdx` compiled at build time, so the
 * generated manifest carries frontmatter and nothing else; the prose exists only
 * as a compiled component. Serving it would mean shipping the raw files, which
 * the worker has no filesystem to read. `url` is the article.
 */
export function toApiPost(post: Post): ApiPost {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    summary: post.summary,
    url: `${SITE}/blog/${post.slug}`,
    cover: mediaUrl(post.cover),
    tags: post.tags,
  }
}

const HEADERS: Record<string, string> = {
  "content-type": "application/json; charset=utf-8",
  // Read-only public data with no credentials and no cookies, so `*` costs
  // nothing and is the whole point of documenting it. Our own pages never need
  // it — they are same-origin, and the CSP allows `connect-src 'self'` only.
  "access-control-allow-origin": "*",
  // Short rather than absent: these routes are dynamic and hit D1 on every miss,
  // and an admin edit should surface without a deploy. A minute is the trade.
  "cache-control": "public, max-age=60",
}

export function json(data: unknown, status = 200): Response {
  return new Response(`${JSON.stringify(data, null, 2)}\n`, {
    status,
    headers: HEADERS,
  })
}

/**
 * A 404 with a body, never a 200 carrying null. Returning null with a success
 * status makes every consumer write the same defensive branch, and the status
 * code is the part of HTTP their client library already handles.
 */
export function notFound(resource: string): Response {
  return json({ error: "not_found", resource }, 404)
}
