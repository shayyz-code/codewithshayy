"use client"

import { MotionConfig } from "framer-motion"
import type { PropsWithChildren } from "react"

/**
 * Makes every animation on the site respect the visitor's reduced-motion
 * setting. Wraps the whole tree from the root layout.
 *
 * `reducedMotion="user"` rather than a `useReducedMotion()` call in each
 * section, and the difference is a hydration bug. That hook is
 * `useState(prefersReducedMotion.current)` — captured at first render, which
 * on the server has no matchMedia and on the client does. A section whose
 * `initial` depended on it would render `{opacity: 0}` on the server and
 * `false` on the client, which is a DOM mismatch: the class that already
 * forced `suppressHydrationWarning` into layout.tsx and, unhandled, leaves the
 * tree partially hydrated so server-action forms silently stop submitting.
 *
 * This config is read in `VisualElement.mount()` instead, which only ever runs
 * on the client, so the server output does not depend on it at all.
 *
 * What "user" suppresses is the right half: framer-motion passes
 * `{ type: false }` for anything in `positionalKeys` — width, height, top,
 * left, right, bottom and every transform — so the 200px springs land
 * instantly, while opacity still fades. The fade is not what causes motion
 * sickness; the travel is.
 *
 * Verified against framer-motion 13.1.1: motion-dom's VisualElement.mjs
 * branches on `reducedMotionConfig` in mount(), and
 * animation/interfaces/visual-element-target.mjs is where positionalKeys
 * turns the transition off.
 *
 * A client component because MotionConfig is one. `children` is passed
 * through as an already-rendered prop, so the server components inside stay
 * server components.
 */
export default function MotionProvider({ children }: PropsWithChildren) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
