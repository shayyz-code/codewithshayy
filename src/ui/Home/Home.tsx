"use client"

import Hero from "./Hero"
import Developer from "./Developer"
import LookingForMaths from "./LookingForMaths"
import { Suspense } from "react"
import ProjectsContextProvider from "@/context/projectsContext"
import Canvas3 from "../Me/Canvas3"

export default function Home() {
  return (
    <section className="flex flex-col mb-16">
      <Hero />
      <Developer />
      <Suspense>
        <ProjectsContextProvider>
          <Canvas3 />
        </ProjectsContextProvider>
      </Suspense>
      <LookingForMaths />
    </section>
  )
}
