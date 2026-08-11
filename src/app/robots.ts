import type { MetadataRoute } from "next"

// Without this the origin serves no robots.txt, and Cloudflare injects its own
// default content-signals policy — which neither disallows /admin nor points at
// a sitemap.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Defence in depth. /admin already 404s on every host but the admin one,
      // which is itself behind Access.
      disallow: "/admin",
    },
    sitemap: "https://codewithshayy.com/sitemap.xml",
    host: "https://codewithshayy.com",
  }
}
