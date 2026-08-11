import codebracketsquare from "../icons/codebracketsquare"

interface IHrefs {
  href: string
  name: string
  icon: React.ReactElement
}

// The /blogs, /projects and /enroll entries were commented out here and their
// routes are now deleted. Projects and Blog get re-added once each has a real
// route again.
const hrefs: IHrefs[] = [
  {
    href: "/me",
    name: "Me",
    icon: codebracketsquare(),
  },
]

export default hrefs
