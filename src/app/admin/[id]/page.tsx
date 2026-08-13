import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAdminProject } from "@/data/projects/admin"
import { updateProjectAction } from "../actions"
import ProjectForm from "@/ui/admin/project-form"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Edit project — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdminEdit({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  // The image actions redirect back here with ?error=… when they fail. They
  // have no other way to report: the forms are server components, and a throw
  // renders the error boundary with the message stripped.
  searchParams: Promise<{ error?: string }>
}) {
  const [{ id }, { error }] = await Promise.all([params, searchParams])
  const project = await getAdminProject(id)
  if (!project) notFound()

  return (
    <main className="min-h-screen">
      <ProjectForm
        project={project}
        action={updateProjectAction.bind(null, id)}
        heading={`Edit: ${project.title}`}
        mediaError={error ?? null}
      />
    </main>
  )
}
