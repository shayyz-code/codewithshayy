"use client"

import Hero from "./Hero"
import Developer from "../sections/Developer"
import StayTuned from "./StayTuned"
import FeaturedProjects from "../sections/FeaturedProjects"
import type { Project } from "@/data/projects"

export default function Home({ projects }: { projects: Project[] }) {
  return (
    <section className="flex flex-col mb-16">
      <Hero />
      <Developer />
      <FeaturedProjects projects={projects} />
      <StayTuned />
    </section>
  )
}
