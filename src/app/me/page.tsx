import type { Metadata } from "next"
import Me from "@/ui/screens/me"
import { listProjects } from "@/data/projects"
import { getSettings } from "@/data/settings"
import Markdown from "@/ui/primitives/markdown"
import { personSchema } from "@/data/structured-data"
import JsonLd from "@/ui/primitives/json-ld"

// See the note in app/page.tsx — D1 must be read at request time, not build.
export const dynamic = "force-dynamic"

// Without its own title and description this page inherited the layout's, so it
// was indexed and shared as "Code w/ Shayy" — the same title as the home page,
// which is the one thing a title is supposed to distinguish.
export const metadata: Metadata = {
  alternates: { canonical: "/me" },
  title: "About — Code w/ Shayy",
  description:
    "Aung Min Khant, aka Shayy. A software engineer building with Rust, Go and TypeScript.",
  openGraph: {
    type: "profile",
    title: "About — Code w/ Shayy",
    description:
      "Aung Min Khant, aka Shayy. A software engineer building with Rust, Go and TypeScript.",
    url: "/me",
    // Restated because a route's openGraph replaces the layout's rather than
    // merging into it — omitting this drops the share image entirely.
    images: [{ url: "/logo.webp", width: 512, height: 512, alt: "Code w/ Shayy" }],
  },
}

export default async function PageMe() {
  const [projects, settings] = await Promise.all([
    listProjects(),
    getSettings(),
  ])

  return (
    <main className="min-h-screen">
      {/* Same @id as the Person on /, deliberately. This page is that person's
          canonical URL, so emitting it here is what makes the identity
          referenced from every post and project resolve to a described entity
          rather than a bare pointer. */}
      <JsonLd
        data={{ "@context": "https://schema.org", ...personSchema(settings) }}
      />
      <Me
        projects={projects}
        settings={settings}
        bio={settings.bioMd ? <Markdown>{settings.bioMd}</Markdown> : null}
      />
    </main>
  )
}
