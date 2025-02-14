"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function EnrollCanvas4() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-8 relative border-y-8 border-black flex items-center justify-end"
    >
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-white  px-4 py-2 text-black max-w-md shadow-3xl shadow-primary"
      >
        <h2 className="font-burbankblack text-xl">📈 Real-World Skills</h2>
        <p>
          Master the tools and frameworks used by professionals—like HTML,
          JavaScript, TypeScript, React, and Next.js.
        </p>
      </motion.div>
    </motion.div>
  )
}
