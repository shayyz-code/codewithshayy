"use client"

import Hero from "./Hero"
import Developer from "./Developer"
import LookingForMaths from "./LookingForMaths"
import dynamic from "next/dynamic"

// ssr: false keeps the Firestore/protobufjs import out of the server bundle.
// See ProjectsSection for why that matters on Workers.
const ProjectsSection = dynamic(() => import("../Me/ProjectsSection"), {
  ssr: false,
})

export default function Home() {
  return (
    <section className="flex flex-col mb-16">
      <Hero />
      <Developer />
      <ProjectsSection />
      <LookingForMaths />
    </section>
  )
}
