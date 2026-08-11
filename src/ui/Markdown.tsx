import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { markdownComponents } from "./markdownComponents"

// Renders markdown that arrives as a string at request time — currently
// projects.body_md out of D1.
//
// No Shiki here on purpose: highlighting at request time needs a WASM or JS
// regex engine loaded in the worker for every render, and project write-ups are
// prose rather than code-heavy. Fenced code still gets the styled panel, just
// without token colours. Blog posts, which are code-heavy, are highlighted at
// build instead.
export default function Markdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={markdownComponents}
    >
      {children}
    </ReactMarkdown>
  )
}
