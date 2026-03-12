import rectanglestack from "../icons/rectanglestack"
import calendar from "../icons/calendar"
import star from "../icons/star"
import codebracketsquare from "../icons/codebracketsquare"

interface IHrefs {
  href: string
  name: string
  icon: React.ReactElement
}

const hrefs: IHrefs[] = [
  // {
  //   href: "/blogs",
  //   name: "Blogs",
  //   icon: rectanglestack(),
  // },
  // {
  //   href: "/projects",
  //   name: "Projects",
  //   icon: calendar(),
  // },
  // {
  //   href: "/enroll",
  //   name: "Enroll",
  //   icon: star(),
  // },
  {
    href: "/me",
    name: "Me",
    icon: codebracketsquare(),
  },
]

export default hrefs
