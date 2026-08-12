"use client"

import Hero from "@/ui/sections/hero"
import Developer from "@/ui/sections/developer"
import StayTuned from "@/ui/sections/stay-tuned"
import FeaturedProjects from "@/ui/sections/featured-projects"
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
