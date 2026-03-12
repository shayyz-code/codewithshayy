"use client"

import PrimaryBtn from "../PrimaryBtn"
import Hero from "./Hero"
import Developer from "./Developer"
import Canvas5 from "./Canvas5"
import Canvas6 from "./Canvas6"
import Canvas7 from "./Canvas7"
import Canvas8 from "./Canvas8"
import CanvasUpcomingEvent from "./CanvasUpcomingEvent"
import LookingForMaths from "./LookingForMaths"
import { motion } from "framer-motion"
import { Suspense } from "react"
import CoursesContextProvider from "@/context/coursesContext"
import ProjectsContextProvider from "@/context/projectsContext"
import Canvas3 from "../Me/Canvas3"

export default function Home() {
  return (
    <section className="flex flex-col mb-16">
      <Hero />
      <Developer />

      {/* <Suspense>
        <CoursesContextProvider>
          <Canvas3 />
        </CoursesContextProvider>
      </Suspense> */}
      <Suspense>
        <ProjectsContextProvider>
          <Canvas3 />
        </ProjectsContextProvider>
      </Suspense>

      <CanvasUpcomingEvent />
      {/* <Canvas5 />
      <Canvas6 />
      <Canvas7 />
      <Canvas8 /> */}
      {/* <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, type: "spring" }}
        className="w-[350px] mx-auto flex flex-col items-center py-16 justify-center gap-10"
      >
        <h3 className="font-burbankblack uppercase text-2xl lg:text-4xl max-w-lg text-center">
          🚀 Ready to <b className="text-secondary">code</b>?
        </h3>
        <p className="px-10 text-center">
          {"Enroll now, and start coding smarter, not harder."
            .split(" ")
            .map((word, index) => (
              <b key={index} className="hover:bg-secondary">{` ${word} `}</b>
            ))}
        </p>
        <PrimaryBtn href="/enrollnow" size="md">
          Enroll Now
        </PrimaryBtn>
      </motion.div> */}
      <LookingForMaths />
    </section>
  )
}
