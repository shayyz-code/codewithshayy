import Link from "next/link"
import type { PropsWithChildren } from "react"
import { isInternalHref } from "@/data/urls"

// The heavy comic-panel call-to-action. Always a link.
//
// It used to render `<Link><button>…</button></Link>` when given an href,
// which is invalid HTML — an interactive control inside an anchor — and reads
// to assistive technology as two nested controls, one of which does nothing.
// The two branches also disagreed on text colour for no reason anyone
// recorded: the button was text-black and the wrapped one text-white.
//
// The href-less branch is gone rather than fixed. Every call site passes an
// href — hero, project-card, project-detail and featured-projects — and
// nothing ever set the `handleOnClick`, `status` or `type` props it existed
// for. The admin's own submits use a plain <button>, styled locally.
//
// External links open in a new tab with `rel`, matching what
// markdown-components does for generated links.

const SIZES = {
  lg: "w-[250px] h-[70px] text-btn-lg",
  md: "w-[185px] h-[50px] text-btn-md",
  sm: "w-[130px] h-[30px] text-btn-sm",
}

export default function PrimaryBtn({
  href,
  size = "lg",
  children,
}: PropsWithChildren<{
  href: string
  size?: keyof typeof SIZES
}>) {
  const className = `bg-secondary ${SIZES[size]} font-display text-black uppercase flex items-center justify-center transition ease-in-out hover:transform hover:scale-110 z-20`

  // Resolved, not prefix-tested. `/\evil.com` starts with a slash and leaves
  // the site, so `startsWith("/")` would render it as an internal Link — and
  // the write boundary uses this same function, so the two cannot disagree
  // about what a stored href means.
  if (!isInternalHref(href)) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
