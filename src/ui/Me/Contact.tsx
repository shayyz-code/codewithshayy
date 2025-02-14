"use client"

import { motion } from "framer-motion"
import Link from "next/link"

export default function Contact() {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="flex flex-col items-start w-[350px] md:w-[500px] px-10 py-5 mx-auto my-8 font-burbankmedium bg-white text-black border-4 border-black gap-2 shadow-2xl shadow-primary"
    >
      <Link
        href="tel:+959765072801"
        className="text-sky-600 hover:text-blue-600"
      >
        ☎️ +959765072801
      </Link>
      <Link
        href="mailto:aungminkhant.shay@gmail.com"
        className="text-sky-600 hover:text-blue-600"
      >
        📬 aungminkhant.shay@gmail.com
      </Link>
      <p>📍 73rd st, Between 107th A and 108th, Mandalay, Myanmar</p>
    </motion.div>
  )
}
