import type { MDXComponents } from "mdx/types"
import { markdownComponents } from "@/ui/primitives/markdown-components"

// Required at the project root by @next/mdx in the App Router. The element map
// is shared with the react-markdown path used for project bodies, so posts and
// project write-ups render identically.
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...(markdownComponents as MDXComponents),
    ...components,
  }
}
