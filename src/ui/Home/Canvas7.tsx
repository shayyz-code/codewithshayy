"use client"

import { motion } from "framer-motion"

export default function Canvas7() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-8 relative border-y-8 border-black flex items-center justify-start"
    >
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-primary border-4 border-black px-4 py-2 text-white font-burbankblack text-lg md:text-2xl"
      >
        Forget your beginner struggles.
      </motion.div>
    </motion.div>
  )
}
