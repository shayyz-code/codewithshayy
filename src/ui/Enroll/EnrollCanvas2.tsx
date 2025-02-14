"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function EnrollCanvas2() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-8 relative flex items-center justify-end"
    >
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-white px-4 py-2 text-black max-w-md shadow-3xl shadow-primary"
      >
        <h2 className="font-burbankblack text-xl">🐣 Learn by Doing</h2>
        <p>
          Skip the endless theory. Our courses are designed for hands-on
          learning, where you&apos;ll build actual projects that showcase your
          skills.
        </p>
      </motion.div>
    </motion.div>
  )
}
