import { isInternalHref } from "@/data/urls"

// Parsing and validation for the admin forms.
//
// Extracted from src/app/admin/actions.ts so it can be tested. That file is
// "use server", so importing anything from it pulls in the whole D1 and R2
// data layer — these are plain functions over FormData values and have no
// business needing a binding to exercise.

/** Empty form fields arrive as "", which must become NULL rather than "". */
export function nullable(value: FormDataEntryValue | null): string | null {
  const s = typeof value === "string" ? value.trim() : ""
  return s === "" ? null : s
}

export function required(value: FormDataEntryValue | null, field: string): string {
  const s = typeof value === "string" ? value.trim() : ""
  if (s === "") throw new Error(`${field} is required`)
  return s
}

export const SLUG = /^[a-z0-9][a-z0-9-]*$/

export function projectSlug(value: FormDataEntryValue | null): string {
  const s = required(value, "slug")
  if (!SLUG.test(s)) {
    throw new Error("slug must be lowercase letters, digits and hyphens")
  }
  return s
}

// Schemes that are safe to put in an href. `javascript:` is the one that
// matters — it executes on click, on this origin.
//
// The admin is behind Cloudflare Access and has one user, so this is not the
// control that stops an attacker; it is the control that stops a paste. It sits
// at the write boundary rather than at render because there is one writer and
// several readers: siteUrl and repoUrl reach a project card, a detail page, the
// JSON API and the JSON-LD, and heroCtaHref reaches the home page button.
// Validating once on the way in beats remembering four times on the way out.
//
// `new URL` rather than a regex, because the parser is the thing that decides
// what a browser will treat as a scheme, and it handles the cases a regex
// misses — leading whitespace, tabs inside the scheme, uppercase.
const SAFE_PROTOCOLS = new Set(["http:", "https:"])

/**
 * An absolute http(s) URL, or null. For links that point off the site —
 * a project's live site and its repository.
 */
export function httpUrl(
  value: FormDataEntryValue | null,
  field: string,
): string | null {
  const s = nullable(value)
  if (s === null) return null

  let url: URL
  try {
    url = new URL(s)
  } catch {
    throw new Error(`${field} must be a full URL starting with https://`)
  }
  if (!SAFE_PROTOCOLS.has(url.protocol)) {
    throw new Error(`${field} must use http or https, not ${url.protocol}`)
  }
  return s
}

/**
 * An http(s) URL or a path on this site, or null. For the hero button, which
 * may point at either.
 *
 * A path is anything the URL parser resolves back to our own origin. This used
 * to test the first two characters — starts with "/", does not start with "//"
 * — which is the same reasoning `httpUrl` above rejects, and it was wrong the
 * same way: `/\evil.com` satisfies it and resolves to `https://evil.com/`,
 * because browsers normalise a backslash to a slash for special schemes. The
 * parser decides what a browser will do with an href; two characters do not.
 */
export function linkHref(
  value: FormDataEntryValue | null,
  field: string,
): string | null {
  const s = nullable(value)
  if (s === null) return null

  if (s.startsWith("/")) {
    if (!isInternalHref(s)) {
      throw new Error(`${field} looks like a path but resolves off-site`)
    }
    return s
  }
  return httpUrl(value, field)
}
