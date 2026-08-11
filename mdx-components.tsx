import type { MDXComponents } from "mdx/types"
import Link from "next/link"

// Required at the project root by @next/mdx in the App Router. Maps MDX
// elements onto the site's type scale so posts match the rest of the design
// rather than inheriting browser defaults.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h2: (props) => (
      <h2
        className="font-burbankblack text-2xl md:text-3xl tracking-wider mt-12 mb-4"
        {...props}
      />
    ),
    h3: (props) => (
      <h3
        className="font-burbankblack text-xl md:text-2xl tracking-wide mt-8 mb-3"
        {...props}
      />
    ),
    p: (props) => <p className="my-4 leading-relaxed" {...props} />,
    ul: (props) => (
      <ul className="my-4 flex flex-col gap-2 list-disc pl-6" {...props} />
    ),
    ol: (props) => (
      <ol className="my-4 flex flex-col gap-2 list-decimal pl-6" {...props} />
    ),
    blockquote: (props) => (
      <blockquote
        className="my-6 border-l-4 border-primary pl-4 italic"
        {...props}
      />
    ),
    // Internal links go through next/link; external ones stay plain anchors.
    a: ({ href = "", ...props }) =>
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
    // rehype-pretty-code emits <pre><code>; keepBackground is off so the panel
    // styling is set here. The border goes blue in dark mode — border-black on
    // a black page renders an invisible panel.
    pre: (props) => (
      <pre
        className="my-6 overflow-x-auto border-4 border-black dark:border-primary bg-white dark:bg-black p-4 text-sm shadow-4xl shadow-secondary/40 dark:shadow-none"
        {...props}
      />
    ),
    code: (props) => <code className="font-mono" {...props} />,
    ...components,
  }
}
