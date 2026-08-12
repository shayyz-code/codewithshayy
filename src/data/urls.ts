// The site's own origin, and how a stored media key becomes a URL.
//
// One copy. This lived separately in sitemap.ts, rss.xml/route.ts and the API,
// and the media-key mapping existed twice — correctly in the API, and not at all
// in the blog's Open Graph tags, which passed a raw key straight into a URL.
// Fields with two code paths acquire a wrong one.

export const SITE = "https://codewithshayy.com"

/**
 * Absolute URL for a stored media reference, or null.
 *
 * Two shapes are stored. Project images and settings images are R2 keys served
 * by `/media`; a post `cover` may instead be a path under `public/`, which is
 * already rooted and served directly. Anything starting with `/` is the latter.
 *
 * Absolute rather than relative because the callers are Open Graph tags, JSON-LD
 * and a cross-origin API — none of which can rely on a base being applied.
 */
export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null
  return key.startsWith("/") ? `${SITE}${key}` : `${SITE}/media/${key}`
}
