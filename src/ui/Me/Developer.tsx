"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function Canvas4() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="px-10 py-20 relative border-y-8 border-black flex items-center justify-end"
    >
      <Image
        src="/bg4.jpg"
        fill={true}
        alt="bg"
        style={{ objectFit: "cover" }}
        className="-z-50"
      />
      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="px-12 py-2 font-burbankblack text-xl md:text-3xl text-right w-full"
      >
        <p>AI Engineer</p>
        <p>Full Stack Developer</p>
        <p className="text-[9px] md:text-base">Co-Founder of</p>
        <p className="text-[9px] md:text-base">Rangoon Academy</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -200 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 1.5, type: "spring" }}
        className="bg-primary px-4 py-2 font-burbankblack text-lg md:text-2xl"
      >
        <Image
          src="/developer.png"
          alt="photo of developer"
          width={200}
          height={200}
          priority={true}
          className="my-2 z-10 rounded-full"
        />
        <p className="text-right">Shayy</p>
      </motion.div>
    </motion.div>
  )
}
