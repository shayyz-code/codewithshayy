import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getPost, listPosts } from "@/data/posts"

// Every post is prerendered. See src/data/posts.ts — the filesystem reads only
// work at build time, so this route must never become dynamic.
export const dynamicParams = false

export function generateStaticParams() {
  return listPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) return {}

  return {
    alternates: { canonical: `/blog/${slug}` },
    title: `${post.title} — Code w/ Shayy`,
    description: post.summary,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      url: `/blog/${post.slug}`,
      ...(post.cover ? { images: [{ url: post.cover }] } : {}),
    },
  }
}

export default async function PagePost({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  if (!post) notFound()

  // A template literal keeps the bundler resolving every file under
  // content/posts as a group, rather than needing one import per post.
  const { default: Body } = await import(`@/../content/posts/${slug}.mdx`)

  return (
    <main className="min-h-screen">
      <article className="flex flex-col px-5 py-28 md:py-32 items-center">
        <div className="w-full max-w-2xl">
          <header className="border-b-4 border-black pb-6 mb-2">
            {post.tags.length > 0 && (
              <ul className="flex flex-wrap gap-x-2 text-sm">
                {post.tags.map((tag) => (
                  <li key={tag}>#{tag}</li>
                ))}
              </ul>
            )}
            <h1 className="font-burbankblack text-3xl md:text-4xl tracking-wider mt-1">
              {post.title}
            </h1>
            <time dateTime={post.date} className="font-burbankmedium text-xs">
              {new Date(`${post.date}T00:00:00Z`).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </time>
          </header>

          <Body />

          <Link
            href="/blog"
            className="inline-block font-burbankblack tracking-wider mt-12 text-sky-600"
          >
            &lt; All posts
          </Link>
        </div>
      </article>
    </main>
  )
}
