import React from "react";
import facebook from "../icons/facebook";
import github from "../icons/github";
import discord from "../icons/discord";

interface IHrefs {
  href: string;
  icon: React.ReactElement;
}

const socialHrefs: IHrefs[] = [
  {
    href: "https://www.facebook.com/profile.php?id=61566963772989&mibextid=LQQJ4d",
    icon: facebook(),
  },
  {
    href: "https://github.com/shayyz-code/",
    icon: github(),
  },
  {
    href: "https://discord.gg/gBzzAzCYUF",
    icon: discord(),
  },
];

export default socialHrefs;
