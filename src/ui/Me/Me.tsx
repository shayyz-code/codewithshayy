"use client"

import Developer from "./Developer"
import Canvas5 from "./Canvas5"
import Canvas8 from "./Canvas8"
import Contact from "./Contact"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"

// ssr: false keeps the Firestore/protobufjs import out of the server bundle.
// See ProjectsSection for why that matters on Workers.
const ProjectsSection = dynamic(() => import("./ProjectsSection"), {
  ssr: false,
})

export default function Me() {
  return (
    <section className="flex flex-col mb-16">
      <Developer />
      <Canvas5 />
      <Canvas8 />
      <ProjectsSection />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="w-[350px] mx-auto flex flex-col items-center py-16 justify-center gap-10"
      >
        <h3 className="font-burbankblack uppercase text-xl lg:text-2xl max-w-lg text-center">
          Let&apos;s Work <b className="text-secondary">Together</b>?
        </h3>
        <p className="px-10 text-center font-burbankmedium">
          {"Turn your ideas into Quality Outcomes."
            .split(" ")
            .map((word, index) => (
              <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
            ))}
        </p>
      </motion.div>
      <Contact />
    </section>
  )
}
