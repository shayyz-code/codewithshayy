// Deliberately still in code rather than in the settings table.
//
// The footer is a server component in the root layout, so it renders on every
// route — including the prerendered ones. Reading D1 from here runs that query
// during static generation: /blog fails to prerender outright, and with the
// table present it would instead bake build-time rows into a cached page.
// Verified by trying it; the build errors with
//   Error occurred prerendering page "/blog"
//
// Moving these into the CMS needs the footer out of the root layout first.
import type { ReactElement } from "react"
import Facebook from "@/ui/icons/facebook"
import GitHub from "@/ui/icons/github"
import Discord from "@/ui/icons/discord"

interface SocialLink {
  href: string;
  icon: ReactElement;
}

const socialLinks: SocialLink[] = [
  {
    href: "https://www.facebook.com/profile.php?id=61566963772989&mibextid=LQQJ4d",
    icon: <Facebook />,
  },
  {
    href: "https://github.com/shayyz-code/",
    icon: <GitHub />,
  },
  {
    href: "https://discord.gg/gBzzAzCYUF",
    icon: <Discord />,
  },
];

export default socialLinks;
