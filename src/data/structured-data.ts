import type { Project } from "./projects"
import type { Post } from "./posts"
import type { SiteSettings } from "./settings"
import { SITE, mediaUrl } from "./urls"

// schema.org payloads, built here rather than inline in each route so the
// identity of the person and the site is written once. Every @id below is a
// stable URI, which is what lets a consumer merge the Person emitted on / with
// the one referenced from a post's author field instead of treating them as two
// people.

const PERSON_ID = `${SITE}/me#person`
const SITE_ID = `${SITE}#website`

/** Referenced by @id from anything that needs an author or publisher. */
export function personSchema(settings: SiteSettings) {
  return {
    "@type": "Person",
    "@id": PERSON_ID,
    name: settings.developerName ?? "Aung Min Khant",
    url: `${SITE}/me`,
    jobTitle: settings.developerTitle,
    description: settings.bioMd,
    image: mediaUrl(settings.developerMediaKey),
    email: settings.contactEmail ? `mailto:${settings.contactEmail}` : undefined,
    sameAs: ["https://github.com/shayyz-code"],
  }
}

export function websiteSchema(settings: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": SITE_ID,
        url: SITE,
        name: "Code w/ Shayy",
        description: settings.heroBodyMd,
        publisher: { "@id": PERSON_ID },
        inLanguage: "en",
      },
      personSchema(settings),
    ],
  }
}

/**
 * A trail, not decoration: it is what lets a search result show
 * "codewithshayy.com › blog › this-post" instead of a bare URL.
 */
function breadcrumb(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${SITE}${step.path}`,
    })),
  }
}

export function postSchema(post: Post) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE}/blog/${post.slug}#post`,
        headline: post.title,
        description: post.summary,
        // Frontmatter carries a date but no time, so this is a plain date. It is
        // the publication date; there is no separate modified date to claim.
        datePublished: post.date,
        url: `${SITE}/blog/${post.slug}`,
        mainEntityOfPage: `${SITE}/blog/${post.slug}`,
        image: mediaUrl(post.cover) ?? `${SITE}/logo.webp`,
        keywords: post.tags,
        author: { "@id": PERSON_ID },
        publisher: { "@id": PERSON_ID },
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Blog", path: "/blog" },
        { name: post.title, path: `/blog/${post.slug}` },
      ]),
    ],
  }
}

export function projectSchema(project: Project) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        // CreativeWork rather than SoftwareApplication: these are described
        // work, not listings with an operating system and a download.
        "@type": "CreativeWork",
        "@id": `${SITE}/projects/${project.slug}#project`,
        name: project.title,
        description: project.description,
        url: `${SITE}/projects/${project.slug}`,
        image: mediaUrl(project.mediaKey) ?? undefined,
        keywords: project.tags,
        dateCreated: project.year,
        creator: { "@id": PERSON_ID },
        // Both are optional on a project, and an empty array says "none exist"
        // rather than "unknown", so the key is dropped entirely when neither is
        // set.
        ...(project.siteUrl || project.repoUrl
          ? {
              sameAs: [project.siteUrl, project.repoUrl].filter(
                (url): url is string => Boolean(url),
              ),
            }
          : {}),
      },
      breadcrumb([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
        { name: project.title, path: `/projects/${project.slug}` },
      ]),
    ],
  }
}
