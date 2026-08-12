"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import type { Post } from "@/data/posts"

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

export default function BlogIndex({ posts }: { posts: Post[] }) {
  return (
    <section className="flex flex-col px-5 py-28 md:py-32 gap-12 items-center">
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex flex-col gap-2 items-center"
      >
        <h1 className="font-burbankblack text-3xl md:text-4xl uppercase tracking-wider">
          Blog
        </h1>
        <p className="font-burbankmedium text-center">
          Notes on things I am building and learning.
        </p>
      </motion.header>

      {posts.length === 0 ? (
        <p className="font-burbankmedium">Nothing published yet.</p>
      ) : (
        <motion.ul
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="flex flex-col gap-8 w-full max-w-2xl"
        >
          {posts.map((post) => (
            <li key={post.slug}>
              <Link
                href={`/blog/${post.slug}`}
                className="group block border-4 border-black bg-white/75 dark:bg-black/75 p-5 shadow-3xl shadow-primary hover:shadow-4xl transition-all ease-out"
              >
                {post.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-x-2 text-sm">
                    {post.tags.map((tag) => (
                      <li key={tag}>#{tag}</li>
                    ))}
                  </ul>
                )}
                <h2 className="font-burbankblack text-xl md:text-2xl mt-1 group-hover:text-primary transition-all ease-out">
                  {post.title}
                </h2>
                <time
                  dateTime={post.date}
                  className="font-burbankmedium text-xs"
                >
                  {formatDate(post.date)}
                </time>
                {post.summary && (
                  <p className="font-burbankmedium text-sm pt-3">
                    {post.summary}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </motion.ul>
      )}
    </section>
  )
}
