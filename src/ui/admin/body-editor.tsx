"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { markdownComponents } from "@/ui/primitives/markdown-components"

// The one client component in the admin. Everything else is a server component
// posting to a server action; a live preview genuinely needs local state.
//
// It renders through the same element map as the public page rather than a
// separate preview stylesheet, so what shows here is what ships. That does put
// react-markdown in the client bundle, which is acceptable: this route is behind
// Access and has exactly one user.
export default function BodyEditor({
  name,
  defaultValue,
}: {
  name: string
  defaultValue: string
}) {
  const [value, setValue] = useState(defaultValue)
  const [preview, setPreview] = useState(false)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-display text-sm tracking-wide">Write-up</span>
        <div className="flex">
          <Tab active={!preview} onClick={() => setPreview(false)}>
            Edit
          </Tab>
          <Tab active={preview} onClick={() => setPreview(true)}>
            Preview
          </Tab>
        </div>
      </div>

      {/* The textarea stays mounted while previewing. Unmounting it would drop
          the field from the form, so a save from preview mode would clear the
          body. */}
      <textarea
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={16}
        className={`w-full border-4 border-black dark:border-primary bg-white dark:bg-black px-3 py-2 font-mono text-sm ${
          preview ? "hidden" : ""
        }`}
      />

      {preview && (
        <div className="border-4 border-black dark:border-primary px-4 py-2 min-h-[24rem]">
          {value.trim() === "" ? (
            <p className="font-body text-sm opacity-60">
              Nothing to preview. The public page falls back to a short line
              when this is empty.
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {value}
            </ReactMarkdown>
          )}
        </div>
      )}

      <span className="text-xs font-body opacity-60">
        markdown — headings, lists, links and tables render. Fenced code gets the
        panel but no highlighting, which matches the public page.
      </span>
    </div>
  )
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-body text-xs px-3 py-1 border-2 border-current ${
        active ? "bg-primary text-white" : "opacity-60"
      }`}
    >
      {children}
    </button>
  )
}
