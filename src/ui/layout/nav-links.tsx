import type { ReactElement } from "react"
import Star from "@/ui/icons/star"
import RectangleStack from "@/ui/icons/rectangle-stack"
import CodeBracketSquare from "@/ui/icons/code-bracket-square"

// The nav and the footer both render these, which is why they sit in layout/
// rather than inside either component.
export type NavLink = {
  href: string
  name: string
  icon: ReactElement
}

const navLinks: NavLink[] = [
  { href: "/projects", name: "Projects", icon: <Star /> },
  { href: "/blog", name: "Blog", icon: <RectangleStack /> },
  { href: "/me", name: "Me", icon: <CodeBracketSquare /> },
]

export default navLinks
