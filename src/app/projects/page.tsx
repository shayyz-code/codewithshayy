import type { Metadata } from "next"
import { listProjects } from "@/data/projects"
import ProjectsIndex from "@/ui/Projects/ProjectsIndex"

// See the note in app/page.tsx — D1 must be read at request time, not build.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  alternates: { canonical: "/projects" },
  title: "Projects — Code w/ Shayy",
  description: "Things I have designed, built and shipped.",
}

export default async function PageProjects() {
  const projects = await listProjects()

  return (
    <main className="min-h-screen">
      <ProjectsIndex projects={projects} />
    </main>
  )
}
