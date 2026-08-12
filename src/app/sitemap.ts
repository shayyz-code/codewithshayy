import type { MetadataRoute } from "next"
import { listProjects } from "@/data/projects"
import { listPosts } from "@/data/posts"

// Reads D1 for the project slugs, so the same rule as every other data route
// applies: getCloudflareContext resolves to *local* bindings during static
// generation, and a prerendered sitemap would list whatever the build machine's
// database happened to hold.
export const dynamic = "force-dynamic"

const BASE = "https://codewithshayy.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, posts] = await Promise.all([
    listProjects(),
    Promise.resolve(listPosts()),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/me`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    // Added with the API. A documented endpoint nobody can find is a private
    // one, and this is the page a person lands on rather than the raw spec.
    { url: `${BASE}/docs`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.1 },
  ]

  // listProjects and listPosts both exclude unpublished entries already, so
  // nothing unreleased is advertised here.
  return [
    ...staticRoutes,
    ...projects.map((project) => ({
      url: `${BASE}/projects/${project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...posts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ]
}
