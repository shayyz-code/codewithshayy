import Image from "next/image"
import Link from "next/link"
import socialLinks from "./social-links"
import navLinks from "./nav-links"

export default function Footer() {
  return (
    <footer className="w-screen flex flex-col gap-4 justify-center p-5 font-body text-sm text-center">
      {/* No contact address here. This footer renders inside the root layout,
          which six prerendered routes share — /blog, /blog/[slug], /privacy,
          /terms, /rss.xml, /robots.txt — so reading it from the settings row
          would mean either baking the build machine's database into those pages
          or marking the whole layout dynamic and losing prerendering entirely.
          Hardcoding it instead is what let the footer and the CMS drift apart.
          Contact details live once, on /me, where the route already reads D1. */}
      <p className="">
        Find an issue with this page?{" "}
        <Link
          href="https://github.com/shayyz-code/codewithshayy"
          className="text-sky-600 ml-2 transition-all ease-out hover:text-blue-600"
        >
          Fix it on GitHub
        </Link>
      </p>
      <ul className="flex justify-center flex-wrap gap-5">
        {socialLinks.map((link, index) => (
          <li
            key={index}
            className="transform transition-all ease-out duration-300 hover:text-white dark:hover:text-secondary"
          >
            <Link href={link.href}>{link.icon}</Link>
          </li>
        ))}
      </ul>
      <div className="font-display text-xl uppercase tracking-wider">
        Helpful Links
      </div>
      <ul className="flex items-center justify-center divide-x-2 divide-black dark:divide-white">
        {navLinks.map((href, index) => (
          <li
            key={index}
            className="px-2 transition-all ease-out hover:bg-white hover:text-black"
          >
            <Link href={href.href}>{href.name}</Link>
          </li>
        ))}
        <li className="px-3 hover:bg-white hover:text-black">
          <Link href="/privacy">Privacy</Link>
        </li>
        <li className="px-3 hover:bg-white hover:text-black">
          <Link href="/terms">Terms</Link>
        </li>
      </ul>
      <p className="text-xs flex justify-center items-center gap-2">
        {/* Matches LICENSE.md, which is the copy with legal weight. Static
            rather than derived: a prerendered route freezes whatever year it
            was built in, so `new Date()` would drift here and not on /me. */}
        Copyright &copy; 2026 Code w/ Shayy
      </p>
      <Link
        href="/"
        className="flex justify-center my-6 transition ease-out transform rotate-1  hover:scale-110"
      >
        <Image
          src="/logo.webp"
          unoptimized
          alt="logo"
          width={50}
          height={50}
          className="shadow-2xl shadow-secondary"
        />
      </Link>
    </footer>
  )
}
