"use client"

import { motion } from "framer-motion"
import type { PropsWithChildren } from "react"

// The horizontal band that separates every section on / and /me: full-bleed,
// heavy rules top and bottom, fading in when scrolled into view. Canvas3,
// Canvas5 and Canvas8 each carried their own copy of this wrapper with the same
// transition values.
//
// A client component because the animation is framer-motion's whileInView.
// Anything that stops being one renders permanently at opacity 0.
export default function Band({
  align = "center",
  className = "",
  children,
}: PropsWithChildren<{
  align?: "start" | "center" | "end"
  /** Padding and layout that genuinely differ per section. */
  className?: string
}>) {
  const justify = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
  }[align]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className={`relative border-y-8 border-black flex items-center ${justify} ${className}`}
    >
      {children}
    </motion.div>
  )
}

/** The inner element shared by the label and bio bands: slides in from the left. */
export function SlideIn({
  className = "",
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -200 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
