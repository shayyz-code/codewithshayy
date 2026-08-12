import type { Metadata } from "next"
import Me from "@/ui/screens/me"
import { listProjects } from "@/data/projects"
import { getSettings } from "@/data/settings"
import Markdown from "@/ui/primitives/markdown"

// See the note in app/page.tsx — D1 must be read at request time, not build.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  alternates: { canonical: "/me" },
}

export default async function PageMe() {
  const [projects, settings] = await Promise.all([
    listProjects(),
    getSettings(),
  ])

  return (
    <main className="min-h-screen">
      <Me
        projects={projects}
        settings={settings}
        bio={settings.bioMd ? <Markdown>{settings.bioMd}</Markdown> : null}
      />
    </main>
  )
}
