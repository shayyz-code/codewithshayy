import Link from "next/link"
import type { ComponentProps } from "react"

// Shared between the two markdown paths so both render identically:
//
//   content/posts/*.mdx   @next/mdx + rehype-pretty-code   at build
//   projects.body_md      react-markdown + remark-gfm      per request
//
// They cannot be one renderer: @next/mdx is a loader for files on disk and
// cannot compile a string that arrives from D1. Sharing the element map is the
// part that can be shared.
//
// Each element takes its own intrinsic props. react-markdown also passes a
// `node` prop, which is spread through harmlessly.

export const markdownComponents = {
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="font-burbankblack text-2xl md:text-3xl tracking-wider mt-12 mb-4"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="font-burbankblack text-xl md:text-2xl tracking-wide mt-8 mb-3"
      {...props}
    />
  ),
  p: (props: ComponentProps<"p">) => <p className="my-4 leading-relaxed" {...props} />,
  ul: (props: ComponentProps<"ul">) => (
    <ul className="my-4 flex flex-col gap-2 list-disc pl-6" {...props} />
  ),
  ol: (props: ComponentProps<"ol">) => (
    <ol className="my-4 flex flex-col gap-2 list-decimal pl-6" {...props} />
  ),
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="my-6 border-l-4 border-primary pl-4 italic"
      {...props}
    />
  ),
  // Internal links go through next/link; external ones open in a new tab.
  a: ({ href = "", ...props }: ComponentProps<"a">) =>
    href.startsWith("/") ? (
      <Link href={href} className="text-sky-600 underline" {...props} />
    ) : (
      <a
        href={href}
        className="text-sky-600 underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      />
    ),
  // rehype-pretty-code emits <pre><code> with keepBackground off, so the panel
  // is styled here. The border goes blue in dark mode — border-black on a black
  // page is an invisible panel.
  pre: (props: ComponentProps<"pre">) => (
    <pre
      className="my-6 overflow-x-auto border-4 border-black dark:border-primary bg-white dark:bg-black p-4 text-sm shadow-4xl shadow-secondary/40 dark:shadow-none"
      {...props}
    />
  ),
  code: (props: ComponentProps<"code">) => <code className="font-mono" {...props} />,
  // GFM tables, only reachable on the react-markdown path.
  table: (props: ComponentProps<"table">) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-4 border-black text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentProps<"th">) => (
    <th className="border-2 border-black px-3 py-2 text-left" {...props} />
  ),
  td: (props: ComponentProps<"td">) => (
    <td className="border-2 border-black px-3 py-2" {...props} />
  ),
}
