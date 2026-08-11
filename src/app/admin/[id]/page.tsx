import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAdminProject } from "@/data/admin-projects"
import { updateProjectAction } from "../actions"
import ProjectForm from "@/ui/Admin/ProjectForm"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Edit project — Admin",
  robots: { index: false, follow: false },
}

export default async function PageAdminEdit({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getAdminProject(id)
  if (!project) notFound()

  return (
    <main className="min-h-screen">
      <ProjectForm
        project={project}
        action={updateProjectAction.bind(null, id)}
        heading={`Edit: ${project.title}`}
      />
    </main>
  )
}
