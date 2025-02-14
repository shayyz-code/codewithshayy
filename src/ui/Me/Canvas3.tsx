"use client"

import { motion } from "framer-motion"
import PrimaryBtn from "../PrimaryBtn"
import Link from "next/link"
import Projects from "./Projects"

export default function Canvas3() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-5 py-16 md:py-10 relative border-y-8 border-black flex flex-col items-center justify-center gap-16"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className=""
      >
        <h2 className="font-burbankblack text-3xl md:text-4xl text-center uppercase tracking-wider">
          Projects
        </h2>
        <p className="font-burbankmedium text-center">
          See all my projects at{" "}
          <Link
            className="text-sky-600"
            href="https://www.github.com/shayyz-code/"
          >
            github.com/shayyz-code
          </Link>
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="flex gap-5 flex-wrap justify-center md:flex-nowrap items-center"
      >
        <Projects />
      </motion.div>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className=""
      >
        <PrimaryBtn
          href="https://github.com/shayyz-code?tab=repositories"
          size="sm"
        >
          See More
        </PrimaryBtn>
      </motion.div>
    </motion.div>
  )
}
