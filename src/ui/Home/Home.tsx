"use client"

import Hero from "./Hero"
import Developer from "./Developer"
import StayTuned from "./StayTuned"
import Canvas3 from "../Me/Canvas3"
import type { Project } from "@/data/projects"

export default function Home({ projects }: { projects: Project[] }) {
  return (
    <section className="flex flex-col mb-16">
      <Hero />
      <Developer />
      <Canvas3 projects={projects} />
      <StayTuned />
    </section>
  )
}
