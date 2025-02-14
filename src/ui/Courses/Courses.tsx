"use client"

import Image from "next/image"
import CCanvas1 from "./CCanvas1"
import CSheet from "./CSheet"
import { motion } from "framer-motion"

export default function Courses() {
  return (
    <section className="flex flex-col">
      <div className="px-10 relative mb-2 py-16">
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring" }}
          className="flex flex-col gap-2 justify-center items-center pt-5 pb-5 md:pb-10"
        >
          <h1 className="font-burbankblack text-3xl md:text-4xl uppercase tracking-wider">
            Courses
          </h1>
          <p className="text-center font-burbankmedium text-sm">
            Enroll in any course today and receive 10% off your first session.
          </p>
        </motion.header>
        <CCanvas1 />
        <CSheet />
      </div>
    </section>
  )
}
