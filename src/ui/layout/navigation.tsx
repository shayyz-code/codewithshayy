"use client"

import Link from "next/link"
import navLinks from "./nav-links"
import { motion } from "framer-motion"
import Image from "next/image"

export default function Navigation() {
  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", duration: 1.5 }}
      className="absolute top-0 left-0 w-full flex justify-end z-50 px-4 py-4 font-display text-lg tracking-wider"
    >
      <div className="container flex items-center justify-between text-blue-gray-900 max-w-full ">
        {/* A span, not an h1. This renders in the root layout, so an h1 here
            is an h1 on every page — and every page that has a heading of its
            own then has two, which leaves a screen-reader user no way to tell
            the site name from the page subject. The accessible name for this
            link comes from aria-label; the image is decorative beside the
            "w/ Shayy" text and takes an empty alt rather than describing
            itself as a picture. */}
        <Link
          href="/"
          aria-label="Code w/ Shayy — home"
          className="group flex items-center cursor-pointer"
        >
          <span className="flex items-center justify-center text-xl px-4 uppercase text-center">
            <Image
              src="/logo.webp"
              unoptimized
              alt=""
              width={100}
              height={100}
              className="-z-10 filter size-12 border-4 border-black"
            />
            <span className="text-white bg-black h-6 px-1 group-hover:text-primary transition-all ease-out">
              w/ Shayy
            </span>
          </span>
        </Link>
        <div>
          <ul className="flex gap-4 mt-0 mb-0 flex-row items-center md:gap-6 bg-transparent px-4 h-12 text-black">
            {navLinks.map((href, index) => (
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
  )
}
