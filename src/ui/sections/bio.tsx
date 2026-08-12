"use client"

import type { ReactNode } from "react"
import Band, { SlideIn } from "./band"

/**
 * Takes already-rendered markdown rather than a string. The route is a server
 * component and renders it there, so react-markdown stays out of the client
 * bundle — this section is "use client" only because of framer-motion.
 *
 * The `bio-prose` class carries the one styling the old hardcoded markup had:
 * emphasis in Rust orange. Scoped, so it does not leak into blog posts or
 * project write-ups, which share the same element map.
 */
export default function Bio({ children }: { children: ReactNode }) {
  if (!children) return null

  return (
    <Band align="start" className="px-10 py-0">
      <SlideIn className="bio-prose bg-white max-w-[620px] px-4 py-2 text-black font-display shadow-4xl shadow-secondary">
        {children}
      </SlideIn>
    </Band>
  )
}
