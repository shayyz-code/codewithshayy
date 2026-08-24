import { describe, expect, it } from "vitest"
import {
  httpUrl,
  linkHref,
  nullable,
  projectSlug,
  required,
} from "@/lib/form"

// These are the site's only write boundary. Everything they let through ends
// up in D1 and then in an href on a project card, the detail page, the JSON
// API and the JSON-LD — four readers, one writer, so the check belongs here.

describe("nullable", () => {
  it("turns an empty field into null rather than an empty string", () => {
    // The columns are nullable because NULL means *empty* — a cleared phone
    // number has to come off the page. "" would render as a blank row.
    expect(nullable("")).toBeNull()
    expect(nullable("   ")).toBeNull()
    expect(nullable(null)).toBeNull()
  })

  it("trims, because a trailing space is not content", () => {
    expect(nullable("  hello  ")).toBe("hello")
  })

  it("rejects a File, which is what an <input type=file> puts in FormData", () => {
    expect(nullable(new File([], "x.png"))).toBeNull()
  })
})

describe("required", () => {
  it("returns the trimmed value", () => {
    expect(required(" Title ", "title")).toBe("Title")
  })

  it("names the field it is complaining about", () => {
    // The message is what the admin sees on the form, so it has to say which.
    expect(() => required("", "title")).toThrow(/title/)
    expect(() => required("   ", "title")).toThrow(/required/)
  })
})

describe("projectSlug", () => {
  it("accepts lowercase letters, digits and hyphens", () => {
    expect(projectSlug("rangoon-academy")).toBe("rangoon-academy")
    expect(projectSlug("poolang2")).toBe("poolang2")
  })

  it("rejects anything that would not survive being a URL segment", () => {
    for (const bad of ["Rangoon", "with space", "-leading", "under_score", "sl/ash"]) {
      expect(() => projectSlug(bad), bad).toThrow()
    }
  })

  it("rejects an empty slug through required", () => {
    expect(() => projectSlug("")).toThrow(/required/)
  })
})

describe("httpUrl", () => {
  it("passes http and https through unchanged", () => {
    expect(httpUrl("https://example.com/a?b=c", "site URL")).toBe(
      "https://example.com/a?b=c",
    )
    expect(httpUrl("http://example.com", "site URL")).toBe("http://example.com")
  })

  it("is null for an empty field — most projects have no live site", () => {
    expect(httpUrl("", "site URL")).toBeNull()
    expect(httpUrl(null, "site URL")).toBeNull()
  })

  it("rejects javascript:, which is the whole point", () => {
    // Stored once, rendered as an href in four places. It executes on click,
    // on this origin.
    expect(() => httpUrl("javascript:alert(1)", "site URL")).toThrow(/http/)
  })

  it("rejects the schemes a naive prefix check would miss", () => {
    for (const bad of [
      "JavaScript:alert(1)", // case
      " javascript:alert(1)", // leading space, which URL() tolerates
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
    ]) {
      expect(() => httpUrl(bad, "site URL"), bad).toThrow()
    }
  })

  it("rejects a bare hostname, which is not a URL", () => {
    expect(() => httpUrl("example.com", "site URL")).toThrow(/full URL/)
  })
})

describe("linkHref", () => {
  it("accepts a path on this site — the hero button may point inward", () => {
    expect(linkHref("/projects", "hero CTA link")).toBe("/projects")
  })

  it("accepts an absolute https URL", () => {
    expect(linkHref("https://github.com/shayyz-code", "hero CTA link")).toBe(
      "https://github.com/shayyz-code",
    )
  })

  it("rejects the off-site URLs that start with a slash", () => {
    // //host is protocol-relative. /\host is worse: it passes a
    // "starts with / but not //" check and still resolves to https://host/,
    // because browsers normalise the backslash for special schemes. An earlier
    // version of linkHref tested two characters and accepted it.
    for (const bad of [
      "//evil.example/x",
      String.raw`/\evil.example`,
      String.raw`/\\evil.example`,
      String.raw`/\/evil.example`,
    ]) {
      expect(() => linkHref(bad, "hero CTA link"), bad).toThrow()
    }
  })

  it("keeps accepting a real path next to those", () => {
    expect(linkHref("/projects", "hero CTA link")).toBe("/projects")
    expect(linkHref("/blog/hello", "hero CTA link")).toBe("/blog/hello")
  })

  it("still rejects javascript:", () => {
    expect(() => linkHref("javascript:alert(1)", "hero CTA link")).toThrow()
  })

  it("is null when cleared, so the button comes off the page", () => {
    expect(linkHref("", "hero CTA link")).toBeNull()
  })
})
