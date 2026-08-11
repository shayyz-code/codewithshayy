"use client"

import Image from "next/image"
import PrimaryBtn from "../PrimaryBtn"
import { motion } from "framer-motion"

export default function Hero() {
  return (
    <div className="relative p-10 md:px-16 py-28 md:py-40 mb-2 bg-primary">
      {/* <Image
        src="/logo.webp"
        alt="comic bg"
        fill
        style={{ objectFit: "cover" }}
        className="z-10"
        priority={true}
      /> */}
      <div className="md:relative">
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="flex justify-center md:justify-end items-center md:h-full md:absolute md:top-0 md:right-0"
        >
          <Image
            src="/logo.webp"
            alt="poster image of event"
            width={600}
            height={600}
            priority={true}
            className="mb-10 md:mb-0 z-10 shadow-2xl shadow-primary"
          />
        </motion.div>
        <motion.div
          initial={{ x: -200, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="text-white sticky z-20"
        >
          <ul className="flex gap-2 text-xs mb-5">
            <li className="px-2 py-1 bg-white font-burbankmedium text-black">
              Mingalabar
            </li>
          </ul>
          <h2 className="font-burbankblack md:[w-500px] text-3xl md:text-5xl">
            <div className="bg-black w-fit">Stop Scrolling.</div>
            <div className="bg-black w-fit">Start Coding.</div>
          </h2>
          <p className="font-burbankmedium md:w-[500px] text-base mt-5 mb-10 bg-black">
            <span className="text-xl font-burbankblack text-primary">
              Code w/ Shayy
            </span>{" "}
            is where I make coding tutorials and hacks{" "}
            <span className="font-burbankblack">on a whim</span>. I skip the
            fluff and focus on real-world tips.
          </p>
          <PrimaryBtn href="https://github.com/shayyz-code" size="md">
            Visit GitHub
          </PrimaryBtn>
        </motion.div>
      </div>
    </div>
  )
}
