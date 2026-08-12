import type { Metadata } from "next"
import { listPosts } from "@/data/posts"
import BlogIndex from "@/ui/screens/blog-index"

// Static on purpose: posts are files in the repo, so everything resolves at
// build time. Do not add force-dynamic here — src/data/posts.ts reads the
// filesystem, which does not exist inside the worker.

export const metadata: Metadata = {
  alternates: { canonical: "/blog" },
  title: "Blog — Code w/ Shayy",
  description: "Notes on things I am building and learning.",
}

export default function PageBlog() {
  return (
    <main className="min-h-screen">
      <BlogIndex posts={listPosts()} />
    </main>
  )
}
