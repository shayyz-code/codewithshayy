"use client";

import Link from "next/link";
import hrefs from "./hrefs";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Navigation() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 1.5 }}
      className="absolute top-0 left-0 w-full flex justify-end z-50 px-4 py-4 font-burbankblack text-lg tracking-wider"
    >
      <div className="container flex items-center justify-between text-blue-gray-900 max-w-full ">
        <Link href="/" className="group flex items-center cursor-pointer">
          <h1 className="flex items-center justify-center text-xl px-4 uppercase text-center">
            <Image
              src="/logo.jpg"
              alt="logo picture"
              width={100}
              height={100}
              className="-z-10 filter size-12 border-4 border-black"
            />
            <span className="text-white bg-black h-6 px-1 group-hover:text-lime-200 transition-all ease-out">
              w/ Shayy
            </span>
          </h1>
        </Link>
        <div>
          <ul className="flex gap-4 mt-0 mb-0 flex-row items-center md:gap-6 bg-transparent px-4 h-12 text-black">
            {hrefs.map((href, index) => (
              <li
                className="flex antialiased font-medium gap-x-2 leading-normal text-white hover:bg-black hover:scale-110 hover:tracking-widest transition-all ease-out duration-300"
                key={index}
              >
                <Link href={href.href} className="flex h-7 gap-x-2">
                  {href.icon}
                  <span className="hidden lg:block">{href.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.nav>
  );
}
