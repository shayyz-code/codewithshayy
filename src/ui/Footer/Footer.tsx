import Image from "next/image";
import Link from "next/link";
import socialHrefs from "./socialHref";
import hrefs from "../Navigation/hrefs";

export default function Footer() {
  return (
    <footer className="w-screen flex flex-col gap-4 justify-center p-5 font-burbankmedium text-sm text-center">
      <p className="">
        Find an issue with this page?{" "}
        <Link
          href="https://github.com/shayyz-code/codewithshayy"
          className="text-sky-600 ml-2"
        >
          Fix it on GitHub
        </Link>
        <br />
        Need help? Email{" "}
        <span className="font-burbankblack text-base tracking-widest">
          aungminkhant.shay@gmail.com
        </span>
      </p>
      <ul className="flex justify-center flex-wrap gap-5">
        {socialHrefs.map((socialHref, index) => (
          <li
            key={index}
            className="transform transition-all ease-out duration-300 hover:text-white dark:hover:text-secondary"
          >
            <Link href={socialHref.href}>{socialHref.icon}</Link>
          </li>
        ))}
      </ul>
      <div className="font-burbankblack text-xl uppercase tracking-wider">
        Helpful Links
      </div>
      <ul className="flex items-center justify-center divide-x-2 divide-black dark:divide-white">
        {hrefs.map((href, index) => (
          <li key={index} className="px-2 hover:bg-white hover:text-black">
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
        Copyright &copy; 2024 Code w/ Shayy
      </p>
      <Link
        href="/"
        className="flex justify-center transition ease-out transform rotate-1  hover:scale-110"
      >
        <Image
          src="/logo.jpg"
          alt="logo"
          width={50}
          height={50}
          className="shadow-2xl shadow-secondary"
        />
      </Link>
    </footer>
  );
}
