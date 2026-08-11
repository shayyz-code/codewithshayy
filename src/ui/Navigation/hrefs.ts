import codebracketsquare from "../icons/codebracketsquare"
import rectanglestack from "../icons/rectanglestack"
import star from "../icons/star"

interface IHrefs {
  href: string
  name: string
  icon: React.ReactElement
}

const hrefs: IHrefs[] = [
  {
    href: "/projects",
    name: "Projects",
    icon: star(),
  },
  {
    href: "/blog",
    name: "Blog",
    icon: rectanglestack(),
  },
  {
    href: "/me",
    name: "Me",
    icon: codebracketsquare(),
  },
]

export default hrefs
