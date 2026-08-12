import Home from "@/ui/screens/home"
import { listProjects } from "@/data/projects"
import { getSettings } from "@/data/settings"
import Markdown from "@/ui/primitives/markdown"
import { websiteSchema } from "@/data/structured-data"
import JsonLd from "@/ui/primitives/json-ld"

// Reads D1 at request time. Without this the route prerenders at build time,
// where getCloudflareContext resolves to *local* bindings — which would bake an
// empty local database into the deployed output.
export const dynamic = "force-dynamic"

export default async function PageHome() {
  const [projects, settings] = await Promise.all([
    listProjects(),
    getSettings(),
  ])

  return (
    <main className="min-h-screen">
      {/* The Person here carries a stable @id that every post and project
          references as its author, so a consumer merges them into one identity
          rather than inventing an author per page. */}
      <JsonLd data={websiteSchema(settings)} />
      <Home
        projects={projects}
        settings={settings}
        heroBody={
          settings.heroBodyMd ? (
            <Markdown>{settings.heroBodyMd}</Markdown>
          ) : null
        }
      />
    </main>
  )
}
