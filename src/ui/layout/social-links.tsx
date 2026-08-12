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
