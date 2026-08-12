"use client"

import { motion } from "framer-motion"
import Link from "next/link"

/**
 * Every line is optional and rendered only when present, so clearing a value in
 * the admin removes the row rather than leaving a stray emoji or an empty link.
 * Clearing all three leaves the panel out entirely.
 */
export default function Contact({
  email,
  phone,
  location,
}: {
  email: string | null
  phone: string | null
  location: string | null
}) {
  if (!email && !phone && !location) return null

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.5, type: "spring" }}
      className="flex flex-col items-start w-[350px] md:w-[500px] px-10 py-5 mx-auto my-8 font-body bg-white text-black border-4 border-black gap-2 shadow-2xl shadow-primary"
    >
      {phone && (
        <Link
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className="text-sky-600 hover:text-blue-600"
        >
          ☎️ {phone}
        </Link>
      )}
      {email && (
        <Link
          href={`mailto:${email}`}
          className="text-sky-600 hover:text-blue-600"
        >
          📬 {email}
        </Link>
      )}
      {location && <p>📍 {location}</p>}
    </motion.div>
  )
}
