import rectanglestack from "../icons/rectanglestack";
import calendar from "../icons/calendar";
import star from "../icons/star";

interface IHrefs {
  href: string;
  name: string;
  icon: React.ReactElement;
}

const hrefs: IHrefs[] = [
  {
    href: "/courses",
    name: "Courses",
    icon: rectanglestack(),
  },
  {
    href: "/events",
    name: "Events",
    icon: calendar(),
  },
  {
    href: "/enroll",
    name: "Enroll",
    icon: star(),
  },
];

export default hrefs;
