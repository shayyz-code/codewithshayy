"use client"

import { motion } from "framer-motion"

export default function Canvas8() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-0 relative border-y-8 border-black flex items-center justify-start"
    >
      <div className="absolute top-0 left-0 w-full h-full -z-50"></div>
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-white max-w-[620px] px-4 py-2 text-black font-burbankblack shadow-4xl shadow-secondary"
      >
        <p className="font-burbankmedium">
          Heyy, I&apos;m Shayy, a{" "}
          <span className="text-[#B7410E] font-burbankblack italic">Rusty</span>{" "}
          Software Engineer. I&apos;ve been coding since I was 12, and now I build
          industry projects and contribute to open source, when I can.
        </p>
      </motion.div>
    </motion.div>
  )
}
