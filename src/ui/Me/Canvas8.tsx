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
          My expertise includes software architecture, cross-platform apps and
          webapps development, database management, Cloud Service integration,
          and I'm currently studying deep learning. Passionate about continuous
          learning, I am expanding my skills in Rust and exploring capable ways
          of sharing it to others. Yes, I enjoy sharing my knowledge and skills.
          You can check out my community supportive projects on this site's home
          page.
        </p>
      </motion.div>
    </motion.div>
  )
}
