import Me from "@/ui/Me/Me"
import { listProjects } from "@/data/projects"

// See the note in app/page.tsx — D1 must be read at request time, not build.
export const dynamic = "force-dynamic"

export default async function PageMe() {
  const projects = await listProjects()

  return (
    <main className="min-h-screen">
      <Me projects={projects} />
    </main>
  )
}
