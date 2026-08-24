import { describe, expect, it } from "vitest"
import { SITE, mediaUrl } from "@/data/urls"

// mediaUrl exists because this mapping had two implementations and one of them
// was wrong: the blog's Open Graph tags passed a raw R2 key straight into a
// URL, so a post with a cover shipped a 404 as its share image. The two stored
// shapes are the whole reason the function is not a template literal.

describe("mediaUrl", () => {
  it("resolves an R2 key through /media", () => {
    expect(mediaUrl("projects/poolang-1a2b3c4d.png")).toBe(
      `${SITE}/media/projects/poolang-1a2b3c4d.png`,
    )
  })

  it("leaves a path under public/ rooted where it already is", () => {
    // A post `cover` may be either. Sending this through /media would 404.
    expect(mediaUrl("/logo.webp")).toBe(`${SITE}/logo.webp`)
  })

  it("is null for a missing reference rather than a broken URL", () => {
    // dreamyfancies-pvs has no image at all, and the callers render
    // conditionally on null.
    expect(mediaUrl(null)).toBeNull()
    expect(mediaUrl(undefined)).toBeNull()
    expect(mediaUrl("")).toBeNull()
  })

  it("returns absolute URLs — the callers cannot rely on a base", () => {
    // Open Graph tags, JSON-LD and a cross-origin API all read this.
    for (const key of ["projects/x-1.png", "/logo.webp"]) {
      expect(mediaUrl(key)!.startsWith("https://"), key).toBe(true)
    }
  })
})
