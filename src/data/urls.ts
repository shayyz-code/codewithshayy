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

/**
 * Whether an href stays on this site.
 *
 * Resolved through the URL parser against SITE, never by inspecting the first
 * characters. `startsWith("/") && !startsWith("//")` looks like it covers the
 * off-site cases and does not: `/\evil.com` passes it and resolves to
 * `https://evil.com/`, because browsers normalise a backslash to a slash for
 * special schemes. Measured, not assumed —
 *   new URL("/\\evil.com", SITE).href === "https://evil.com/"
 *
 * Two callers, deliberately sharing one answer: `linkHref` in @/lib/form
 * decides what may be stored, and PrimaryBtn decides what opens in a new tab.
 * If those two disagreed, a value could be saved as internal and rendered as
 * internal while navigating off-site.
 */
export function isInternalHref(href: string): boolean {
  try {
    return new URL(href, SITE).origin === new URL(SITE).origin
  } catch {
    return false
  }
}
