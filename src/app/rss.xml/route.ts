import { listPosts } from "@/data/posts"

const SITE = "https://codewithshayy.com"

// Static like the rest of the blog: generated at build from the same file list.
export const dynamic = "force-static"

const escape = (s: string) =>
  s.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c]!,
  )

export function GET() {
  const posts = listPosts()

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escape(post.title)}</title>
      <link>${SITE}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE}/blog/${post.slug}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escape(post.summary)}</description>
    </item>`,
    )
    .join("\n")

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Code w/ Shayy</title>
    <link>${SITE}/blog</link>
    <description>Notes on things I am building and learning.</description>
    <language>en</language>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  })
}
