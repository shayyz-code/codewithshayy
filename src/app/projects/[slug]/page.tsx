import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProject } from "@/data/projects"
import ProjectDetail from "@/ui/screens/project-detail"
import { projectSchema } from "@/data/structured-data"
import JsonLd from "@/ui/primitives/json-ld"

// Dynamic, not prerendered. generateStaticParams over D1 would resolve
// getCloudflareContext to *local* bindings during static generation and bake
// this machine's database into the deployed output. The blog can prerender
// because its content is files in the repo; project content is rows.
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) return {}

  return {
    title: `${project.title} — Code w/ Shayy`,
    description: project.description,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.description,
      url: `/projects/${project.slug}`,
      ...(project.mediaKey
        ? { images: [{ url: `/media/${project.mediaKey}` }] }
        : {}),
    },
  }
}

export default async function PageProject({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await getProject(slug)
  if (!project) notFound()

  return (
    <main className="min-h-screen">
      <JsonLd data={projectSchema(project)} />
      <ProjectDetail project={project} />
    </main>
  )
}
